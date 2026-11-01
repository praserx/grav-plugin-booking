<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

/**
 * Booking rules for a facility.
 */
final class BookingRules
{
    public function __construct(
        public readonly int $minimumDurationSeconds,
        public readonly int $maximumDurationSeconds,
        public readonly int $bookingIntervalSeconds,
        public readonly int $minimumAdvanceNoticeSeconds,
        public readonly int $maximumHorizonSeconds,
        public readonly bool $pendingBlocksAvailability
    ) {
        if ($minimumDurationSeconds < 0) {
            throw new \InvalidArgumentException('minimumDurationSeconds must be >= 0.');
        }
        if ($maximumDurationSeconds < $minimumDurationSeconds) {
            throw new \InvalidArgumentException('maximumDurationSeconds must be >= minimumDurationSeconds.');
        }
        if ($bookingIntervalSeconds <= 0) {
            throw new \InvalidArgumentException('bookingIntervalSeconds must be > 0.');
        }
        if ($minimumAdvanceNoticeSeconds < 0) {
            throw new \InvalidArgumentException('minimumAdvanceNoticeSeconds must be >= 0.');
        }
        if ($maximumHorizonSeconds <= 0) {
            throw new \InvalidArgumentException('maximumHorizonSeconds must be > 0.');
        }
    }

    public function validateDuration(int $durationSeconds): bool
    {
        return $durationSeconds >= $this->minimumDurationSeconds
            && $durationSeconds <= $this->maximumDurationSeconds
            && $durationSeconds % $this->bookingIntervalSeconds === 0;
    }
}
