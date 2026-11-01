<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use DateTimeImmutable;
use Grav\Plugin\Booking\Configuration\FacilityCatalog;
use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Domain\Facility;
use Grav\Plugin\Booking\Domain\Interval;
use Grav\Plugin\Booking\Domain\Resource;
use Grav\Plugin\Booking\Storage\SqliteAvailabilityBlockRepository;
use Grav\Plugin\Booking\Storage\SqliteBookingRepository;
use Grav\Plugin\Booking\Storage\SqliteRecurringBlockRepository;

/**
 * Determines availability for a facility/resource in a time range.
 */
final class AvailabilityService
{
    public function __construct(
        private readonly FacilityCatalog $catalog,
        private readonly SqliteBookingRepository $bookingRepo,
        private readonly SqliteAvailabilityBlockRepository $blockRepo,
        private readonly SqliteRecurringBlockRepository $recurringBlockRepo,
        private readonly ScheduleEvaluator $scheduleEvaluator,
        private readonly ConflictDetector $conflictDetector
    ) {
    }

    /**
     * Check if a specific interval is available.
     */
    public function isAvailable(
        string $facilityId,
        Interval $candidate,
        ?string $resourceId = null,
        ?DateTimeImmutable $now = null,
        ?string $excludeBookingId = null
    ): AvailabilityResult {
        $facility = $this->catalog->get($facilityId);
        if ($facility === null) {
            return AvailabilityResult::failure('Facility not found.');
        }

        if (!$facility->enabled) {
            return AvailabilityResult::failure('Facility is disabled.');
        }

        // Validate resource if specified
        if ($resourceId !== null) {
            $resource = $facility->getResource($resourceId);
            if ($resource === null) {
                return AvailabilityResult::failure('Resource not found.');
            }
            if (!$resource->enabled) {
                return AvailabilityResult::failure('Resource is disabled.');
            }
        }

        // Validate booking mode compatibility
        if (!$this->validateMode($facility, $resourceId)) {
            return AvailabilityResult::failure('Booking mode does not allow this resource configuration.');
        }

        $now = $now ?? new DateTimeImmutable();

        // Validate booking rules
        $rulesValidation = $this->validateRules($facility, $candidate, $now);
        if ($rulesValidation !== null) {
            return AvailabilityResult::failure($rulesValidation);
        }

        // Check if within availability window
        if (!$this->scheduleEvaluator->isWithinWindow($facility, $candidate)) {
            return AvailabilityResult::failure('Interval does not fit within any availability window.');
        }

        // Load existing occupancy
        $bookings = $this->bookingRepo->findByFacility(
            $facilityId,
            $candidate->start->modify('-' . $facility->bookingRules->maximumDurationSeconds . ' seconds'),
            $candidate->end
        );
        if ($excludeBookingId !== null) {
            $bookings = array_values(array_filter(
                $bookings,
                static fn (Booking $booking): bool => $booking->id !== $excludeBookingId
            ));
        }

        $blocks = $this->blockRepo->findByFacility(
            $facilityId,
            $candidate->start->modify('-' . $facility->bookingRules->maximumDurationSeconds . ' seconds'),
            $candidate->end
        );

        $recurringBlocks = $this->recurringBlockRepo->findByFacility($facilityId);

        // Check for conflicts
        if ($this->conflictDetector->hasBookingConflict(
            $facility,
            $candidate,
            $resourceId,
            $bookings,
            $facility->bookingRules->pendingBlocksAvailability
        )) {
            return AvailabilityResult::failure('Interval conflicts with existing booking.');
        }

        if ($this->conflictDetector->hasBlockConflict(
            $facility,
            $candidate,
            $resourceId,
            $blocks,
            $recurringBlocks
        )) {
            return AvailabilityResult::failure('Interval conflicts with availability block.');
        }

        return AvailabilityResult::success();
    }

    /**
     * Validate that the resource configuration matches the facility's booking mode.
     */
    private function validateMode(Facility $facility, ?string $resourceId): bool
    {
        return match ($facility->bookingMode) {
            \Grav\Plugin\Booking\Domain\BookingMode::Facility => $resourceId === null,
            \Grav\Plugin\Booking\Domain\BookingMode::Resources => $resourceId !== null,
            \Grav\Plugin\Booking\Domain\BookingMode::Both => true,
        };
    }

    /**
     * Validate booking rules (duration, advance notice, horizon).
     * Returns null if valid, error message if invalid.
     */
    private function validateRules(Facility $facility, Interval $candidate, DateTimeImmutable $now): ?string
    {
        $rules = $facility->bookingRules;
        $duration = $candidate->durationSeconds();

        if (!$rules->validateDuration($duration)) {
            return 'Duration does not meet booking rules (min/max/interval).';
        }

        $advanceNotice = $candidate->start->getTimestamp() - $now->getTimestamp();
        if ($advanceNotice < $rules->minimumAdvanceNoticeSeconds) {
            return 'Insufficient advance notice.';
        }

        $horizon = $candidate->start->getTimestamp() - $now->getTimestamp();
        if ($horizon > $rules->maximumHorizonSeconds) {
            return 'Booking exceeds maximum horizon.';
        }

        return null;
    }
}

/**
 * Result of an availability check.
 */
final class AvailabilityResult
{
    private function __construct(
        public readonly bool $available,
        public readonly ?string $reason = null
    ) {
    }

    public static function success(): self
    {
        return new self(true);
    }

    public static function failure(string $reason): self
    {
        return new self(false, $reason);
    }
}
