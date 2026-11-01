<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use DateTimeImmutable;
use DateTimeInterface;
use Grav\Plugin\Booking\Domain\Interval;

/**
 * Normalizes timestamps to UTC and validates timezone handling.
 */
final class TimeNormalizer
{
    /**
     * Parse an RFC3339 timestamp and convert to UTC.
     * Rejects timestamps without explicit offset.
     */
    public function parseToUtc(string $timestamp): DateTimeImmutable
    {
        // Must have explicit offset (Z or +/-HH:MM)
        if (!preg_match('/(Z|[+-]\d{2}:\d{2})$/', $timestamp)) {
            throw new \InvalidArgumentException('Timestamp must have explicit timezone offset (RFC3339).');
        }

        $dt = new DateTimeImmutable($timestamp);
        if ($dt === false) {
            throw new \InvalidArgumentException("Invalid timestamp: $timestamp");
        }

        return $dt->setTimezone(new \DateTimeZone('UTC'));
    }

    /**
     * Validate that a local time exists in the given timezone (handles DST gaps).
     */
    public function validateLocalTime(string $localTime, string $timezone): bool
    {
        $tz = new \DateTimeZone($timezone);
        $dt = new DateTimeImmutable($localTime, $tz);

        // Convert to UTC and back to check if time exists
        $utc = $dt->setTimezone(new \DateTimeZone('UTC'));
        $backToLocal = $utc->setTimezone($tz);

        // If the time doesn't exist (DST gap), the round-trip will change it
        return $dt->format('Y-m-d H:i:s') === $backToLocal->format('Y-m-d H:i:s');
    }

    /**
     * Create a UTC interval from local times in a facility timezone.
     */
    public function createIntervalFromLocal(
        string $localStart,
        string $localEnd,
        string $facilityTimezone
    ): Interval {
        $tz = new \DateTimeZone($facilityTimezone);

        $startLocal = new DateTimeImmutable($localStart, $tz);
        $endLocal = new DateTimeImmutable($localEnd, $tz);

        // Validate both times exist (not in DST gap)
        if (!$this->validateLocalTime($localStart, $facilityTimezone)) {
            throw new \InvalidArgumentException("Start time does not exist in timezone $facilityTimezone (DST gap).");
        }
        if (!$this->validateLocalTime($localEnd, $facilityTimezone)) {
            throw new \InvalidArgumentException("End time does not exist in timezone $facilityTimezone (DST gap).");
        }

        return new Interval($startLocal, $endLocal);
    }
}
