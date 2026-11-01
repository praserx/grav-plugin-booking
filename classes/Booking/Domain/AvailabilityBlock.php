<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

/**
 * An availability block (unavailable interval).
 */
final class AvailabilityBlock
{
    public function __construct(
        public readonly string $id,
        public readonly string $facilityId,
        public readonly ?string $resourceId,
        public readonly Interval $interval,
        public readonly string $title,
        public readonly ?string $description
    ) {
        if ($title === '') {
            throw new \InvalidArgumentException('Block title must not be empty.');
        }
    }

    public function isForFacility(): bool
    {
        return $this->resourceId === null;
    }

    public function isFor(string $facilityId, ?string $resourceId): bool
    {
        return $this->facilityId === $facilityId && $this->resourceId === $resourceId;
    }
}
