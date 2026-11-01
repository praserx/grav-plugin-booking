<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use Grav\Plugin\Booking\Domain\AvailabilityWindow;
use Grav\Plugin\Booking\Domain\Facility;
use Grav\Plugin\Booking\Domain\Interval;

/**
 * Evaluates whether an interval fits within facility availability windows.
 */
final class ScheduleEvaluator
{
    /**
     * Check if an interval fits wholly inside at least one availability window.
     */
    public function isWithinWindow(Facility $facility, Interval $interval): bool
    {
        foreach ($facility->availabilityWindows as $window) {
            if ($window->containsInterval($interval, $facility->timezone)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get all availability windows that could contain the interval.
     * @return array<AvailabilityWindow>
     */
    public function getMatchingWindows(Facility $facility, Interval $interval): array
    {
        $matching = [];
        foreach ($facility->availabilityWindows as $window) {
            if ($window->containsInterval($interval, $facility->timezone)) {
                $matching[] = $window;
            }
        }
        return $matching;
    }
}
