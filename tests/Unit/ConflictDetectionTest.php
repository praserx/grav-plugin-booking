<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use Grav\Plugin\Booking\Domain\ApprovalMode;
use Grav\Plugin\Booking\Domain\AvailabilityBlock;
use Grav\Plugin\Booking\Domain\AvailabilityWindow;
use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Domain\BookingMode;
use Grav\Plugin\Booking\Domain\BookingRules;
use Grav\Plugin\Booking\Domain\BookingStatus;
use Grav\Plugin\Booking\Domain\Facility;
use Grav\Plugin\Booking\Domain\Interval;
use Grav\Plugin\Booking\Domain\RecurringBlock;
use Grav\Plugin\Booking\Domain\Resource;
use Grav\Plugin\Booking\Service\ConflictDetector;
use Grav\Plugin\Booking\Service\ScheduleEvaluator;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;

final class ConflictDetectionTest extends TestCase
{
    private ConflictDetector $detector;
    private ScheduleEvaluator $evaluator;

    protected function setUp(): void
    {
        $this->detector = new ConflictDetector();
        $this->evaluator = new ScheduleEvaluator();
    }

    private function makeFacility(
        string $id = 'test-facility',
        BookingMode $mode = BookingMode::Facility,
        array $resources = []
    ): Facility {
        return new Facility(
            id: $id,
            name: 'Test Facility',
            description: '',
            enabled: true,
            timezone: 'Europe/London',
            bookingMode: $mode,
            approvalMode: ApprovalMode::Automatic,
            availabilityWindows: [
                new AvailabilityWindow(1, '08:00', 7, '22:00'), // All week
            ],
            bookingRules: new BookingRules(3600, 86400, 3600, 0, 7776000, true),
            resources: $resources
        );
    }

    private function makeBooking(
        string $id,
        string $facilityId,
        ?string $resourceId,
        Interval $interval,
        BookingStatus $status = BookingStatus::Confirmed
    ): Booking {
        return new Booking(
            id: $id,
            facilityId: $facilityId,
            resourceId: $resourceId,
            interval: $interval,
            facilityTimezone: 'Europe/London',
            status: $status,
            customerName: 'Test',
            customerEmail: 'test@example.com',
            customerTelephone: null,
            customerNote: null,
            createdAt: new DateTimeImmutable(),
            updatedAt: new DateTimeImmutable()
        );
    }

    // --- Facility mode tests ---

    public function testFacilityModeConflictWithOverlappingBooking(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $existing = $this->makeBooking(
            'b1', 'test-facility', null,
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            )
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 11:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 13:00:00 Europe/London')
        );

        $this->assertTrue($this->detector->hasBookingConflict($facility, $candidate, null, [$existing]));
    }

    public function testFacilityModeNoConflictWithAdjacentBooking(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $existing = $this->makeBooking(
            'b1', 'test-facility', null,
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 11:00:00 Europe/London')
            )
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 11:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        $this->assertFalse($this->detector->hasBookingConflict($facility, $candidate, null, [$existing]));
    }

    public function testFacilityModeCancelledBookingDoesNotConflict(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $existing = $this->makeBooking(
            'b1', 'test-facility', null,
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            ),
            BookingStatus::Cancelled
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 10:30:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 11:30:00 Europe/London')
        );

        $this->assertFalse($this->detector->hasBookingConflict($facility, $candidate, null, [$existing]));
    }

    public function testFacilityModeRejectedBookingDoesNotConflict(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $existing = $this->makeBooking(
            'b1', 'test-facility', null,
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            ),
            BookingStatus::Rejected
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 10:30:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 11:30:00 Europe/London')
        );

        $this->assertFalse($this->detector->hasBookingConflict($facility, $candidate, null, [$existing]));
    }

    public function testFacilityModePendingBlocksWhenEnabled(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $existing = $this->makeBooking(
            'b1', 'test-facility', null,
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            ),
            BookingStatus::Pending
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 10:30:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 11:30:00 Europe/London')
        );

        $this->assertTrue($this->detector->hasBookingConflict($facility, $candidate, null, [$existing], true));
    }

    public function testFacilityModePendingDoesNotBlockWhenDisabled(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $existing = $this->makeBooking(
            'b1', 'test-facility', null,
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            ),
            BookingStatus::Pending
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 10:30:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 11:30:00 Europe/London')
        );

        $this->assertFalse($this->detector->hasBookingConflict($facility, $candidate, null, [$existing], false));
    }

    // --- Resource mode tests ---

    public function testResourceModeNoConflictWithDifferentResource(): void
    {
        $resources = [
            'room-a' => new Resource('room-a', 'Room A', '', true),
            'room-b' => new Resource('room-b', 'Room B', '', true),
        ];
        $facility = $this->makeFacility(mode: BookingMode::Resources, resources: $resources);

        $existing = $this->makeBooking(
            'b1', 'test-facility', 'room-a',
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            )
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        // Different resource - no conflict
        $this->assertFalse($this->detector->hasBookingConflict($facility, $candidate, 'room-b', [$existing]));
    }

    public function testResourceModeConflictWithSameResource(): void
    {
        $resources = [
            'room-a' => new Resource('room-a', 'Room A', '', true),
        ];
        $facility = $this->makeFacility(mode: BookingMode::Resources, resources: $resources);

        $existing = $this->makeBooking(
            'b1', 'test-facility', 'room-a',
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            )
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 11:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 13:00:00 Europe/London')
        );

        $this->assertTrue($this->detector->hasBookingConflict($facility, $candidate, 'room-a', [$existing]));
    }

    public function testResourceModeConflictWithFacilityBlock(): void
    {
        $resources = [
            'room-a' => new Resource('room-a', 'Room A', '', true),
        ];
        $facility = $this->makeFacility(mode: BookingMode::Resources, resources: $resources);

        $block = new AvailabilityBlock(
            'block1', 'test-facility', null, // facility-wide block
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            ),
            'Holiday'
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 11:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 13:00:00 Europe/London')
        );

        $this->assertTrue($this->detector->hasBlockConflict($facility, $candidate, 'room-a', [$block], []));
    }

    // --- Both mode tests ---

    public function testBothModeFacilityCandidateConflictsWithResourceBooking(): void
    {
        $resources = [
            'room-a' => new Resource('room-a', 'Room A', '', true),
        ];
        $facility = $this->makeFacility(mode: BookingMode::Both, resources: $resources);

        $existing = $this->makeBooking(
            'b1', 'test-facility', 'room-a',
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            )
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        // Whole-facility candidate conflicts with resource booking
        $this->assertTrue($this->detector->hasBookingConflict($facility, $candidate, null, [$existing]));
    }

    public function testBothModeResourceCandidateNoConflictWithDifferentResource(): void
    {
        $resources = [
            'room-a' => new Resource('room-a', 'Room A', '', true),
            'room-b' => new Resource('room-b', 'Room B', '', true),
        ];
        $facility = $this->makeFacility(mode: BookingMode::Both, resources: $resources);

        $existing = $this->makeBooking(
            'b1', 'test-facility', 'room-a',
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            )
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        // Different resource - no conflict
        $this->assertFalse($this->detector->hasBookingConflict($facility, $candidate, 'room-b', [$existing]));
    }

    public function testBothModeResourceCandidateConflictsWithFacilityBooking(): void
    {
        $resources = [
            'room-a' => new Resource('room-a', 'Room A', '', true),
        ];
        $facility = $this->makeFacility(mode: BookingMode::Both, resources: $resources);

        $existing = $this->makeBooking(
            'b1', 'test-facility', null, // whole-facility booking
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            )
        );

        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 11:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 13:00:00 Europe/London')
        );

        // Resource candidate conflicts with facility-wide booking
        $this->assertTrue($this->detector->hasBookingConflict($facility, $candidate, 'room-a', [$existing]));
    }

    // --- Schedule evaluator tests ---

    public function testIntervalWithinWindow(): void
    {
        $facility = $this->makeFacility();
        $interval = new Interval(
            new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        $this->assertTrue($this->evaluator->isWithinWindow($facility, $interval));
    }

    public function testIntervalOutsideWindow(): void
    {
        $facility = new Facility(
            id: 'test',
            name: 'Test',
            description: '',
            enabled: true,
            timezone: 'Europe/London',
            bookingMode: BookingMode::Facility,
            approvalMode: ApprovalMode::Automatic,
            availabilityWindows: [
                new AvailabilityWindow(1, '08:00', 1, '10:00'), // Monday only
            ],
            bookingRules: new BookingRules(3600, 86400, 3600, 0, 7776000, true)
        );

        // Tuesday
        $interval = new Interval(
            new DateTimeImmutable('2026-01-06 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-06 12:00:00 Europe/London')
        );

        $this->assertFalse($this->evaluator->isWithinWindow($facility, $interval));
    }

    // --- Recurring block tests ---

    public function testRecurringBlockOverlapsInterval(): void
    {
        $block = new RecurringBlock(
            'rb1', 'test-facility', null,
            1, // Monday
            '10:00', '12:00',
            'Weekly meeting'
        );

        // Monday 2026-01-05 11:00-12:00
        $interval = new Interval(
            new DateTimeImmutable('2026-01-05 11:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        $this->assertTrue($block->overlapsInterval($interval, 'Europe/London'));
    }

    public function testRecurringBlockDoesNotOverlapDifferentDay(): void
    {
        $block = new RecurringBlock(
            'rb1', 'test-facility', null,
            1, // Monday
            '10:00', '12:00',
            'Weekly meeting'
        );

        // Tuesday
        $interval = new Interval(
            new DateTimeImmutable('2026-01-06 11:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-06 12:00:00 Europe/London')
        );

        $this->assertFalse($block->overlapsInterval($interval, 'Europe/London'));
    }

    public function testRecurringBlockRespectsEffectiveFrom(): void
    {
        $block = new RecurringBlock(
            'rb1', 'test-facility', null,
            1, // Monday
            '10:00', '12:00',
            'Weekly meeting',
            null,
            new DateTimeImmutable('2026-02-01 00:00:00 Europe/London')
        );

        // Monday before effective date
        $interval = new Interval(
            new DateTimeImmutable('2026-01-05 11:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        $this->assertFalse($block->overlapsInterval($interval, 'Europe/London'));
    }

    // --- Exact overlap tests ---

    public function testExactOverlapDetected(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $interval = new Interval(
            new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );
        $existing = $this->makeBooking('b1', 'test-facility', null, $interval);

        $this->assertTrue($this->detector->hasBookingConflict($facility, $interval, null, [$existing]));
    }

    public function testContainingIntervalDetected(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $existing = $this->makeBooking(
            'b1', 'test-facility', null,
            new Interval(
                new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
            )
        );

        // Candidate contains existing
        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 09:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 13:00:00 Europe/London')
        );

        $this->assertTrue($this->detector->hasBookingConflict($facility, $candidate, null, [$existing]));
    }

    public function testContainedIntervalDetected(): void
    {
        $facility = $this->makeFacility(mode: BookingMode::Facility);
        $existing = $this->makeBooking(
            'b1', 'test-facility', null,
            new Interval(
                new DateTimeImmutable('2026-01-05 09:00:00 Europe/London'),
                new DateTimeImmutable('2026-01-05 13:00:00 Europe/London')
            )
        );

        // Candidate is contained in existing
        $candidate = new Interval(
            new DateTimeImmutable('2026-01-05 10:00:00 Europe/London'),
            new DateTimeImmutable('2026-01-05 12:00:00 Europe/London')
        );

        $this->assertTrue($this->detector->hasBookingConflict($facility, $candidate, null, [$existing]));
    }
}
