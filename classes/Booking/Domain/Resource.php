<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

/**
 * A bookable resource within a facility.
 */
final class Resource
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $description,
        public readonly bool $enabled,
        public readonly array $access = []
    ) {
        if ($id === '' || !preg_match('/^[a-z0-9_-]+$/i', $id)) {
            throw new \InvalidArgumentException('Resource ID must be non-empty alphanumeric with hyphens/underscores.');
        }
    }
}
