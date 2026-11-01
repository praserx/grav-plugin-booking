<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Configuration;

use Grav\Plugin\Booking\Domain\AvailabilityWindow;
use Grav\Plugin\Booking\Domain\BookingMode;
use Grav\Plugin\Booking\Domain\BookingRules;
use Grav\Plugin\Booking\Domain\ApprovalMode;
use Grav\Plugin\Booking\Domain\Facility;
use Grav\Plugin\Booking\Domain\Resource;
use RuntimeException;

/**
 * Loads facility configuration from YAML/array data.
 */
final class FacilityCatalog
{
    /** @var array<string, Facility> */
    private array $facilities = [];

    /**
     * @param array $config Raw configuration array (typically from plugins.booking.facilities)
     */
    public function __construct(array $config)
    {
        foreach ($config as $facilityData) {
            $facility = $this->buildFacility($facilityData);
            $this->facilities[$facility->id] = $facility;
        }
    }

    public function get(string $id): ?Facility
    {
        return $this->facilities[$id] ?? null;
    }

    /** @return array<string, Facility> */
    public function all(): array
    {
        return $this->facilities;
    }

    public function has(string $id): bool
    {
        return isset($this->facilities[$id]);
    }

    private function buildFacility(array $data): Facility
    {
        $required = ['id', 'name', 'timezone', 'booking_mode', 'approval_mode', 'availability_windows', 'booking_rules'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new RuntimeException("Facility config missing required field: $field");
            }
        }

        $windows = [];
        foreach ($data['availability_windows'] as $windowData) {
            $windows[] = $this->buildWindow($windowData);
        }

        $rules = $this->buildRules($data['booking_rules']);

        $resources = [];
        if (isset($data['resources'])) {
            foreach ($data['resources'] as $resourceData) {
                $resource = $this->buildResource($resourceData);
                $resources[$resource->id] = $resource;
            }
        }

        return new Facility(
            id: (string) $data['id'],
            name: (string) $data['name'],
            description: (string) ($data['description'] ?? ''),
            enabled: (bool) ($data['enabled'] ?? true),
            timezone: (string) $data['timezone'],
            bookingMode: BookingMode::from((string) $data['booking_mode']),
            approvalMode: ApprovalMode::from((string) $data['approval_mode']),
            availabilityWindows: $windows,
            bookingRules: $rules,
            resources: $resources,
            access: is_array($data['access'] ?? null) ? $data['access'] : [],
            notifications: is_array($data['notifications'] ?? null) ? $data['notifications'] : []
        );
    }

    private function buildWindow(array $data): AvailabilityWindow
    {
        if (!isset($data['start']) || !isset($data['end'])) {
            throw new RuntimeException('Availability window must have start and end.');
        }

        [$startWeekday, $startTime] = $this->parseWindowSpec($data['start']);
        [$endWeekday, $endTime] = $this->parseWindowSpec($data['end']);

        return new AvailabilityWindow($startWeekday, $startTime, $endWeekday, $endTime);
    }

    private function parseWindowSpec(string $spec): array
    {
        $spec = strtolower(trim($spec));
        $days = ['mon' => 1, 'tue' => 2, 'wed' => 3, 'thu' => 4, 'fri' => 5, 'sat' => 6, 'sun' => 7];

        if (!preg_match('/^(mon|tue|wed|thu|fri|sat|sun)\s+(\d{2}:\d{2})$/', $spec, $matches)) {
            throw new RuntimeException("Invalid window spec: $spec (expected 'mon 08:00' format)");
        }

        return [$days[$matches[1]], $matches[2]];
    }

    private function buildRules(array $data): BookingRules
    {
        return new BookingRules(
            minimumDurationSeconds: (int) ($data['minimum_duration_seconds'] ?? 3600),
            maximumDurationSeconds: (int) ($data['maximum_duration_seconds'] ?? 86400),
            bookingIntervalSeconds: (int) ($data['booking_interval_seconds'] ?? 3600),
            minimumAdvanceNoticeSeconds: (int) ($data['minimum_advance_notice_seconds'] ?? 0),
            maximumHorizonSeconds: (int) ($data['maximum_horizon_seconds'] ?? 7776000), // 90 days
            // Pending requests reserve their slot until approved, rejected, or cancelled.
            pendingBlocksAvailability: true
        );
    }

    private function buildResource(array $data): Resource
    {
        $required = ['id', 'name'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new RuntimeException("Resource config missing required field: $field");
            }
        }

        return new Resource(
            id: (string) $data['id'],
            name: (string) $data['name'],
            description: (string) ($data['description'] ?? ''),
            enabled: (bool) ($data['enabled'] ?? true),
            access: [
                'allowed_groups' => array_values(array_filter((array) ($data['allowed_groups'] ?? []), 'is_string')),
                'instant_approval_groups' => array_values(array_filter((array) ($data['instant_approval_groups'] ?? []), 'is_string')),
            ]
        );
    }
}
