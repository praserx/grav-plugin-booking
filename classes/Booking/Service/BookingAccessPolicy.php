<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use Grav\Plugin\Booking\Domain\Facility;
use Grav\Plugin\Booking\Domain\Resource;

/** Resolves public access and group based instant approval for a booking target. */
final class BookingAccessPolicy
{
    public function canRequest(Facility $facility, ?Resource $resource, array $groups): bool
    {
        if (!$facility->enabled || ($resource !== null && !$resource->enabled)) {
            return false;
        }

        $facilityAllowed = $this->groups($facility->access['allowed_groups'] ?? []);
        $resourceAllowed = $this->groups($resource?->access['allowed_groups'] ?? []);
        $userGroups = $this->groups($groups);

        if ($userGroups !== []) {
            if ($facilityAllowed !== [] && array_intersect($facilityAllowed, $userGroups) === []) {
                return false;
            }
            return $resourceAllowed === [] || array_intersect($resourceAllowed, $userGroups) !== [];
        }

        return (bool) ($facility->access['guest_requests'] ?? true)
            && $facilityAllowed === [] && $resourceAllowed === [];
    }

    public function canInstantlyApprove(Facility $facility, ?Resource $resource, array $groups): bool
    {
        $resourceGroups = $this->groups($resource?->access['instant_approval_groups'] ?? []);
        $facilityGroups = $this->groups($facility->access['instant_approval_groups'] ?? []);
        $eligible = $resourceGroups !== [] ? $resourceGroups : $facilityGroups;
        return $eligible !== [] && array_intersect($eligible, $this->groups($groups)) !== [];
    }

    public function groups(mixed $groups): array
    {
        if (!is_array($groups)) {
            return [];
        }
        $normalized = [];
        foreach ($groups as $key => $value) {
            $group = is_string($key) && !is_int($key) ? $key : (is_string($value) ? $value : '');
            if ($group !== '') {
                $normalized[] = strtolower($group);
            }
        }
        return array_values(array_unique($normalized));
    }
}
