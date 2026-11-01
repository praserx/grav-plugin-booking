<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use DateTimeImmutable;
use Grav\Plugin\Booking\Domain\Interval;
use PHPUnit\Framework\TestCase;

final class IntervalTest extends TestCase
{
    public function testRejectsEndBeforeStart(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new Interval(
            new DateTimeImmutable('2026-01-01 12:00:00'),
            new DateTimeImmutable('2026-01-01 10:00:00')
        );
    }

    public function testRejectsEqualStartEnd(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new Interval(
            new DateTimeImmutable('2026-01-01 10:00:00'),
            new DateTimeImmutable('2026-01-01 10:00:00')
        );
    }

    public function testAdjacentIntervalsDoNotOverlap(): void
    {
        $a = new Interval(
            new DateTimeImmutable('2026-01-01 10:00:00'),
            new DateTimeImmutable('2026-01-01 11:00:00')
        );
        $b = new Interval(
            new DateTimeImmutable('2026-01-01 11:00:00'),
            new DateTimeImmutable('2026-01-01 12:00:00')
        );

        $this->assertFalse($a->overlaps($b));
        $this->assertFalse($b->overlaps($a));
    }

    public function testOverlappingIntervals(): void
    {
        $a = new Interval(
            new DateTimeImmutable('2026-01-01 10:00:00'),
            new DateTimeImmutable('2026-01-01 12:00:00')
        );
        $b = new Interval(
            new DateTimeImmutable('2026-01-01 11:00:00'),
            new DateTimeImmutable('2026-01-01 13:00:00')
        );

        $this->assertTrue($a->overlaps($b));
        $this->assertTrue($b->overlaps($a));
    }

    public function testContainedInterval(): void
    {
        $outer = new Interval(
            new DateTimeImmutable('2026-01-01 08:00:00'),
            new DateTimeImmutable('2026-01-01 18:00:00')
        );
        $inner = new Interval(
            new DateTimeImmutable('2026-01-01 10:00:00'),
            new DateTimeImmutable('2026-01-01 12:00:00')
        );

        $this->assertTrue($outer->contains($inner));
        $this->assertFalse($inner->contains($outer));
    }

    public function testDurationSeconds(): void
    {
        $i = new Interval(
            new DateTimeImmutable('2026-01-01 10:00:00'),
            new DateTimeImmutable('2026-01-01 12:30:00')
        );
        $this->assertSame(9000, $i->durationSeconds());
    }

    public function testConvertsToUtc(): void
    {
        $i = new Interval(
            new DateTimeImmutable('2026-01-01 10:00:00+02:00'),
            new DateTimeImmutable('2026-01-01 12:00:00+02:00')
        );
        $this->assertSame('08:00', $i->start->format('H:i'));
        $this->assertSame('10:00', $i->end->format('H:i'));
    }
}
