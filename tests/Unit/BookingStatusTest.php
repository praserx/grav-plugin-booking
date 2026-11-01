<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use Grav\Plugin\Booking\Domain\BookingStatus;
use PHPUnit\Framework\TestCase;

final class BookingStatusTest extends TestCase
{
    public function testPendingCanTransitionToConfirmed(): void
    {
        $this->assertTrue(BookingStatus::Pending->canTransitionTo(BookingStatus::Confirmed));
    }

    public function testPendingCanTransitionToRejected(): void
    {
        $this->assertTrue(BookingStatus::Pending->canTransitionTo(BookingStatus::Rejected));
    }

    public function testPendingCanTransitionToCancelled(): void
    {
        $this->assertTrue(BookingStatus::Pending->canTransitionTo(BookingStatus::Cancelled));
    }

    public function testConfirmedCanTransitionToCancelled(): void
    {
        $this->assertTrue(BookingStatus::Confirmed->canTransitionTo(BookingStatus::Cancelled));
    }

    public function testConfirmedCannotTransitionToPending(): void
    {
        $this->assertFalse(BookingStatus::Confirmed->canTransitionTo(BookingStatus::Pending));
    }

    public function testRejectedIsTerminal(): void
    {
        $this->assertFalse(BookingStatus::Rejected->canTransitionTo(BookingStatus::Confirmed));
        $this->assertFalse(BookingStatus::Rejected->canTransitionTo(BookingStatus::Pending));
    }

    public function testCancelledIsTerminal(): void
    {
        $this->assertFalse(BookingStatus::Cancelled->canTransitionTo(BookingStatus::Confirmed));
    }

    public function testConfirmedBlocksAvailability(): void
    {
        $this->assertTrue(BookingStatus::Confirmed->blocksAvailability(true));
        $this->assertTrue(BookingStatus::Confirmed->blocksAvailability(false));
    }

    public function testPendingBlocksAvailabilityWhenEnabled(): void
    {
        $this->assertTrue(BookingStatus::Pending->blocksAvailability(true));
        $this->assertFalse(BookingStatus::Pending->blocksAvailability(false));
    }

    public function testRejectedDoesNotBlockAvailability(): void
    {
        $this->assertFalse(BookingStatus::Rejected->blocksAvailability(true));
    }

    public function testCancelledDoesNotBlockAvailability(): void
    {
        $this->assertFalse(BookingStatus::Cancelled->blocksAvailability(true));
    }
}
