<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

use DateTimeImmutable;
use DateTimeInterface;
use InvalidArgumentException;

/**
 * Half-open time interval [start, end) in UTC.
 */
final class Interval
{
    public readonly DateTimeImmutable $start;
    public readonly DateTimeImmutable $end;

    public function __construct(DateTimeInterface $start, DateTimeInterface $end)
    {
        $startUtc = $this->toUtc($start);
        $endUtc = $this->toUtc($end);

        if ($endUtc <= $startUtc) {
            throw new InvalidArgumentException('Interval end must be after start.');
        }

        $this->start = $startUtc;
        $this->end = $endUtc;
    }

    public function overlaps(self $other): bool
    {
        return $this->start < $other->end && $other->start < $this->end;
    }

    public function contains(self $other): bool
    {
        return $this->start <= $other->start && $this->end >= $other->end;
    }

    public function durationSeconds(): int
    {
        return $this->end->getTimestamp() - $this->start->getTimestamp();
    }

    private function toUtc(DateTimeInterface $dt): DateTimeImmutable
    {
        if ($dt instanceof DateTimeImmutable) {
            return $dt->setTimezone(new \DateTimeZone('UTC'));
        }
        return DateTimeImmutable::createFromInterface($dt)->setTimezone(new \DateTimeZone('UTC'));
    }
}
