<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use Grav\Plugin\Booking\Domain\AvailabilityBlock;
use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Domain\BookingMode;
use Grav\Plugin\Booking\Domain\Facility;
use Grav\Plugin\Booking\Domain\Interval;
use Grav\Plugin\Booking\Domain\RecurringBlock;

/**
 * Detects conflicts between candidate intervals and existing occupancy.
 */
final class ConflictDetector
{
    /**
     * Check if a candidate interval conflicts with existing bookings.
     *
     * @param array<Booking> $existingBookings
     */
    public function hasBookingConflict(
        Facility $facility,
        Interval $candidate,
        ?string $resourceId,
        array $existingBookings,
        bool $pendingBlocks = true
    ): bool {
        foreach ($existingBookings as $booking) {
            if (!$booking->status->blocksAvailability($pendingBlocks)) {
                continue;
            }

            if (!$booking->interval->overlaps($candidate)) {
                continue;
            }

            // Check conflict based on booking mode
            if ($this->bookingConflicts($facility->bookingMode, $resourceId, $booking->resourceId)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a candidate interval conflicts with availability blocks.
     *
     * @param array<AvailabilityBlock> $blocks
     * @param array<RecurringBlock> $recurringBlocks
     */
    public function hasBlockConflict(
        Facility $facility,
        Interval $candidate,
        ?string $resourceId,
        array $blocks,
        array $recurringBlocks
    ): bool {
        // Check fixed blocks
        foreach ($blocks as $block) {
            if (!$block->interval->overlaps($candidate)) {
                continue;
            }

            if ($this->blockConflicts($facility->bookingMode, $resourceId, $block->resourceId)) {
                return true;
            }
        }

        // Check recurring blocks
        foreach ($recurringBlocks as $recurring) {
            if ($recurring->facilityId !== $facility->id) {
                continue;
            }

            if ($this->recurringBlockConflicts($facility->bookingMode, $resourceId, $recurring->resourceId)) {
                if ($recurring->overlapsInterval($candidate, $facility->timezone)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Determine if two bookings conflict based on facility mode.
     */
    private function bookingConflicts(BookingMode $mode, ?string $candidateResource, ?string $existingResource): bool
    {
        return match ($mode) {
            BookingMode::Facility => true, // Any overlap conflicts
            BookingMode::Resources => $candidateResource === $existingResource, // Same resource conflicts
            BookingMode::Both => $this->bothModeBookingConflict($candidateResource, $existingResource),
        };
    }

    /**
     * Both mode: whole-facility conflicts with everything, resource conflicts with facility and same resource.
     */
    private function bothModeBookingConflict(?string $candidateResource, ?string $existingResource): bool
    {
        // Whole-facility candidate conflicts with everything
        if ($candidateResource === null) {
            return true;
        }
        // Resource candidate conflicts with whole-facility or same resource
        return $existingResource === null || $candidateResource === $existingResource;
    }

    /**
     * Determine if a booking conflicts with a fixed block.
     */
    private function blockConflicts(BookingMode $mode, ?string $candidateResource, ?string $blockResource): bool
    {
        return match ($mode) {
            BookingMode::Facility => true,
            BookingMode::Resources => $candidateResource === $blockResource || $blockResource === null,
            BookingMode::Both => $this->bothModeBlockConflict($candidateResource, $blockResource),
        };
    }

    /**
     * Determine if a booking conflicts with a recurring block.
     */
    private function recurringBlockConflicts(BookingMode $mode, ?string $candidateResource, ?string $blockResource): bool
    {
        return $this->blockConflicts($mode, $candidateResource, $blockResource);
    }

    /**
     * Both mode block conflict logic.
     */
    private function bothModeBlockConflict(?string $candidateResource, ?string $blockResource): bool
    {
        // Whole-facility candidate conflicts with any block
        if ($candidateResource === null) {
            return true;
        }
        // Resource candidate conflicts with facility block or same-resource block
        return $blockResource === null || $candidateResource === $blockResource;
    }
}
