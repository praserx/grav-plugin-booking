<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

use DateTimeImmutable;

/**
 * A repeating weekly availability window in facility local time.
 */
final class AvailabilityWindow
{
    public readonly int $startWeekday;
    public readonly string $startTime;
    public readonly int $endWeekday;
    public readonly string $endTime;

    public function __construct(
        int $startWeekday,
        string $startTime,
        int $endWeekday,
        string $endTime
    ) {
        if ($startWeekday < 1 || $startWeekday > 7) {
            throw new \InvalidArgumentException('startWeekday must be 1-7 (ISO weekday).');
        }
        if ($endWeekday < 1 || $endWeekday > 7) {
            throw new \InvalidArgumentException('endWeekday must be 1-7 (ISO weekday).');
        }
        if (!preg_match('/^\d{2}:\d{2}$/', $startTime) || !preg_match('/^\d{2}:\d{2}$/', $endTime)) {
            throw new \InvalidArgumentException('Time must be HH:MM format.');
        }

        $this->startWeekday = $startWeekday;
        $this->startTime = $startTime;
        $this->endWeekday = $endWeekday;
        $this->endTime = $endTime;
    }

    /**
     * Check if a UTC interval fits wholly inside this window (in facility timezone).
     */
    public function containsInterval(Interval $interval, string $facilityTimezone): bool
    {
        $tz = new \DateTimeZone($facilityTimezone);
        $startLocal = $interval->start->setTimezone($tz);
        $endLocal = $interval->end->setTimezone($tz);

        $startWeekday = (int) $startLocal->format('N');
        $endWeekday = (int) $endLocal->format('N');
        $startTime = $startLocal->format('H:i');
        $endTime = $endLocal->format('H:i');

        // Check if start is within window
        $startValid = $this->isTimeInWindow($startWeekday, $startTime, true);
        if (!$startValid) {
            return false;
        }

        // Check if end is within window
        $endValid = $this->isTimeInWindow($endWeekday, $endTime, false);
        if (!$endValid) {
            return false;
        }

        // Check if interval spans multiple windows
        if ($startWeekday !== $endWeekday && !$this->isMultiDayWindow()) {
            return false;
        }

        return true;
    }

    private function isTimeInWindow(int $weekday, string $time, bool $isStart): bool
    {
        if ($this->startWeekday === $this->endWeekday) {
            // Single day window
            if ($weekday !== $this->startWeekday) {
                return false;
            }
            if ($isStart) {
                return $time >= $this->startTime;
            }
            return $time <= $this->endTime;
        }

        // Multi-day window
        if ($this->startWeekday < $this->endWeekday) {
            // Normal week range (e.g., Mon-Fri)
            if ($weekday < $this->startWeekday || $weekday > $this->endWeekday) {
                return false;
            }
            if ($weekday === $this->startWeekday && $isStart) {
                return $time >= $this->startTime;
            }
            if ($weekday === $this->endWeekday && !$isStart) {
                return $time <= $this->endTime;
            }
            return true;
        }

        // Wraps weekend (e.g., Fri-Sun)
        if ($weekday < $this->startWeekday && $weekday > $this->endWeekday) {
            return false;
        }
        if ($weekday === $this->startWeekday && $isStart) {
            return $time >= $this->startTime;
        }
        if ($weekday === $this->endWeekday && !$isStart) {
            return $time <= $this->endTime;
        }
        return true;
    }

    private function isMultiDayWindow(): bool
    {
        if ($this->startWeekday === $this->endWeekday) {
            return false;
        }
        if ($this->startWeekday < $this->endWeekday) {
            return true;
        }
        // Wraps weekend
        return true;
    }
}
