<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use Grav\Plugin\Booking\Configuration\FacilityCatalog;
use PHPUnit\Framework\TestCase;

final class FacilityCatalogTest extends TestCase
{
    public function testLoadsFacilityFromConfig(): void
    {
        $config = [
            [
                'id' => 'city-hall',
                'name' => 'City Hall',
                'description' => 'Main hall',
                'enabled' => true,
                'timezone' => 'Europe/London',
                'booking_mode' => 'facility',
                'approval_mode' => 'automatic',
                'availability_windows' => [
                    ['start' => 'mon 08:00', 'end' => 'fri 22:00'],
                ],
                'booking_rules' => [
                    'minimum_duration_seconds' => 3600,
                    'maximum_duration_seconds' => 28800,
                    'booking_interval_seconds' => 3600,
                    'minimum_advance_notice_seconds' => 3600,
                    'maximum_horizon_seconds' => 7776000,
                    'pending_blocks_availability' => true,
                ],
            ],
        ];

        $catalog = new FacilityCatalog($config);

        $this->assertTrue($catalog->has('city-hall'));
        $facility = $catalog->get('city-hall');
        $this->assertNotNull($facility);
        $this->assertSame('City Hall', $facility->name);
        $this->assertSame('Europe/London', $facility->timezone);
        $this->assertSame('facility', $facility->bookingMode->value);
        $this->assertSame('automatic', $facility->approvalMode->value);
    }

    public function testLoadsFacilityWithResources(): void
    {
        $config = [
            [
                'id' => 'scout-hq',
                'name' => 'Scout HQ',
                'timezone' => 'Europe/London',
                'booking_mode' => 'resources',
                'approval_mode' => 'manual',
                'availability_windows' => [
                    ['start' => 'mon 08:00', 'end' => 'sun 22:00'],
                ],
                'booking_rules' => [
                    'minimum_duration_seconds' => 3600,
                    'maximum_duration_seconds' => 86400,
                    'booking_interval_seconds' => 3600,
                    'minimum_advance_notice_seconds' => 0,
                    'maximum_horizon_seconds' => 7776000,
                ],
                'resources' => [
                    ['id' => 'room-a', 'name' => 'Room A', 'enabled' => true],
                    ['id' => 'room-b', 'name' => 'Room B', 'enabled' => false],
                ],
            ],
        ];

        $catalog = new FacilityCatalog($config);
        $facility = $catalog->get('scout-hq');
        $this->assertNotNull($facility);
        $this->assertTrue($facility->hasResource('room-a'));
        $this->assertTrue($facility->hasResource('room-b'));
        $this->assertFalse($facility->getResource('room-b')->enabled);
    }

    public function testRejectsMissingRequiredField(): void
    {
        $this->expectException(\RuntimeException::class);
        new FacilityCatalog([['id' => 'test']]); // Missing many required fields
    }

    public function testRejectsInvalidTimezone(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new FacilityCatalog([
            [
                'id' => 'test',
                'name' => 'Test',
                'timezone' => 'Invalid/Timezone',
                'booking_mode' => 'facility',
                'approval_mode' => 'automatic',
                'availability_windows' => [['start' => 'mon 08:00', 'end' => 'fri 22:00']],
                'booking_rules' => [],
            ],
        ]);
    }

    public function testResourceModeRequiresResources(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new FacilityCatalog([
            [
                'id' => 'test',
                'name' => 'Test',
                'timezone' => 'Europe/London',
                'booking_mode' => 'resources',
                'approval_mode' => 'automatic',
                'availability_windows' => [['start' => 'mon 08:00', 'end' => 'fri 22:00']],
                'booking_rules' => [],
                // No resources
            ],
        ]);
    }
}
