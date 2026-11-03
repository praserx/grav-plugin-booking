<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Blueprint;

use Grav\Plugin\Booking\ServiceLocator;

/**
 * Supplies the enabled facilities for the Booking Form page blueprint.
 */
final class BookingPageOptions
{
    /**
     * @return array<string, string> Facility IDs mapped to display names.
     */
    public static function facilityOptions(): array
    {
        $options = [];
        foreach (ServiceLocator::instance()->getCatalog()->all() as $facility) {
            if ($facility->enabled) {
                $options[$facility->id] = $facility->name;
            }
        }

        return $options;
    }
}
