<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use DateTimeImmutable;
use Grav\Plugin\Booking\Configuration\FacilityCatalog;
use Grav\Plugin\Booking\Domain\ApprovalMode;
use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Domain\BookingStatus;
use Grav\Plugin\Booking\Domain\Interval;
use Grav\Plugin\Booking\Storage\SqliteAvailabilityBlockRepository;
use Grav\Plugin\Booking\Storage\SqliteBookingRepository;
use Grav\Plugin\Booking\Storage\SqliteRecurringBlockRepository;
use Grav\Plugin\Booking\Storage\SqliteTransaction;
use RuntimeException;

/**
 * Creates, updates, and cancels bookings.
 */
final class BookingService
{
    public function __construct(
        private readonly FacilityCatalog $catalog,
        private readonly SqliteBookingRepository $bookingRepo,
        private readonly SqliteAvailabilityBlockRepository $blockRepo,
        private readonly SqliteRecurringBlockRepository $recurringBlockRepo,
        private readonly SqliteTransaction $transaction,
        private readonly AvailabilityService $availabilityService
    ) {
    }

    /**
     * Create a new booking.
     */
    public function createBooking(
        string $facilityId,
        ?string $resourceId,
        Interval $interval,
        string $customerName,
        string $customerEmail,
        ?string $customerTelephone = null,
        ?string $customerNote = null,
        ?DateTimeImmutable $now = null,
        string $actor = 'public',
        ?BookingStatus $statusOverride = null,
        ?string $requesterUsername = null
    ): Booking {
        $now = $now ?? new DateTimeImmutable();
        return $this->transaction->run(function () use (
            $facilityId,
            $resourceId,
            $interval,
            $customerName,
            $customerEmail,
            $customerTelephone,
            $customerNote,
            $now,
            $actor,
            $statusOverride,
            $requesterUsername
        ): Booking {
            $facility = $this->catalog->get($facilityId);
            if ($facility === null) {
                throw new RuntimeException('Facility not found.');
            }
            $availability = $this->availabilityService->isAvailable($facilityId, $interval, $resourceId, $now);
            if (!$availability->available) {
                throw new RuntimeException('Booking not available: ' . $availability->reason);
            }
            $initialStatus = $statusOverride ?? (
                $facility->approvalMode === ApprovalMode::Automatic
                    ? BookingStatus::Confirmed
                    : BookingStatus::Pending
            );
            $booking = new Booking(
                id: $this->generateUuid(),
                facilityId: $facilityId,
                resourceId: $resourceId,
                interval: $interval,
                facilityTimezone: $facility->timezone,
                status: $initialStatus,
                customerName: $customerName,
                customerEmail: $customerEmail,
                customerTelephone: $customerTelephone,
                customerNote: $customerNote,
                createdAt: $now,
                updatedAt: $now,
                approvedAt: $initialStatus === BookingStatus::Confirmed ? $now : null,
                requesterUsername: $requesterUsername
            );
            $this->bookingRepo->save($booking);
            $this->bookingRepo->recordEvent($booking->id, 'created', $actor, ['status' => $initialStatus->value]);
            return $booking;
        });
    }

    /**
     * Update booking status (approve, reject, cancel).
     */
    public function updateStatus(
        string $bookingId,
        BookingStatus $newStatus,
        ?string $rejectionReason = null,
        ?string $adminNote = null,
        ?DateTimeImmutable $now = null,
        string $actor = 'admin'
    ): Booking {
        $now = $now ?? new DateTimeImmutable();
        return $this->transaction->run(function () use ($bookingId, $newStatus, $rejectionReason, $adminNote, $now, $actor): Booking {
            $booking = $this->findBookingById($bookingId);
            if ($booking === null) {
                throw new RuntimeException('Booking not found.');
            }

            $updated = $booking->withStatus($newStatus, $now);

            // If rejecting, attach reason
            if ($newStatus === BookingStatus::Rejected && $rejectionReason !== null) {
                $updated = new Booking(
                    $updated->id,
                    $updated->facilityId,
                    $updated->resourceId,
                    $updated->interval,
                    $updated->facilityTimezone,
                    $updated->status,
                    $updated->customerName,
                    $updated->customerEmail,
                    $updated->customerTelephone,
                    $updated->customerNote,
                    $updated->createdAt,
                    $updated->updatedAt,
                    $updated->approvedAt,
                    $updated->rejectedAt,
                    $rejectionReason,
                    $adminNote ?? $updated->adminNote,
                    $updated->requesterUsername
                );
            } elseif ($adminNote !== null) {
                $updated = new Booking(
                    $updated->id,
                    $updated->facilityId,
                    $updated->resourceId,
                    $updated->interval,
                    $updated->facilityTimezone,
                    $updated->status,
                    $updated->customerName,
                    $updated->customerEmail,
                    $updated->customerTelephone,
                    $updated->customerNote,
                    $updated->createdAt,
                    $updated->updatedAt,
                    $updated->approvedAt,
                    $updated->rejectedAt,
                    $updated->rejectionReason,
                    $adminNote,
                    $updated->requesterUsername
                );
            }

            $this->bookingRepo->save($updated);
            $this->bookingRepo->recordEvent($bookingId, $newStatus->value, $actor, ['status' => $newStatus->value]);
            return $updated;
        });
    }

    /** Promote an email-verified public request after checking availability again. */
    public function activateVerifiedBooking(string $bookingId, BookingStatus $targetStatus): Booking
    {
        if (!in_array($targetStatus, [BookingStatus::Pending, BookingStatus::Confirmed], true)) {
            throw new RuntimeException('Invalid verified booking status.');
        }
        $updated = $this->transaction->run(function () use ($bookingId, $targetStatus): ?Booking {
            $booking = $this->findBookingById($bookingId);
            if ($booking === null || $booking->status !== BookingStatus::VerificationPending) {
                throw new RuntimeException('Verification is no longer available for this booking.');
            }
            $availability = $this->availabilityService->isAvailable(
                $booking->facilityId,
                $booking->interval,
                $booking->resourceId,
                null,
                $booking->id
            );
            if (!$availability->available) {
                $cancelled = $booking->withStatus(BookingStatus::Cancelled);
                $this->bookingRepo->save($cancelled);
                $this->bookingRepo->recordEvent($bookingId, 'verification_conflict', 'system', ['status' => 'cancelled']);
                return null;
            }
            $updated = $booking->withStatus($targetStatus);
            $this->bookingRepo->save($updated);
            $this->bookingRepo->recordEvent($bookingId, 'email_verified', 'requester', ['status' => $targetStatus->value]);
            return $updated;
        });
        if ($updated === null) {
            throw new RuntimeException('The selected dates are no longer available.');
        }
        return $updated;
    }

    /**
     * Find a booking by ID across all facilities.
     */
    public function findBookingById(string $bookingId): ?Booking
    {
        return $this->bookingRepo->findByIdGlobal($bookingId);
    }

    public function editBooking(string $bookingId, array $changes, string $actor): Booking
    {
        return $this->transaction->run(function () use ($bookingId, $changes, $actor): Booking {
            $booking = $this->findBookingById($bookingId);
            if ($booking === null) {
                throw new RuntimeException('Booking not found.');
            }
            $facilityId = (string) ($changes['facility_id'] ?? $booking->facilityId);
            $facility = $this->catalog->get($facilityId);
            if ($facility === null) {
                throw new RuntimeException('Facility not found.');
            }
            $resourceId = array_key_exists('resource_id', $changes)
                ? ($changes['resource_id'] !== null && $changes['resource_id'] !== '' ? (string) $changes['resource_id'] : null)
                : $booking->resourceId;
            if ($resourceId !== null && $facility->getResource($resourceId) === null) {
                throw new RuntimeException('Resource not found.');
            }
            if (($facility->bookingMode === \Grav\Plugin\Booking\Domain\BookingMode::Facility && $resourceId !== null)
                || ($facility->bookingMode === \Grav\Plugin\Booking\Domain\BookingMode::Resources && $resourceId === null)) {
                throw new RuntimeException('Booking mode does not allow this resource configuration.');
            }
            $start = isset($changes['start']) ? new DateTimeImmutable((string) $changes['start']) : $booking->interval->start;
            $end = isset($changes['end']) ? new DateTimeImmutable((string) $changes['end']) : $booking->interval->end;
            $interval = new Interval($start, $end);
            $occupancyChanged = $facilityId !== $booking->facilityId
                || $resourceId !== $booking->resourceId
                || $interval->start != $booking->interval->start
                || $interval->end != $booking->interval->end;
            if ($occupancyChanged && $booking->status->blocksAvailability($facility->bookingRules->pendingBlocksAvailability)) {
                $availability = $this->availabilityService->isAvailable(
                    $facilityId,
                    $interval,
                    $resourceId,
                    new DateTimeImmutable(),
                    $bookingId
                );
                if (!$availability->available) {
                    throw new RuntimeException('Booking edit conflicts with availability: ' . $availability->reason);
                }
            }
            $updated = new Booking(
                id: $booking->id,
                facilityId: $facilityId,
                resourceId: $resourceId,
                interval: $interval,
                facilityTimezone: $facility->timezone,
                status: $booking->status,
                customerName: (string) ($changes['customer_name'] ?? $booking->customerName),
                customerEmail: (string) ($changes['customer_email'] ?? $booking->customerEmail),
                customerTelephone: array_key_exists('customer_phone', $changes)
                    ? ($changes['customer_phone'] !== null && $changes['customer_phone'] !== '' ? (string) $changes['customer_phone'] : null)
                    : $booking->customerTelephone,
                customerNote: array_key_exists('customer_note', $changes)
                    ? ($changes['customer_note'] !== null && $changes['customer_note'] !== '' ? (string) $changes['customer_note'] : null)
                    : $booking->customerNote,
                createdAt: $booking->createdAt,
                updatedAt: new DateTimeImmutable(),
                approvedAt: $booking->approvedAt,
                rejectedAt: $booking->rejectedAt,
                rejectionReason: $booking->rejectionReason,
                adminNote: array_key_exists('admin_note', $changes)
                    ? ($changes['admin_note'] !== null && $changes['admin_note'] !== '' ? (string) $changes['admin_note'] : null)
                    : $booking->adminNote,
                requesterUsername: $booking->requesterUsername
            );
            $this->bookingRepo->save($updated);
            $this->bookingRepo->recordEvent($bookingId, 'edited', $actor, [
                'fields' => array_values(array_intersect(
                    ['facility_id', 'resource_id', 'start', 'end', 'customer_name', 'customer_email', 'customer_phone', 'customer_note', 'admin_note'],
                    array_keys($changes)
                )),
            ]);
            return $updated;
        });
    }

    public function deleteBooking(string $bookingId, string $actor): void
    {
        $this->transaction->run(function () use ($bookingId, $actor): void {
            $booking = $this->findBookingById($bookingId);
            if ($booking === null) {
                throw new RuntimeException('Booking not found.');
            }
            $this->bookingRepo->recordEvent($bookingId, 'deleted', $actor);
            $this->bookingRepo->delete($booking);
        });
    }

    private function generateUuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
        $hex = bin2hex($bytes);
        return substr($hex, 0, 8) . '-' . substr($hex, 8, 4) . '-' . substr($hex, 12, 4)
            . '-' . substr($hex, 16, 4) . '-' . substr($hex, 20);
    }
}
