<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use Grav\Plugin\Booking\Domain\BookingRules;
use PHPUnit\Framework\TestCase;

final class BookingRulesTest extends TestCase
{
    public function testValidDuration(): void
    {
        $rules = new BookingRules(3600, 7200, 3600, 0, 7776000, true);
        $this->assertTrue($rules->validateDuration(3600));
        $this->assertTrue($rules->validateDuration(7200));
    }

    public function testDurationBelowMinimum(): void
    {
        $rules = new BookingRules(3600, 7200, 3600, 0, 7776000, true);
        $this->assertFalse($rules->validateDuration(1800));
    }

    public function testDurationAboveMaximum(): void
    {
        $rules = new BookingRules(3600, 7200, 3600, 0, 7776000, true);
        $this->assertFalse($rules->validateDuration(10800));
    }

    public function testDurationNotAlignedToInterval(): void
    {
        $rules = new BookingRules(3600, 7200, 3600, 0, 7776000, true);
        $this->assertFalse($rules->validateDuration(5400));
    }

    public function testRejectsMaxLessThanMin(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new BookingRules(7200, 3600, 3600, 0, 7776000, true);
    }

    public function testRejectsZeroInterval(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new BookingRules(3600, 7200, 0, 0, 7776000, true);
    }
}
