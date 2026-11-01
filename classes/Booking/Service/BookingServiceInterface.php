<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

/**
 * Interface for the booking domain service.
 *
 * This interface is coded against the spec in docs/booking-spec.md and
 * ARCHITECTURE.md. The core-logic task (t_4902ca2d) is expected to provide
 * the concrete implementation. If the actual implementation differs from
 * this interface, the mismatch must be flagged and resolved during
 * integration (task t_f865a7d9).
 *
 * All timestamps are UTC RFC3339 strings. UUIDs are server-generated.
 */
interface BookingServiceInterface
{
    /**
     * List bookings for a facility, optionally filtered by status.
     *
     * @param string      $facilityId Facility slug
     * @param string|null $status     Optional status filter, including verification_pending
     * @param int         $limit      Max results to return
     * @param int         $offset     Pagination offset
     *
     * @return array<int, array<string, mixed>> List of booking records
     */
    public function listBookings(
        string $facilityId,
        ?string $status = null,
        int $limit = 50,
        int $offset = 0
    ): array;

    /**
     * Get a single booking by UUID.
     *
     * @param string $bookingId UUIDv4
     *
     * @return array<string, mixed>|null Booking record or null if not found
     */
    public function getBooking(string $bookingId): ?array;

    /**
     * Create a new booking.
     *
     * @param array<string, mixed> $data Booking data including:
     *   - facility_id (string, required)
     *   - resource_id (string|null)
     *   - start (string, RFC3339 UTC)
     *   - end (string, RFC3339 UTC)
     *   - customer_name (string)
     *   - customer_email (string)
     *   - customer_phone (string, optional)
     *   - customer_note (string, optional)
     *   - admin_note (string, optional)
     *
     * @return array<string, mixed> Created booking record with UUID
     *
     * @throws \InvalidArgumentException On invalid input
     * @throws \RuntimeException On conflict or storage failure
     */
    public function createBooking(array $data): array;

    /**
     * Transition a booking to a new status.
     *
     * Valid transitions:
     *   verification_pending -> pending | confirmed | cancelled
     *   pending   -> confirmed | rejected | cancelled
     *   confirmed -> cancelled
     *
     * @param string $bookingId  UUIDv4
     * @param string $newStatus  Target status
     * @param string $adminNote  Optional admin note for the transition
     *
     * @return array<string, mixed> Updated booking record
     *
     * @throws \InvalidArgumentException On invalid transition
     * @throws \RuntimeException On storage failure
     */
    public function transitionBooking(string $bookingId, string $newStatus, string $adminNote = ''): array;

    /**
     * Check availability for a facility/resource in a date range.
     *
     * @param string      $facilityId Facility slug
     * @param string|null $resourceId Optional resource ID
     * @param string      $start      RFC3339 UTC start
     * @param string      $end        RFC3339 UTC end
     *
     * @return array<string, mixed> Availability info (slots, conflicts)
     */
    public function checkAvailability(
        string $facilityId,
        ?string $resourceId,
        string $start,
        string $end
    ): array;

    /**
     * Get configured facilities.
     *
     * @return array<int, array<string, mixed>> List of facility configs
     */
    public function getFacilities(): array;

    /**
     * Get a single facility by slug.
     *
     * @param string $facilityId Facility slug
     *
     * @return array<string, mixed>|null Facility config or null
     */
    public function getFacility(string $facilityId): ?array;
}
