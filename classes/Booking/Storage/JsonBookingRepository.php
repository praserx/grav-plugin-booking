<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Domain\BookingStatus;
use Grav\Plugin\Booking\Domain\Interval;
use DateTimeImmutable;
use RuntimeException;

/**
 * JSON file repository for bookings.
 */
final class JsonBookingRepository
{
    public function __construct(
        private readonly string $basePath,
        private readonly AtomicJsonWriter $writer
    ) {
    }

    public function save(Booking $booking): void
    {
        $path = $this->getPath($booking);
        $data = $this->serialize($booking);
        $this->writer->write($path, $data);
    }

    public function findById(string $id, string $facilityId, DateTimeImmutable $startUtc): ?Booking
    {
        $path = $this->getPathForId($id, $facilityId, $startUtc);
        $data = $this->writer->read($path);
        if ($data === null) {
            return null;
        }
        return $this->deserialize($data);
    }

    /**
     * Find all bookings for a facility in a date range.
     * @return array<Booking>
     */
    public function findByFacility(string $facilityId, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $bookings = [];
        $months = $this->getMonthsInRange($from, $to);

        foreach ($months as $month) {
            $dir = $this->getFacilityMonthDir($facilityId, $month);
            if (!is_dir($dir)) {
                continue;
            }

            $files = glob($dir . '/*.json');
            if ($files === false) {
                continue;
            }

            foreach ($files as $file) {
                $data = $this->writer->read($file);
                if ($data === null) {
                    continue;
                }

                try {
                    $booking = $this->deserialize($data);
                    // Check if booking overlaps the requested range
                    if ($booking->interval->start < $to && $booking->interval->end > $from) {
                        $bookings[] = $booking;
                    }
                } catch (\Throwable $e) {
                    // Malformed record - fail closed by skipping
                    continue;
                }
            }
        }

        return $bookings;
    }

    public function delete(Booking $booking): void
    {
        $path = $this->getPath($booking);
        $this->writer->delete($path);
    }

    private function getPath(Booking $booking): string
    {
        return $this->getPathForId($booking->id, $booking->facilityId, $booking->interval->start);
    }

    private function getPathForId(string $id, string $facilityId, DateTimeImmutable $startUtc): string
    {
        $year = $startUtc->format('Y');
        $month = $startUtc->format('m');
        return $this->basePath . "/bookings/{$facilityId}/{$year}/{$month}/{$id}.json";
    }

    private function getFacilityMonthDir(string $facilityId, DateTimeImmutable $month): string
    {
        $year = $month->format('Y');
        $monthStr = $month->format('m');
        return $this->basePath . "/bookings/{$facilityId}/{$year}/{$monthStr}";
    }

    /**
     * @return array<DateTimeImmutable>
     */
    private function getMonthsInRange(DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $months = [];
        $current = $from->setDate((int) $from->format('Y'), (int) $from->format('m'), 1);

        while ($current < $to) {
            $months[] = $current;
            $current = $current->modify('+1 month');
        }

        return $months;
    }

    private function serialize(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'facility_id' => $booking->facilityId,
            'resource_id' => $booking->resourceId,
            'start_utc' => $booking->interval->start->format(DATE_ATOM),
            'end_utc' => $booking->interval->end->format(DATE_ATOM),
            'facility_timezone' => $booking->facilityTimezone,
            'status' => $booking->status->value,
            'customer_name' => $booking->customerName,
            'customer_email' => $booking->customerEmail,
            'customer_telephone' => $booking->customerTelephone,
            'customer_note' => $booking->customerNote,
            'created_at' => $booking->createdAt->format(DATE_ATOM),
            'updated_at' => $booking->updatedAt->format(DATE_ATOM),
            'approved_at' => $booking->approvedAt?->format(DATE_ATOM),
            'rejected_at' => $booking->rejectedAt?->format(DATE_ATOM),
            'rejection_reason' => $booking->rejectionReason,
            'admin_note' => $booking->adminNote,
        ];
    }

    private function deserialize(array $data): Booking
    {
        $required = ['id', 'facility_id', 'start_utc', 'end_utc', 'facility_timezone', 'status',
                     'customer_name', 'customer_email', 'created_at', 'updated_at'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new RuntimeException("Missing required field: $field");
            }
        }

        $start = new DateTimeImmutable($data['start_utc']);
        $end = new DateTimeImmutable($data['end_utc']);
        $interval = new Interval($start, $end);

        $status = BookingStatus::from($data['status']);

        return new Booking(
            id: $data['id'],
            facilityId: $data['facility_id'],
            resourceId: $data['resource_id'] ?? null,
            interval: $interval,
            facilityTimezone: $data['facility_timezone'],
            status: $status,
            customerName: $data['customer_name'],
            customerEmail: $data['customer_email'],
            customerTelephone: $data['customer_telephone'] ?? null,
            customerNote: $data['customer_note'] ?? null,
            createdAt: new DateTimeImmutable($data['created_at']),
            updatedAt: new DateTimeImmutable($data['updated_at']),
            approvedAt: isset($data['approved_at']) ? new DateTimeImmutable($data['approved_at']) : null,
            rejectedAt: isset($data['rejected_at']) ? new DateTimeImmutable($data['rejected_at']) : null,
            rejectionReason: $data['rejection_reason'] ?? null,
            adminNote: $data['admin_note'] ?? null
        );
    }
}
