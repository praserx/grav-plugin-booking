<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

/**
 * A top-level bookable location.
 */
final class Facility
{
    /** @var array<string, Resource> */
    private array $resources = [];

    /**
     * @param array<AvailabilityWindow> $availabilityWindows
     * @param array<string, Resource> $resources
     */
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $description,
        public readonly bool $enabled,
        public readonly string $timezone,
        public readonly BookingMode $bookingMode,
        public readonly ApprovalMode $approvalMode,
        public readonly array $availabilityWindows,
        public readonly BookingRules $bookingRules,
        array $resources = [],
        public readonly array $access = [],
        public readonly array $notifications = []
    ) {
        if ($id === '' || !preg_match('/^[a-z0-9_-]+$/i', $id)) {
            throw new \InvalidArgumentException('Facility ID must be non-empty alphanumeric with hyphens/underscores.');
        }
        if (!in_array($timezone, \DateTimeZone::listIdentifiers(), true)) {
            throw new \InvalidArgumentException("Invalid IANA timezone: $timezone");
        }
        if (empty($availabilityWindows)) {
            throw new \InvalidArgumentException('Facility must have at least one availability window.');
        }
        if ($bookingMode !== BookingMode::Facility && empty($resources)) {
            throw new \InvalidArgumentException('Resource/both mode requires at least one resource.');
        }

        foreach ($resources as $resource) {
            $this->resources[$resource->id] = $resource;
        }
    }

    public function getResource(string $id): ?Resource
    {
        return $this->resources[$id] ?? null;
    }

    /** @return array<string, Resource> */
    public function getResources(): array
    {
        return $this->resources;
    }

    public function hasResource(string $id): bool
    {
        return isset($this->resources[$id]);
    }
}
