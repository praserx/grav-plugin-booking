<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Api;

use DateTimeImmutable;
use Grav\Plugin\Api\Controllers\AbstractApiController;
use Grav\Plugin\Api\Response\ApiResponse;
use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Domain\BookingStatus;
use Grav\Plugin\Booking\Domain\Interval;
use Grav\Plugin\Booking\ServiceLocator;
use Grav\Plugin\Booking\Validation\BookingValidator;
use Grav\Plugin\Booking\Configuration\FacilityCatalog;
use Grav\Plugin\Booking\Domain\AvailabilityBlock;
use Grav\Plugin\Booking\Domain\RecurringBlock;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use PDOException;
use Throwable;

/**
 * Admin2 API controller for booking management.
 *
 * Provides endpoints for listing, viewing, and managing bookings.
 * All endpoints require Grav API authorization with booking.admin permissions.
 */
final class AdminBookingController extends AbstractApiController
{
    /**
     * GET /booking/admin/bookings
     *
     * List bookings with optional filtering and pagination.
     */
    public function listBookings(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $params = $request->getQueryParams();

        $facilityId = (string) ($params['facility_id'] ?? '');
        $status = isset($params['status']) ? (string) $params['status'] : null;
        $limit = isset($params['limit']) ? (int) $params['limit'] : 50;
        $offset = isset($params['offset']) ? (int) $params['offset'] : 0;

        // Validate facility_id if provided
        if ($facilityId !== '' && !preg_match('/^[a-z0-9-]+$/', $facilityId)) {
            return BookingApiResponse::error('Invalid facility ID format.', 400);
        }

        // Validate status if provided
        $allowedStatuses = ['verification_pending', 'pending', 'confirmed', 'rejected', 'cancelled'];
        if ($status !== null && !in_array($status, $allowedStatuses, true)) {
            return BookingApiResponse::error('Invalid status filter. Allowed: ' . implode(', ', $allowedStatuses), 400);
        }

        // Validate pagination
        if ($limit < 1 || $limit > 200) {
            return BookingApiResponse::error('Limit must be between 1 and 200.', 400);
        }
        if ($offset < 0) {
            return BookingApiResponse::error('Offset must be non-negative.', 400);
        }

        try {
            $bookingRepo = ServiceLocator::instance()->getBookingRepository();
            $from = isset($params['from']) ? new DateTimeImmutable((string) $params['from']) : null;
            $to = isset($params['to']) ? new DateTimeImmutable((string) $params['to']) : null;
            [$bookings, $total] = $bookingRepo->listForAdmin(
                $facilityId !== '' ? $facilityId : null,
                $status,
                $from,
                $to,
                $limit,
                $offset
            );
            $bookingsArray = array_map([$this, 'bookingToArray'], $bookings);

            return ApiResponse::create([
                'bookings' => $bookingsArray,
                'count' => count($bookingsArray),
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
            ]);
        } catch (\Throwable) {
            return BookingApiResponse::error('Failed to retrieve bookings.', 500);
        }
    }

    /**
     * GET /booking/admin/bookings/{id}
     *
     * Get a single booking by UUID.
     */
    public function getBooking(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $bookingId = $this->routeId($request, 'admin/bookings');

        // Validate UUID format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $bookingId)) {
            return BookingApiResponse::error('Invalid booking ID format. Must be a UUID.', 400);
        }

        try {
            $bookingService = ServiceLocator::instance()->getBookingService();
            $booking = $bookingService->findBookingById($bookingId);

            if ($booking === null) {
                return BookingApiResponse::error('Booking not found.', 404);
            }

            return ApiResponse::create([
                'booking' => $this->bookingToArray($booking),
                'events' => ServiceLocator::instance()->getBookingRepository()->eventsFor($bookingId),
                'notifications' => ServiceLocator::instance()->getNotificationService()->deliveriesFor($bookingId),
            ]);
        } catch (\Throwable $e) {
            return BookingApiResponse::error('Failed to retrieve booking: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PATCH /booking/admin/bookings/{id}/status
     *
     * Transition a booking to a new status (confirm, reject, cancel).
     */
    public function transitionStatus(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $bookingId = $this->routeId($request, 'admin/bookings');

        $body = $request->getParsedBody();
        $newStatus = is_array($body) ? (string) ($body['status'] ?? '') : '';
        $adminNote = is_array($body) && is_string($body['admin_note'] ?? null) ? trim($body['admin_note']) : '';
        $rejectionReason = is_array($body) && is_string($body['rejection_reason'] ?? null) ? trim($body['rejection_reason']) : '';
        if (mb_strlen($adminNote) > 5000 || mb_strlen($rejectionReason) > 5000) {
            return BookingApiResponse::error('Admin notes and rejection reasons must be 5000 characters or fewer.', 422);
        }

        // Validate input
        $validation = BookingValidator::validateStatusTransition($bookingId, $newStatus);
        if (!$validation['valid']) {
            return BookingApiResponse::error('Validation failed.', 400, $validation['errors']);
        }

        try {
            $bookingService = ServiceLocator::instance()->getBookingService();
            $statusEnum = BookingStatus::from($validation['sanitized']['status']);

            $updated = $bookingService->updateStatus(
                $validation['sanitized']['booking_id'],
                $statusEnum,
                $rejectionReason !== '' ? $rejectionReason : null,
                $adminNote !== '' ? $adminNote : null,
                null,
                $this->actor($request)
            );
            ServiceLocator::instance()->getNotificationService()->dispatch($updated, $statusEnum->value);

            return ApiResponse::create([
                'booking' => $this->bookingToArray($updated),
                'message' => 'Booking status updated successfully.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return BookingApiResponse::error('Invalid status transition: ' . $e->getMessage(), 400);
        } catch (\RuntimeException $e) {
            return BookingApiResponse::error('Failed to update booking: ' . $e->getMessage(), 500);
        } catch (\Throwable $e) {
            return BookingApiResponse::error('Unexpected error: ' . $e->getMessage(), 500);
        }
    }

    /** POST /booking/admin/bookings/{id}/payment-email */
    public function sendPaymentInformation(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $bookingId = $this->routeId($request, 'admin/bookings');
        if (!$this->isUuid($bookingId)) {
            return BookingApiResponse::error('Invalid booking ID format.', 400);
        }
        try {
            $booking = ServiceLocator::instance()->getBookingService()->findBookingById($bookingId);
            if ($booking === null) {
                return BookingApiResponse::error('Booking not found.', 404);
            }
            if ($booking->status === BookingStatus::VerificationPending) {
                return BookingApiResponse::error('Verify the requester email before sending booking information.', 409);
            }
            $delivery = ServiceLocator::instance()->getNotificationService()->sendPaymentInformation($booking);
            if ($delivery['sent'] < 1) {
                return BookingApiResponse::error('Payment information email could not be sent. Check the mail configuration.', 502);
            }
            return ApiResponse::create(['sent' => true, 'message' => 'Payment information email sent.']);
        } catch (Throwable) {
            return BookingApiResponse::error('Payment information email could not be sent.', 500);
        }
    }

    /**
     * GET /booking/admin/facilities
     *
     * List configured facilities.
     */
    public function listFacilities(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        try {
            $facilitiesArray = ServiceLocator::instance()->getFacilityRepository()->all();

            return ApiResponse::create([
                'facilities' => $facilitiesArray,
                'count' => count($facilitiesArray),
            ]);
        } catch (\Throwable $e) {
            return BookingApiResponse::error('Failed to retrieve facilities: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /booking/admin/facilities/{id}
     *
     * Get a single facility by slug.
     */
    public function getFacility(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $facilityId = $this->routeId($request, 'admin/facilities');

        if (!preg_match('/^[a-z0-9-]+$/', $facilityId)) {
            return BookingApiResponse::error('Invalid facility ID format.', 400);
        }

        try {
            $facility = ServiceLocator::instance()->getFacilityRepository()->get($facilityId);
            if ($facility === null) {
                return BookingApiResponse::error('Facility not found.', 404);
            }

            return ApiResponse::create(['facility' => $facility]);
        } catch (\Throwable $e) {
            return BookingApiResponse::error('Failed to retrieve facility: ' . $e->getMessage(), 500);
        }
    }

    public function createFacility(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $data = $request->getParsedBody();
        if (!is_array($data)) {
            return BookingApiResponse::error('Invalid facility request body.', 400);
        }
        try {
            $this->validateFacility($data);
            if (ServiceLocator::instance()->getFacilityRepository()->get($data['id']) !== null) {
                return BookingApiResponse::error('A facility with this ID already exists.', 409);
            }
            ServiceLocator::instance()->getFacilityRepository()->save($data);
            ServiceLocator::instance()->refreshCatalog();
            return ApiResponse::create(['facility' => $data], 201);
        } catch (\InvalidArgumentException $e) {
            return BookingApiResponse::error('Facility validation failed: ' . $e->getMessage(), 422);
        } catch (Throwable) {
            return BookingApiResponse::error('Failed to save facility.', 500);
        }
    }

    public function updateFacility(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $id = $this->routeId($request, 'admin/facilities');
        $data = $request->getParsedBody();
        if (!preg_match('/^[a-z0-9-]+$/', $id) || !is_array($data)) {
            return BookingApiResponse::error('Invalid facility update.', 400);
        }
        if (isset($data['id']) && $data['id'] !== $id) {
            return BookingApiResponse::error('Facility IDs cannot be changed.', 400);
        }
        $data['id'] = $id;
        try {
            if (ServiceLocator::instance()->getFacilityRepository()->get($id) === null) {
                return BookingApiResponse::error('Facility not found.', 404);
            }
            $this->validateFacility($data);
            ServiceLocator::instance()->getFacilityRepository()->save($data);
            ServiceLocator::instance()->refreshCatalog();
            return ApiResponse::create(['facility' => $data]);
        } catch (\InvalidArgumentException $e) {
            return BookingApiResponse::error('Facility validation failed: ' . $e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            return BookingApiResponse::error('Facility update could not be saved: ' . $e->getMessage(), 409);
        } catch (Throwable) {
            return BookingApiResponse::error('Failed to update facility.', 500);
        }
    }

    public function deleteFacility(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $id = $this->routeId($request, 'admin/facilities');
        if (!preg_match('/^[a-z0-9-]+$/', $id)) {
            return BookingApiResponse::error('Invalid facility ID format.', 400);
        }
        try {
            if (ServiceLocator::instance()->getFacilityRepository()->get($id) === null) {
                return BookingApiResponse::error('Facility not found.', 404);
            }
            ServiceLocator::instance()->getFacilityRepository()->delete($id);
            ServiceLocator::instance()->refreshCatalog();
            return ApiResponse::create(['deleted' => true, 'id' => $id]);
        } catch (PDOException) {
            return BookingApiResponse::error('Facility cannot be deleted while it has booking or availability history.', 409);
        } catch (Throwable) {
            return BookingApiResponse::error('Facility could not be deleted.', 500);
        }
    }

    public function createBooking(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $body = $request->getParsedBody();
        if (!is_array($body)) {
            return BookingApiResponse::error('Invalid booking request body.', 400);
        }
        $validation = BookingValidator::validateBookingCreation($body);
        if (!$validation['valid']) {
            return BookingApiResponse::error('Validation failed.', 422, $validation['errors']);
        }
        $status = null;
        if (array_key_exists('status', $body)) {
            $status = BookingStatus::tryFrom((string) $body['status']);
            if ($status === null) {
                return BookingApiResponse::error('Invalid booking status.', 422);
            }
        }
        if ($status !== null && !in_array($status, [BookingStatus::Pending, BookingStatus::Confirmed], true)) {
            return BookingApiResponse::error('New bookings can only be pending or confirmed.', 422);
        }
        $data = $validation['sanitized'];
        try {
            $booking = ServiceLocator::instance()->getBookingService()->createBooking(
                $data['facility_id'],
                $data['resource_id'] ?? null,
                new Interval(new DateTimeImmutable($data['start']), new DateTimeImmutable($data['end'])),
                $data['customer_name'],
                $data['customer_email'],
                $data['customer_phone'] ?? null,
                $data['customer_note'] ?? null,
                null,
                $this->actor($request),
                $status
            );
            ServiceLocator::instance()->getNotificationService()->dispatch(
                $booking,
                $booking->status === BookingStatus::Confirmed ? 'confirmed' : 'created'
            );
            return ApiResponse::create([
                'booking' => $this->bookingToArray($booking),
                'message' => 'Booking created.',
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return BookingApiResponse::error('Invalid booking: ' . $e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            return BookingApiResponse::error('Booking could not be created: ' . $e->getMessage(), 409);
        } catch (Throwable) {
            return BookingApiResponse::error('Booking could not be created.', 500);
        }
    }

    public function editBooking(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $id = $this->routeId($request, 'admin/bookings');
        $body = $request->getParsedBody();
        if (!$this->isUuid($id) || !is_array($body)) {
            return BookingApiResponse::error('Invalid booking update.', 400);
        }
        $allowed = [
            'facility_id', 'resource_id', 'start', 'end', 'customer_name',
            'customer_email', 'customer_phone', 'customer_note', 'admin_note',
        ];
        if (array_diff(array_keys($body), $allowed) !== []) {
            return BookingApiResponse::error('Booking update contains unsupported fields.', 422);
        }
        $booking = ServiceLocator::instance()->getBookingService()->findBookingById($id);
        if ($booking === null) {
            return BookingApiResponse::error('Booking not found.', 404);
        }
        if (isset($body['start']) && !BookingValidator::isValidRfc3339((string) $body['start'])) {
            return BookingApiResponse::error('Start must be an RFC3339 timestamp with an offset.', 422);
        }
        if (isset($body['end']) && !BookingValidator::isValidRfc3339((string) $body['end'])) {
            return BookingApiResponse::error('End must be an RFC3339 timestamp with an offset.', 422);
        }
        if (isset($body['customer_email']) && (mb_strlen((string) $body['customer_email']) > 255
            || !filter_var($body['customer_email'], FILTER_VALIDATE_EMAIL))) {
            return BookingApiResponse::error('Customer email is invalid.', 422);
        }
        if (isset($body['customer_name']) && (trim((string) $body['customer_name']) === ''
            || mb_strlen((string) $body['customer_name']) > 255)) {
            return BookingApiResponse::error('Customer name must be 1–255 characters.', 422);
        }
        foreach (['customer_note' => 5000, 'admin_note' => 5000, 'customer_phone' => 50] as $field => $max) {
            if (isset($body[$field]) && mb_strlen((string) $body[$field]) > $max) {
                return BookingApiResponse::error(ucfirst(str_replace('_', ' ', $field)) . ' is too long.', 422);
            }
        }
        if (isset($body['customer_phone']) && $body['customer_phone'] !== ''
            && !preg_match('/^[\d\s\-\+\(\)\.]+$/', (string) $body['customer_phone'])) {
            return BookingApiResponse::error('Customer phone contains invalid characters.', 422);
        }
        try {
            $updated = ServiceLocator::instance()->getBookingService()->editBooking($id, $body, $this->actor($request));
            ServiceLocator::instance()->getNotificationService()->dispatch($updated, 'edited');
            return ApiResponse::create(['booking' => $this->bookingToArray($updated)]);
        } catch (\InvalidArgumentException|\RuntimeException $e) {
            return BookingApiResponse::error('Booking update failed: ' . $e->getMessage(), 409);
        } catch (Throwable) {
            return BookingApiResponse::error('Booking update failed.', 500);
        }
    }

    public function deleteBooking(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $id = $this->routeId($request, 'admin/bookings');
        if (!$this->isUuid($id)) {
            return BookingApiResponse::error('Invalid booking ID.', 400);
        }
        try {
            $service = ServiceLocator::instance()->getBookingService();
            if ($service->findBookingById($id) === null) {
                return BookingApiResponse::error('Booking not found.', 404);
            }
            $service->deleteBooking($id, $this->actor($request));
            return ApiResponse::create(['deleted' => true, 'id' => $id]);
        } catch (\RuntimeException $e) {
            return BookingApiResponse::error($e->getMessage(), 404);
        } catch (Throwable) {
            return BookingApiResponse::error('Booking could not be deleted.', 500);
        }
    }

    public function listBlocks(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $facilityId = (string) ($request->getQueryParams()['facility_id'] ?? '');
        $blocks = ServiceLocator::instance()->getAvailabilityBlockRepository()->listForAdmin(
            $facilityId === '' ? null : $facilityId
        );
        $recurring = ServiceLocator::instance()->getRecurringBlockRepository()->listForAdmin(
            $facilityId === '' ? null : $facilityId
        );
        return ApiResponse::create([
            'blocks' => array_map([$this, 'blockToArray'], $blocks),
            'recurring_blocks' => array_map([$this, 'recurringBlockToArray'], $recurring),
        ]);
    }

    public function createFixedBlock(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $body = $request->getParsedBody();
        if (!is_array($body) || !isset($body['facility_id'], $body['start'], $body['end'], $body['title'])) {
            return BookingApiResponse::error('Facility, start, end, and title are required.', 422);
        }
        if (!BookingValidator::isValidRfc3339((string) $body['start'])
            || !BookingValidator::isValidRfc3339((string) $body['end'])) {
            return BookingApiResponse::error('Block start and end must be RFC3339 timestamps with offsets.', 422);
        }
        if (trim((string) $body['title']) === '' || mb_strlen((string) $body['title']) > 255
            || mb_strlen((string) ($body['description'] ?? '')) > 5000) {
            return BookingApiResponse::error('Block title is required (maximum 255 characters) and description is limited to 5000 characters.', 422);
        }
        try {
            $block = ServiceLocator::instance()->getAvailabilityBlockService()->createFixedBlock(
                (string) $body['facility_id'],
                isset($body['resource_id']) && $body['resource_id'] !== '' ? (string) $body['resource_id'] : null,
                new Interval(new DateTimeImmutable((string) $body['start']), new DateTimeImmutable((string) $body['end'])),
                trim((string) $body['title']),
                isset($body['description']) ? trim((string) $body['description']) : null
            );
            return ApiResponse::create(['block' => $this->blockToArray($block)], 201);
        } catch (\InvalidArgumentException|\RuntimeException $e) {
            return BookingApiResponse::error('Block could not be created: ' . $e->getMessage(), 409);
        } catch (Throwable) {
            return BookingApiResponse::error('Block could not be created.', 500);
        }
    }

    public function createRecurringBlock(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $body = $request->getParsedBody();
        if (!is_array($body) || !isset($body['facility_id'], $body['weekday'], $body['start_time'],
            $body['end_time'], $body['title'])) {
            return BookingApiResponse::error('Facility, weekday, start time, end time, and title are required.', 422);
        }
        if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string) $body['start_time'])
            || !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string) $body['end_time'])
            || (int) $body['weekday'] < 1 || (int) $body['weekday'] > 7) {
            return BookingApiResponse::error('Weekday must be 1–7 and times must use 24-hour HH:MM format.', 422);
        }
        if (trim((string) $body['title']) === '' || mb_strlen((string) $body['title']) > 255
            || mb_strlen((string) ($body['description'] ?? '')) > 5000) {
            return BookingApiResponse::error('Block title is required (maximum 255 characters) and description is limited to 5000 characters.', 422);
        }
        try {
            $block = ServiceLocator::instance()->getAvailabilityBlockService()->createRecurringBlock(
                (string) $body['facility_id'],
                isset($body['resource_id']) && $body['resource_id'] !== '' ? (string) $body['resource_id'] : null,
                (int) $body['weekday'],
                (string) $body['start_time'],
                (string) $body['end_time'],
                trim((string) $body['title']),
                isset($body['description']) ? trim((string) $body['description']) : null,
                isset($body['effective_from']) ? new DateTimeImmutable((string) $body['effective_from']) : null,
                isset($body['effective_until']) ? new DateTimeImmutable((string) $body['effective_until']) : null
            );
            return ApiResponse::create(['recurring_block' => $this->recurringBlockToArray($block)], 201);
        } catch (\InvalidArgumentException|\RuntimeException $e) {
            return BookingApiResponse::error('Recurring block could not be created: ' . $e->getMessage(), 409);
        } catch (Throwable) {
            return BookingApiResponse::error('Recurring block could not be created.', 500);
        }
    }

    public function deleteFixedBlock(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $id = $this->routeId($request, 'admin/blocks/fixed');
        try {
            $block = ServiceLocator::instance()->getAvailabilityBlockRepository()->findByIdGlobal($id);
            if ($block === null) {
                return BookingApiResponse::error('Block not found.', 404);
            }
            ServiceLocator::instance()->getAvailabilityBlockService()->deleteFixedBlock(
                $block->id,
                $block->facilityId,
                $block->interval->start
            );
            return ApiResponse::create(['deleted' => true, 'id' => $id]);
        } catch (Throwable) {
            return BookingApiResponse::error('Block could not be deleted.', 500);
        }
    }

    public function deleteRecurringBlock(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        $id = $this->routeId($request, 'admin/blocks/recurring');
        try {
            $block = ServiceLocator::instance()->getRecurringBlockRepository()->findById($id);
            if ($block === null) {
                return BookingApiResponse::error('Recurring block not found.', 404);
            }
            ServiceLocator::instance()->getAvailabilityBlockService()->deleteRecurringBlock($id);
            return ApiResponse::create(['deleted' => true, 'id' => $id]);
        } catch (Throwable) {
            return BookingApiResponse::error('Recurring block could not be deleted.', 500);
        }
    }

    public function previewMigration(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        return ApiResponse::create(['migration' => ServiceLocator::instance()->getLegacyDataImporter()->preview()]);
    }

    public function importLegacyData(ServerRequestInterface $request): ResponseInterface
    {
        $this->requirePermission($request, 'booking.admin');
        try {
            $result = ServiceLocator::instance()->getLegacyDataImporter()->import();
            ServiceLocator::instance()->refreshCatalog();
            return ApiResponse::create(['migration' => $result]);
        } catch (\RuntimeException $e) {
            return BookingApiResponse::error($e->getMessage(), 409);
        } catch (Throwable) {
            return BookingApiResponse::error('Legacy data import failed. Source files were preserved.', 500);
        }
    }

    private function routeId(ServerRequestInterface $request, string $routePrefix): string
    {
        $path = rawurldecode($request->getUri()->getPath());
        $pattern = '~/' . preg_quote($routePrefix, '~') . '/([^/]+)(?:/(?:status|payment-email))?/?$~';
        if (preg_match($pattern, $path, $matches)) {
            return $matches[1];
        }

        $routeParams = $request->getAttribute('routeParams', $request->getAttribute('route_params', []));
        if (is_array($routeParams) && isset($routeParams['id']) && is_scalar($routeParams['id'])) {
            return (string) $routeParams['id'];
        }

        $id = $request->getAttribute('id');
        return is_scalar($id) ? (string) $id : '';
    }

    private function validateFacility(array $data): void
    {
        if (!isset($data['id']) || !is_string($data['id']) || !preg_match('/^[a-z0-9-]{1,80}$/', $data['id'])) {
            throw new \InvalidArgumentException('Facility ID must use lowercase letters, numbers, and hyphens.');
        }
        if (strlen(json_encode($data, JSON_THROW_ON_ERROR)) > 100000) {
            throw new \InvalidArgumentException('Facility configuration exceeds the size limit.');
        }
        if (isset($data['resources']) && !is_array($data['resources'])) {
            throw new \InvalidArgumentException('Resources must be a list.');
        }
        try {
            new FacilityCatalog([$data]);
        } catch (Throwable $e) {
            throw new \InvalidArgumentException($e->getMessage(), 0, $e);
        }
        $resourceIds = [];
        foreach (($data['resources'] ?? []) as $resource) {
            $resourceId = is_array($resource) ? ($resource['id'] ?? null) : null;
            if (!is_string($resourceId) || isset($resourceIds[$resourceId])) {
                throw new \InvalidArgumentException('Resource IDs must be unique strings.');
            }
            $resourceIds[$resourceId] = true;
        }
        $notifications = $data['notifications'] ?? [];
        if (!is_array($notifications)) {
            throw new \InvalidArgumentException('Notification settings must be an object.');
        }
        $recipients = $notifications['admin_recipients'] ?? [];
        if (!is_array($recipients) || count($recipients) > 20) {
            throw new \InvalidArgumentException('Up to 20 notification recipients may be configured.');
        }
        foreach ($recipients as $recipient) {
            if (!is_string($recipient) || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException('Every administrator recipient must be a valid email address.');
            }
        }
        $templates = $notifications['templates'] ?? [];
        if (!is_array($templates) || count($templates) > 24) {
            throw new \InvalidArgumentException('Email template settings are invalid.');
        }
        $allowedTemplates = [
            'email_layout_html', 'verification_subject', 'verification_body', 'created_admin_subject', 'created_admin_body',
            'created_requester_subject', 'created_requester_body', 'confirmed_subject', 'confirmed_body_html',
            'payment_subject', 'payment_body_html', 'rejected_subject', 'rejected_body',
            'cancelled_subject', 'cancelled_body', 'edited_subject', 'edited_body',
        ];
        foreach ($templates as $key => $value) {
            if (!is_string($key) || !in_array($key, $allowedTemplates, true) || !is_string($value)) {
                throw new \InvalidArgumentException('Email template settings contain an unsupported value.');
            }
            $limit = str_ends_with($key, '_subject') ? 255 : 30000;
            if (mb_strlen($value) > $limit) {
                throw new \InvalidArgumentException('Email template text is too long.');
            }
            if ($key === 'email_layout_html' && trim($value) !== ''
                && !preg_match('/\{\{\s*email\.body\s*\}\}/', $value)) {
                throw new \InvalidArgumentException('The core email layout must include the {{ email.body }} placeholder.');
            }
        }
        $access = $data['access'] ?? [];
        if (!is_array($access)) {
            throw new \InvalidArgumentException('Access settings must be an object.');
        }
        foreach (['allowed_groups', 'instant_approval_groups'] as $field) {
            $groups = $access[$field] ?? [];
            if (!is_array($groups) || count($groups) > 50) {
                throw new \InvalidArgumentException('Access settings may contain up to 50 group names.');
            }
            foreach ($groups as $group) {
                if (!is_string($group) || !preg_match('/^[a-zA-Z0-9_.-]{1,80}$/', $group)) {
                    throw new \InvalidArgumentException('Access group names may contain letters, numbers, dots, underscores, and hyphens.');
                }
            }
        }
        foreach (($data['resources'] ?? []) as $resource) {
            if (!is_array($resource)) {
                throw new \InvalidArgumentException('Each resource must be an object.');
            }
            foreach (['allowed_groups', 'instant_approval_groups'] as $field) {
                $groups = $resource[$field] ?? [];
                if (!is_array($groups) || count($groups) > 50) {
                    throw new \InvalidArgumentException('Resource access settings may contain up to 50 group names.');
                }
                foreach ($groups as $group) {
                    if (!is_string($group) || !preg_match('/^[a-zA-Z0-9_.-]{1,80}$/', $group)) {
                        throw new \InvalidArgumentException('Resource access group names are invalid.');
                    }
                }
            }
        }
        $allowedEvents = ['created', 'confirmed', 'rejected', 'cancelled', 'edited'];
        foreach (['facility_events', 'requester_events'] as $field) {
            $events = $notifications[$field] ?? [];
            if (!is_array($events) || count($events) > count($allowedEvents)) {
                throw new \InvalidArgumentException('Notification settings include an unsupported event.');
            }
            foreach ($events as $event) {
                if (!is_string($event) || !in_array($event, $allowedEvents, true)) {
                    throw new \InvalidArgumentException('Notification settings include an unsupported event.');
                }
            }
        }
    }

    private function actor(ServerRequestInterface $request): string
    {
        $user = $this->getUser($request);
        if (is_array($user)) {
            return (string) ($user['username'] ?? 'admin');
        }
        if (is_object($user)) {
            if (method_exists($user, 'get')) {
                return (string) ($user->get('username') ?? 'admin');
            }
            if (isset($user->username)) {
                return (string) $user->username;
            }
        }
        return 'admin';
    }

    private function isUuid(string $id): bool
    {
        return (bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $id);
    }

    private function blockToArray(AvailabilityBlock $block): array
    {
        return [
            'id' => $block->id,
            'facility_id' => $block->facilityId,
            'resource_id' => $block->resourceId,
            'start' => $block->interval->start->format(DATE_ATOM),
            'end' => $block->interval->end->format(DATE_ATOM),
            'title' => $block->title,
            'description' => $block->description,
        ];
    }

    private function recurringBlockToArray(RecurringBlock $block): array
    {
        return [
            'id' => $block->id,
            'facility_id' => $block->facilityId,
            'resource_id' => $block->resourceId,
            'weekday' => $block->weekday,
            'start_time' => $block->startTime,
            'end_time' => $block->endTime,
            'title' => $block->title,
            'description' => $block->description,
            'effective_from' => $block->effectiveFrom?->format(DATE_ATOM),
            'effective_until' => $block->effectiveUntil?->format(DATE_ATOM),
        ];
    }

    /**
     * Convert Booking domain object to array for API response.
     */
    private function bookingToArray(Booking $booking): array
    {
        $catalog = ServiceLocator::instance()->getCatalog();
        $facility = $catalog->get($booking->facilityId);
        $resource = $facility?->getResource($booking->resourceId ?? '');

        return [
            'id' => $booking->id,
            'facility_id' => $booking->facilityId,
            'facility_name' => $facility?->name ?? 'Unknown',
            'resource_id' => $booking->resourceId,
            'resource_name' => $resource?->name ?? null,
            'start' => $booking->interval->start->format(DATE_ATOM),
            'end' => $booking->interval->end->format(DATE_ATOM),
            'timezone' => $booking->facilityTimezone,
            'status' => $booking->status->value,
            'customer_name' => $booking->customerName,
            'customer_email' => $booking->customerEmail,
            'customer_phone' => $booking->customerTelephone,
            'customer_note' => $booking->customerNote,
            'requester_username' => $booking->requesterUsername,
            'admin_note' => $booking->adminNote,
            'created_at' => $booking->createdAt->format(DATE_ATOM),
            'updated_at' => $booking->updatedAt->format(DATE_ATOM),
            'approved_at' => $booking->approvedAt?->format(DATE_ATOM),
            'rejected_at' => $booking->rejectedAt?->format(DATE_ATOM),
            'rejection_reason' => $booking->rejectionReason,
        ];
    }

    /**
     * Convert Facility domain object to array for API response.
     */
    private function facilityToArray(\Grav\Plugin\Booking\Domain\Facility $facility): array
    {
        $stored = ServiceLocator::instance()->getFacilityRepository()->get($facility->id);
        if ($stored !== null) {
            return $stored;
        }
        $resources = [];
        foreach ($facility->getResources() as $resource) {
            $resources[] = [
                'id' => $resource->id,
                'name' => $resource->name,
                'description' => $resource->description,
                'enabled' => $resource->enabled,
            ];
        }

        return [
            'id' => $facility->id,
            'slug' => $facility->id,
            'name' => $facility->name,
            'description' => $facility->description,
            'enabled' => $facility->enabled,
            'timezone' => $facility->timezone,
            'booking_mode' => $facility->bookingMode->value,
            'approval_mode' => $facility->approvalMode->value,
            'resources' => $resources,
        ];
    }
}
