<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

use DateTimeImmutable;

/**
 * A recurring weekly availability block.
 */
final class RecurringBlock
{
    public readonly int $weekday;
    public readonly string $startTime;
    public readonly string $endTime;

    public function __construct(
        public readonly string $id,
        public readonly string $facilityId,
        public readonly ?string $resourceId,
        int $weekday,
        string $startTime,
        string $endTime,
        public readonly string $title,
        public readonly ?string $description,
        public readonly ?DateTimeImmutable $effectiveFrom = null,
        public readonly ?DateTimeImmutable $effectiveUntil = null
    ) {
        if ($weekday < 1 || $weekday > 7) {
            throw new \InvalidArgumentException('weekday must be 1-7 (ISO weekday).');
        }
        if (!preg_match('/^\d{2}:\d{2}$/', $startTime) || !preg_match('/^\d{2}:\d{2}$/', $endTime)) {
            throw new \InvalidArgumentException('Time must be HH:MM format.');
        }
        if ($title === '') {
            throw new \InvalidArgumentException('Block title must not be empty.');
        }

        $this->weekday = $weekday;
        $this->startTime = $startTime;
        $this->endTime = $endTime;
    }

    public function isForFacility(): bool
    {
        return $this->resourceId === null;
    }

    /**
     * Check if this recurring block produces an occurrence that overlaps the given interval.
     */
    public function overlapsInterval(Interval $interval, string $facilityTimezone): bool
    {
        $tz = new \DateTimeZone($facilityTimezone);
        $startLocal = $interval->start->setTimezone($tz);
        $endLocal = $interval->end->setTimezone($tz);

        // Get the date range of the interval in local time
        $startDate = $startLocal->format('Y-m-d');
        $endDate = $endLocal->format('Y-m-d');

        // Iterate through each day in the interval
        $current = new DateTimeImmutable($startDate, $tz);
        $end = new DateTimeImmutable($endDate, $tz);

        while ($current <= $end) {
            $currentWeekday = (int) $current->format('N');

            if ($currentWeekday === $this->weekday) {
                // Check effective date range
                if ($this->effectiveFrom !== null && $current < $this->effectiveFrom->setTimezone($tz)) {
                    $current = $current->modify('+1 day');
                    continue;
                }
                if ($this->effectiveUntil !== null && $current > $this->effectiveUntil->setTimezone($tz)) {
                    $current = $current->modify('+1 day');
                    continue;
                }

                // Build the block interval for this day
                $blockStart = $current->setTime(
                    (int) substr($this->startTime, 0, 2),
                    (int) substr($this->startTime, 3, 2)
                );
                $blockEnd = $current->setTime(
                    (int) substr($this->endTime, 0, 2),
                    (int) substr($this->endTime, 3, 2)
                );

                // Handle overnight blocks (end time on next day)
                if ($blockEnd <= $blockStart) {
                    $blockEnd = $blockEnd->modify('+1 day');
                }

                $blockInterval = new Interval($blockStart, $blockEnd);
                if ($blockInterval->overlaps($interval)) {
                    return true;
                }
            }

            $current = $current->modify('+1 day');
        }

        return false;
    }
}
