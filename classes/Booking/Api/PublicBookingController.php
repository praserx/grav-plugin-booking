<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Api;

use Grav\Plugin\Api\Controllers\AbstractApiController;
use Grav\Plugin\Api\Response\ApiResponse;
use Grav\Plugin\Booking\Domain\BookingMode;
use Grav\Plugin\Booking\Domain\ApprovalMode;
use Grav\Plugin\Booking\Domain\Interval;
use Grav\Plugin\Booking\ServiceLocator;
use Grav\Plugin\Booking\Service\BookingAccessPolicy;
use Grav\Plugin\Booking\Validation\BookingValidator;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Public API controller for booking creation and availability checks.
 *
 * Provides endpoints for public users to check availability and create bookings.
 * These endpoints require CSRF protection and strict validation.
 */
final class PublicBookingController extends AbstractApiController
{
    /**
     * GET /booking/availability
     *
     * Check availability for a facility/resource on a specific date.
     * Returns available time slots without customer data.
     */
    public function checkAvailability(ServerRequestInterface $request): ResponseInterface
    {
        $params = $request->getQueryParams();

        // The public booking page uses the established availability route for
        // its monthly calendar as well as the existing single-interval check.
        // This keeps the calendar on the public endpoint already used by the
        // plugin's earlier booking flows.
        if (array_key_exists('from', $params) || array_key_exists('to', $params)) {
            return $this->availabilityCalendar($request);
        }

        // Validate input
        $validation = BookingValidator::validateAvailabilityCheck($params);
        if (!$validation['valid']) {
            return BookingApiResponse::error('Validation failed.', 400, $validation['errors']);
        }

        $facilityId = $validation['sanitized']['facility_id'];
        $resourceId = $validation['sanitized']['resource_id'] ?? null;
        $date = $validation['sanitized']['date'];

        try {
            $catalog = ServiceLocator::instance()->getCatalog();
            $availabilityService = ServiceLocator::instance()->getAvailabilityService();

            // Verify facility exists
            $facility = $catalog->get($facilityId);
            if ($facility === null) {
                return BookingApiResponse::error('Facility not found.', 404);
            }
            $policy = new BookingAccessPolicy();
            $user = $this->publicRequestUser($request);
            $groups = $this->groupsFromUser($user, $policy);

            // Verify resource exists if specified
            if ($resourceId !== null) {
                $resource = $facility->getResource($resourceId);
                if ($resource === null) {
                    return BookingApiResponse::error('Resource not found.', 404);
                }
                if (!$resource->enabled) {
                    return BookingApiResponse::error('Resource is not available.', 400);
                }
            }
            if (!$policy->canRequest($facility, $resourceId === null ? null : $facility->getResource($resourceId), $groups)) {
                return BookingApiResponse::error('You are not allowed to book this facility or resource.', 403);
            }

            $startDt = isset($params['start'])
                ? new \DateTimeImmutable((string) $params['start'])
                : new \DateTimeImmutable($date . 'T00:00:00', new \DateTimeZone($facility->timezone));
            $endDt = isset($params['end'])
                ? new \DateTimeImmutable((string) $params['end'])
                : $startDt->modify('+1 day');
            if ($startDt->setTimezone(new \DateTimeZone($facility->timezone))->format('Y-m-d') !== $date) {
                return BookingApiResponse::error('Start time must fall on the requested facility date.', 400);
            }
            $interval = new Interval($startDt, $endDt);

            $result = $availabilityService->isAvailable($facilityId, $interval, $resourceId);

            return ApiResponse::create([
                'facility_id' => $facilityId,
                'resource_id' => $resourceId,
                'date' => $date,
                'start' => $startDt->format(DATE_ATOM),
                'end' => $endDt->format(DATE_ATOM),
                'available' => $result->available,
                'reason' => $result->available ? null : 'Unavailable.',
            ]);
        } catch (\Throwable) {
            return BookingApiResponse::error('Failed to check availability.', 500);
        }
    }

    /**
     * GET /booking/calendar
     *
     * Return date availability only. Booking records and conflict reasons are
     * never included in this public calendar response.
     */
    public function availabilityCalendar(ServerRequestInterface $request): ResponseInterface
    {
        $params = $request->getQueryParams();
        $facilityId = trim((string) ($params['facility_id'] ?? ''));
        $resourceId = trim((string) ($params['resource_id'] ?? ''));
        $periodId = trim((string) ($params['period_id'] ?? ''));
        $from = trim((string) ($params['from'] ?? ''));
        $to = trim((string) ($params['to'] ?? ''));

        if ($facilityId === '' || !preg_match('/^[a-z0-9-]+$/', $facilityId)) {
            return BookingApiResponse::error('Invalid facility.', 400);
        }
        if (!$this->isIsoDate($from) || !$this->isIsoDate($to)) {
            return BookingApiResponse::error('Invalid calendar date range.', 400);
        }

        $utc = new \DateTimeZone('UTC');
        $fromDate = \DateTimeImmutable::createFromFormat('!Y-m-d', $from, $utc);
        $toDate = \DateTimeImmutable::createFromFormat('!Y-m-d', $to, $utc);
        if ($fromDate === false || $toDate === false || $toDate <= $fromDate || $fromDate->diff($toDate)->days > 62) {
            return BookingApiResponse::error('Calendar date range must span between 1 and 62 days.', 400);
        }

        try {
            $services = ServiceLocator::instance();
            $facility = $services->getCatalog()->get($facilityId);
            if ($facility === null || !$facility->enabled) {
                return BookingApiResponse::error('Facility is not available.', 404);
            }

            $resource = null;
            if ($resourceId !== '') {
                if ($facility->bookingMode === BookingMode::Facility) {
                    return BookingApiResponse::error('This facility is booked as a whole.', 400);
                }
                $resource = $facility->getResource($resourceId);
                if ($resource === null || !$resource->enabled) {
                    return BookingApiResponse::error('Resource is not available.', 404);
                }
            } elseif ($facility->bookingMode === BookingMode::Resources) {
                return BookingApiResponse::error('Choose a resource.', 400);
            }

            $policy = new BookingAccessPolicy();
            $groups = $this->groupsFromUser($this->publicRequestUser($request), $policy);
            if (!$policy->canRequest($facility, $resource, $groups)) {
                return BookingApiResponse::error('Booking option is not available.', 403);
            }

            $options = self::publicBookingOptions($facility->id);
            if ($resource !== null) {
                $slot = null;
                foreach ($options['resource_slots'] as $candidate) {
                    if ($candidate['id'] === $periodId) {
                        $slot = $candidate;
                        break;
                    }
                }
                if ($slot === null) {
                    return BookingApiResponse::error('Choose a valid booking period.', 400);
                }
                $startTime = $slot['start_time'];
                $endTime = $slot['end_time'];
            } else {
                $startTime = $options['whole_day_start_time'];
                $endTime = $options['whole_day_end_time'];
            }

            $availability = [];
            $failedDays = 0;
            for ($day = $fromDate; $day < $toDate; $day = $day->modify('+1 day')) {
                $date = $day->format('Y-m-d');
                $endDate = $resource === null ? $day->modify('+1 day')->format('Y-m-d') : $date;
                $start = $this->facilityWallTime($date, $startTime, $facility->timezone);
                $end = $this->facilityWallTime($endDate, $endTime, $facility->timezone);
                $available = false;
                if ($start !== null && $end !== null && $end > $start) {
                    try {
                        $result = $services->getAvailabilityService()->isAvailable(
                            $facility->id,
                            new Interval($start, $end),
                            $resource?->id
                        );
                        $available = $result->available;
                    } catch (\Throwable $exception) {
                        ++$failedDays;
                        $this->logCalendarFailure($exception, $facility->id, $date);
                    }
                }
                $availability[] = ['date' => $date, 'available' => $available];
            }

            return ApiResponse::create([
                'availability' => $availability,
                'partial_failure' => $failedDays > 0,
            ])
                ->withHeader('Cache-Control', 'no-store, private');
        } catch (\Throwable $exception) {
            $this->logCalendarFailure($exception, $facilityId);
            return BookingApiResponse::error('Could not load calendar availability.', 500);
        }
    }

    /**
     * POST /booking/reservations
     *
     * Create a new booking. Requires CSRF token and strict validation.
     */
    public function createReservation(ServerRequestInterface $request): ResponseInterface
    {
        try {
            ServiceLocator::instance()->getVerificationService()->expire();
        } catch (\Throwable) {
            // Expiry cleanup must not prevent a new reservation request.
        }
        $body = $request->getParsedBody();
        if (!is_array($body)) {
            return BookingApiResponse::error('Invalid request body.', 400);
        }
        if (!isset($body['booking-nonce']) || !\Grav\Common\Utils::verifyNonce((string) $body['booking-nonce'], 'booking-form')) {
            return BookingApiResponse::error('The form has expired. Reload the page and try again.', 403);
        }
        if (trim((string) ($body['website'] ?? '')) !== '') {
            return BookingApiResponse::error('Invalid booking request.', 400);
        }

        // Validate input
        $validation = BookingValidator::validateBookingCreation($body);
        if (!$validation['valid']) {
            return BookingApiResponse::error('Validation failed.', 400, $validation['errors']);
        }

        $data = $validation['sanitized'];

        try {
            $catalog = ServiceLocator::instance()->getCatalog();
            $bookingService = ServiceLocator::instance()->getBookingService();

            // Verify facility exists and is enabled
            $facility = $catalog->get($data['facility_id']);
            if ($facility === null) {
                return BookingApiResponse::error('Facility not found.', 404);
            }
            if (!$facility->enabled) {
                return BookingApiResponse::error('Facility is not available for booking.', 400);
            }

            // Verify resource exists and is enabled if specified
            $resourceId = $data['resource_id'] ?? null;
            if ($facility->bookingMode === BookingMode::Facility && $resourceId !== null) {
                return BookingApiResponse::error('This facility is booked as a whole.', 400);
            }
            if ($facility->bookingMode === BookingMode::Resources && $resourceId === null) {
                return BookingApiResponse::error('Choose a resource.', 400);
            }
            if ($resourceId !== null) {
                $resource = $facility->getResource($resourceId);
                if ($resource === null) {
                    return BookingApiResponse::error('Resource not found.', 404);
                }
                if (!$resource->enabled) {
                    return BookingApiResponse::error('Resource is not available for booking.', 400);
                }
            }

            $policy = new BookingAccessPolicy();
            $user = $this->publicRequestUser($request);
            $groups = $this->groupsFromUser($user, $policy);
            $resource = $resourceId === null ? null : $facility->getResource($resourceId);
            if (!$policy->canRequest($facility, $resource, $groups)) {
                return BookingApiResponse::error('You are not allowed to book this facility or resource.', 403);
            }

            // Create Interval domain object
            $startDt = new \DateTimeImmutable($data['start']);
            $endDt = new \DateTimeImmutable($data['end']);
            $interval = new Interval($startDt, $endDt);

            // Create the booking
            $targetStatus = ($policy->canInstantlyApprove($facility, $resource, $groups)
                || $facility->approvalMode === ApprovalMode::Automatic)
                ? \Grav\Plugin\Booking\Domain\BookingStatus::Confirmed
                : \Grav\Plugin\Booking\Domain\BookingStatus::Pending;
            $booking = $bookingService->createBooking(
                $data['facility_id'],
                $resourceId,
                $interval,
                $data['customer_name'],
                $data['customer_email'],
                $data['customer_phone'] ?? null,
                $data['customer_note'] ?? null,
                null,
                'public',
                \Grav\Plugin\Booking\Domain\BookingStatus::VerificationPending,
                $this->usernameFromUser($user)
            );
            try {
                $verification = ServiceLocator::instance()->getVerificationService()->issue($booking, $targetStatus);
            } catch (\Throwable $exception) {
                try {
                    $bookingService->updateStatus(
                        $booking->id,
                        \Grav\Plugin\Booking\Domain\BookingStatus::Cancelled,
                        null,
                        null,
                        null,
                        'system'
                    );
                } catch (\Throwable) {
                    // Preserve the original verification-storage error for the API response.
                }
                throw $exception;
            }

            return ApiResponse::create([
                'booking' => [
                    'id' => $booking->id,
                    'facility_id' => $booking->facilityId,
                    'resource_id' => $booking->resourceId,
                    'start' => $booking->interval->start->format(DATE_ATOM),
                    'end' => $booking->interval->end->format(DATE_ATOM),
                    'status' => $booking->status->value,
                    'customer_name' => $booking->customerName,
                    'customer_email' => $booking->customerEmail,
                ],
                'verification_required' => true,
                'verification_email_sent' => $verification['sent'],
                'verification_expires_at' => $verification['expires_at'],
                'message' => 'Enter the verification code sent to your email to complete the request.',
            ], 202);
        } catch (\InvalidArgumentException $e) {
            return BookingApiResponse::error('Invalid booking data: ' . $e->getMessage(), 400);
        } catch (\RuntimeException $e) {
            // Check if it's a conflict error
            if (stripos($e->getMessage(), 'conflict') !== false || stripos($e->getMessage(), 'not available') !== false) {
                return BookingApiResponse::error('Selected dates are no longer available.', 409);
            }
            return BookingApiResponse::error('Failed to create the booking.', 500);
        } catch (\Throwable) {
            return BookingApiResponse::error('Unexpected error while creating the booking.', 500);
        }
    }

    /** POST /booking/reservations/verify */
    public function verifyReservation(ServerRequestInterface $request): ResponseInterface
    {
        try {
            ServiceLocator::instance()->getVerificationService()->expire();
        } catch (\Throwable) {
            // Continue with validation; the target request will handle its own expiry.
        }
        $body = $request->getParsedBody();
        if (!is_array($body) || !$this->validBookingNonce($body)) {
            return BookingApiResponse::error('The form has expired. Reload the page and try again.', 403);
        }
        $bookingId = trim((string) ($body['booking_id'] ?? ''));
        $code = trim((string) ($body['verification_code'] ?? ''));
        if (!preg_match('/^[0-9a-f-]{36}$/i', $bookingId) || !preg_match('/^\d{6}$/', $code)) {
            return BookingApiResponse::error('Enter the six-digit code from your email.', 422);
        }
        try {
            $booking = ServiceLocator::instance()->getVerificationService()->verify($bookingId, $code);
            return ApiResponse::create([
                'booking' => [
                    'id' => $booking->id,
                    'facility_id' => $booking->facilityId,
                    'resource_id' => $booking->resourceId,
                    'start' => $booking->interval->start->format(DATE_ATOM),
                    'end' => $booking->interval->end->format(DATE_ATOM),
                    'status' => $booking->status->value,
                ],
                'message' => $booking->status === \Grav\Plugin\Booking\Domain\BookingStatus::Confirmed
                    ? 'Your booking has been confirmed.'
                    : 'Your booking request is verified and waiting for approval.',
            ]);
        } catch (\RuntimeException $exception) {
            $message = str_contains($exception->getMessage(), 'no longer available')
                ? 'The selected dates are no longer available. Start a new reservation.'
                : 'The verification code is invalid or expired.';
            return BookingApiResponse::error($message, 422);
        } catch (\Throwable) {
            return BookingApiResponse::error('Could not verify the reservation.', 500);
        }
    }

    /** POST /booking/reservations/resend-verification */
    public function resendVerification(ServerRequestInterface $request): ResponseInterface
    {
        $body = $request->getParsedBody();
        if (!is_array($body) || !$this->validBookingNonce($body)) {
            return BookingApiResponse::error('The form has expired. Reload the page and try again.', 403);
        }
        $bookingId = trim((string) ($body['booking_id'] ?? ''));
        if (!preg_match('/^[0-9a-f-]{36}$/i', $bookingId)) {
            return BookingApiResponse::error('Invalid reservation reference.', 422);
        }
        try {
            $sent = ServiceLocator::instance()->getVerificationService()->resend($bookingId);
            return ApiResponse::create([
                'sent' => $sent,
                'message' => $sent ? 'A new verification code has been sent.' : 'The email could not be sent. Please try again later.',
            ], $sent ? 200 : 503);
        } catch (\RuntimeException $exception) {
            $message = $exception->getMessage();
            return BookingApiResponse::error($message, 429);
        } catch (\Throwable) {
            return BookingApiResponse::error('Could not resend the verification email.', 500);
        }
    }

    private function validBookingNonce(array $body): bool
    {
        return isset($body['booking-nonce'])
            && \Grav\Common\Utils::verifyNonce((string) $body['booking-nonce'], 'booking-form');
    }

    /**
     * GET /booking/facilities
     *
     * List available facilities for public booking.
     * Returns only enabled facilities with public information.
     */
    public function listFacilities(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $catalog = ServiceLocator::instance()->getCatalog();
            $allFacilities = $catalog->all();

            // Filter to only enabled facilities
            $enabledFacilities = array_filter($allFacilities, function ($facility) {
                return $facility->enabled;
            });

            $policy = new BookingAccessPolicy();
            $user = $this->publicRequestUser($request);
            $groups = $this->groupsFromUser($user, $policy);
            $enabledFacilities = array_filter($enabledFacilities, fn ($facility) => $policy->canRequest($facility, null, $groups));

            // Strip internal configuration, keep only public info
            $publicFacilities = array_map(function ($facility) use ($policy, $groups) {
                $resources = [];
                foreach ($facility->getResources() as $resource) {
                    if ($policy->canRequest($facility, $resource, $groups)) {
                        $resources[] = [
                            'id' => $resource->id,
                            'name' => $resource->name,
                        ];
                    }
                }

                return [
                    'id' => $facility->id,
                    'name' => $facility->name,
                    'booking_mode' => $facility->bookingMode->value,
                    'timezone' => $facility->timezone,
                    'resources' => $resources,
                    'booking_options' => self::publicBookingOptions($facility->id),
                ];
            }, array_values(array_filter($enabledFacilities, static function ($facility) use ($policy, $groups) {
                if (!$policy->canRequest($facility, null, $groups)) {
                    return false;
                }
                if ($facility->bookingMode === \Grav\Plugin\Booking\Domain\BookingMode::Resources) {
                    foreach ($facility->getResources() as $resource) {
                        if ($policy->canRequest($facility, $resource, $groups)) {
                            return true;
                        }
                    }
                    return false;
                }
                return true;
            })));

            return ApiResponse::create([
                'facilities' => $publicFacilities,
                'count' => count($publicFacilities),
            ]);
        } catch (\Throwable) {
            return BookingApiResponse::error('Failed to retrieve facilities.', 500);
        }
    }

    public static function publicBookingOptions(string $facilityId): array
    {
        $stored = ServiceLocator::instance()->getFacilityRepository()->get($facilityId) ?? [];
        $interface = is_array($stored['booking_interface'] ?? null) ? $stored['booking_interface'] : [];
        $validTime = static fn (mixed $time): bool => is_string($time)
            && preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) === 1;

        $slots = [];
        foreach (is_array($interface['resource_slots'] ?? null) ? $interface['resource_slots'] : [] as $slot) {
            if (!is_array($slot)) {
                continue;
            }
            $id = trim((string) ($slot['id'] ?? ''));
            $label = trim((string) ($slot['label'] ?? ''));
            $start = $slot['start_time'] ?? null;
            $end = $slot['end_time'] ?? null;
            if (!preg_match('/^[a-z0-9-]{1,80}$/', $id) || $label === ''
                || !$validTime($start) || !$validTime($end) || $end <= $start) {
                continue;
            }
            $slots[] = [
                'id' => $id,
                'label' => mb_substr($label, 0, 80),
                'start_time' => $start,
                'end_time' => $end,
            ];
            if (count($slots) >= 20) {
                break;
            }
        }

        if ($slots === []) {
            $slots = [
                ['id' => 'morning', 'label' => 'Morning', 'start_time' => '08:00', 'end_time' => '12:00'],
                ['id' => 'afternoon', 'label' => 'Afternoon', 'start_time' => '12:00', 'end_time' => '18:00'],
                ['id' => 'full-day', 'label' => 'Full day', 'start_time' => '08:00', 'end_time' => '18:00'],
            ];
        }

        return [
            'whole_day_start_time' => $validTime($interface['whole_day_start_time'] ?? null)
                ? $interface['whole_day_start_time'] : '12:00',
            'whole_day_end_time' => $validTime($interface['whole_day_end_time'] ?? null)
                ? $interface['whole_day_end_time'] : '12:00',
            'resource_slots' => $slots,
        ];
    }

    private function isIsoDate(string $value): bool
    {
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value, new \DateTimeZone('UTC'));
        return $date !== false && $date->format('Y-m-d') === $value;
    }

    private function facilityWallTime(string $date, string $time, string $timezone): ?\DateTimeImmutable
    {
        if (!$this->isIsoDate($date) || !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time)) {
            return null;
        }
        try {
            $value = new \DateTimeImmutable($date . ' ' . $time, new \DateTimeZone($timezone));
            return $value->format('Y-m-d H:i') === $date . ' ' . $time ? $value : null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function logCalendarFailure(\Throwable $exception, string $facilityId, ?string $date = null): void
    {
        try {
            $scope = $date === null ? $facilityId : $facilityId . ' on ' . $date;
            \Grav\Common\Grav::instance()['log']->error(
                'Booking public calendar failed for ' . $scope . ': '
                . get_class($exception) . ': ' . $exception->getMessage()
            );
        } catch (\Throwable) {
            // Keep the public error generic even if logging is unavailable.
        }
    }

    private function groupsFromUser(mixed $user, BookingAccessPolicy $policy): array
    {
        if (is_array($user)) {
            return $policy->groups($user['groups'] ?? []);
        }
        if (is_object($user) && method_exists($user, 'get')) {
            return $policy->groups($user->get('groups'));
        }
        return [];
    }

    /**
     * Resolve an optional user for a public route. API authentication is
     * optional on these endpoints, so getUser() is not appropriate here. Use
     * the API-authenticated user when present, then fall back to Grav's regular
     * session user so facility group access matches the public page rendering.
     */
    private function publicRequestUser(ServerRequestInterface $request): mixed
    {
        $user = $request->getAttribute('api_user');
        if ($user !== null) {
            return $user;
        }

        try {
            return $this->grav['user'] ?? null;
        } catch (\Throwable) {
            return null;
        }
    }

    private function usernameFromUser(mixed $user): ?string
    {
        if (is_array($user)) {
            return isset($user['username']) && $user['username'] !== '' ? (string) $user['username'] : null;
        }
        if (is_object($user) && method_exists($user, 'get')) {
            $username = $user->get('username');
            return is_string($username) && $username !== '' ? $username : null;
        }
        return null;
    }
}
