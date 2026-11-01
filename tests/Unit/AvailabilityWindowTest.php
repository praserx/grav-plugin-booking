<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use Grav\Plugin\Booking\Domain\AvailabilityWindow;
use Grav\Plugin\Booking\Domain\Interval;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

final class AvailabilityWindowTest extends TestCase
{
    public function testSingleDayWindowContainsInterval(): void
    {
        $window = new AvailabilityWindow(1, '08:00', 1, '22:00'); // Monday 08:00-22:00
        // 2026-01-05 is a Monday
        $interval = new Interval(
            new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        $this->assertTrue($window->containsInterval($interval, 'Europe/London'));
    }

    public function testSingleDayWindowRejectsOutsideHours(): void
    {
        $window = new AvailabilityWindow(1, '08:00', 1, '22:00');
        // Start before window
        $interval = new Interval(
            new DateTimeImmutable('2026-01-05 07:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 09:00:00 Europe/London')
        );

        $this->assertFalse($window->containsInterval($interval, 'Europe/London'));
    }

    public function testSingleDayWindowRejectsWrongDay(): void
    {
        $window = new AvailabilityWindow(1, '08:00', 1, '22:00'); // Monday
        // 2026-01-06 is a Tuesday
        $interval = new Interval(
            new DateTimeImmutable('2026-01-06 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-06 12:00:00 Europe/London')
        );

        $this->assertFalse($window->containsInterval($interval, 'Europe/London'));
    }

    public function testMultiDayWindowContainsInterval(): void
    {
        $window = new AvailabilityWindow(1, '08:00', 5, '22:00'); // Mon 08:00 - Fri 22:00
        // Wednesday
        $interval = new Interval(
            new DateTimeImmutable('2026-01-07 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-07 12:00:00 Europe/London')
        );

        $this->assertTrue($window->containsInterval($interval, 'Europe/London'));
    }

    public function testWeekendWindow(): void
    {
        $window = new AvailabilityWindow(5, '15:00', 7, '17:00'); // Fri 15:00 - Sun 17:00
        // Saturday
        $interval = new Interval(
            new DateTimeImmutable('2026-01-10 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-10 14:00:00 Europe/London')
        );

        $this->assertTrue($window->containsInterval($interval, 'Europe/London'));
    }

    public function testRejectsInvalidWeekday(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new AvailabilityWindow(0, '08:00', 1, '22:00');
    }

    public function testRejectsInvalidTimeFormat(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new AvailabilityWindow(1, '8:00', 1, '22:00');
    }
}
