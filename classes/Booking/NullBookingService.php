<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking;

use Grav\Plugin\Booking\Service\BookingServiceInterface;

/**
 * Null implementation of BookingServiceInterface.
 *
 * Used as a fallback when the core-logic service is not yet available.
 * Returns empty results for all queries and rejects all mutations.
 *
 * This class MUST be replaced during integration (task t_f865a7d9) with
 * the real implementation from the core-logic task (t_4902ca2d).
 */
final class NullBookingService implements BookingServiceInterface
{
    public function listBookings(string $facilityId, ?string $status = null, int $limit = 50, int $offset = 0): array
    {
        return [];
    }

    public function getBooking(string $bookingId): ?array
    {
        return null;
    }

    public function createBooking(array $data): array
    {
        throw new \RuntimeException(
            'Booking service is not yet available. The core booking logic has not been implemented. '
            . 'This will be resolved during integration (task t_f865a7d9).'
        );
    }

    public function transitionBooking(string $bookingId, string $newStatus, string $adminNote = ''): array
    {
        throw new \RuntimeException(
            'Booking service is not yet available. The core booking logic has not been implemented.'
        );
    }

    public function checkAvailability(string $facilityId, ?string $resourceId, string $start, string $end): array
    {
        return [
            'available' => true,
            'slots' => [],
            'message' => 'Booking service is not yet available. Showing placeholder response.',
        ];
    }

    public function getFacilities(): array
    {
        return [];
    }

    public function getFacility(string $facilityId): ?array
    {
        return null;
    }
}
