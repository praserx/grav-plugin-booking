<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use DateTimeImmutable;
use DateTimeZone;
use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Domain\BookingStatus;
use Grav\Plugin\Booking\Domain\Interval;
use RuntimeException;

final class SqliteBookingRepository
{
    public function __construct(private readonly SqliteDatabase $database)
    {
    }

    public function save(Booking $booking): void
    {
        $data = $this->serialize($booking);
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            INSERT INTO bookings
                (id, facility_id, resource_id, start_utc, end_utc, status, created_at, updated_at, data_json)
            VALUES
                (:id, :facility_id, :resource_id, :start_utc, :end_utc, :status, :created_at, :updated_at, :data_json)
            ON CONFLICT(id) DO UPDATE SET
                facility_id = excluded.facility_id,
                resource_id = excluded.resource_id,
                start_utc = excluded.start_utc,
                end_utc = excluded.end_utc,
                status = excluded.status,
                updated_at = excluded.updated_at,
                data_json = excluded.data_json
            SQL);
        $statement->execute([
            ':id' => $booking->id,
            ':facility_id' => $booking->facilityId,
            ':resource_id' => $booking->resourceId,
            ':start_utc' => $this->timestamp($booking->interval->start),
            ':end_utc' => $this->timestamp($booking->interval->end),
            ':status' => $booking->status->value,
            ':created_at' => $this->timestamp($booking->createdAt),
            ':updated_at' => $this->timestamp($booking->updatedAt),
            ':data_json' => $this->encode($data),
        ]);
    }

    public function findById(string $id, string $facilityId, DateTimeImmutable $startUtc): ?Booking
    {
        $statement = $this->database->pdo()->prepare(
            'SELECT data_json FROM bookings WHERE id = :id AND facility_id = :facility_id'
        );
        $statement->execute([':id' => $id, ':facility_id' => $facilityId]);
        $json = $statement->fetchColumn();
        return is_string($json) ? $this->deserialize($json) : null;
    }

    public function findByIdGlobal(string $id): ?Booking
    {
        $statement = $this->database->pdo()->prepare('SELECT data_json FROM bookings WHERE id = :id');
        $statement->execute([':id' => $id]);
        $json = $statement->fetchColumn();
        return is_string($json) ? $this->deserialize($json) : null;
    }

    /** @return array<Booking> */
    public function findByFacility(string $facilityId, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            SELECT data_json FROM bookings
            WHERE facility_id = :facility_id
              AND start_utc < :to_utc
              AND end_utc > :from_utc
            ORDER BY start_utc ASC
            SQL);
        $statement->execute([
            ':facility_id' => $facilityId,
            ':from_utc' => $this->timestamp($from),
            ':to_utc' => $this->timestamp($to),
        ]);

        return array_map(
            fn (array $row): Booking => $this->deserialize($row['data_json']),
            $statement->fetchAll()
        );
    }

    /**
     * Filtered, paginated admin query. Returns [bookings, total].
     *
     * @return array{0: array<Booking>, 1: int}
     */
    public function listForAdmin(
        ?string $facilityId,
        ?string $status,
        ?DateTimeImmutable $from,
        ?DateTimeImmutable $to,
        int $limit,
        int $offset
    ): array {
        $where = [];
        $params = [];
        if ($facilityId !== null && $facilityId !== '') {
            $where[] = 'facility_id = :facility_id';
            $params[':facility_id'] = $facilityId;
        }
        if ($status !== null && $status !== '') {
            $where[] = 'status = :status';
            $params[':status'] = $status;
        }
        if ($from !== null) {
            $where[] = 'end_utc > :from_utc';
            $params[':from_utc'] = $this->timestamp($from);
        }
        if ($to !== null) {
            $where[] = 'start_utc < :to_utc';
            $params[':to_utc'] = $this->timestamp($to);
        }
        $clause = $where === [] ? '' : ' WHERE ' . implode(' AND ', $where);

        $count = $this->database->pdo()->prepare('SELECT COUNT(*) FROM bookings' . $clause);
        $count->execute($params);
        $total = (int) $count->fetchColumn();

        $query = $this->database->pdo()->prepare(
            'SELECT data_json FROM bookings' . $clause
            . ' ORDER BY start_utc DESC LIMIT :limit OFFSET :offset'
        );
        foreach ($params as $key => $value) {
            $query->bindValue($key, $value);
        }
        $query->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $query->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $query->execute();

        $bookings = array_map(
            fn (array $row): Booking => $this->deserialize($row['data_json']),
            $query->fetchAll()
        );
        return [$bookings, $total];
    }

    public function delete(Booking $booking): void
    {
        $statement = $this->database->pdo()->prepare(
            'DELETE FROM bookings WHERE id = :id AND facility_id = :facility_id'
        );
        $statement->execute([':id' => $booking->id, ':facility_id' => $booking->facilityId]);
        $redact = $this->database->pdo()->prepare(
            "UPDATE notification_deliveries SET recipient = '', last_error = NULL WHERE booking_id = :id"
        );
        $redact->execute([':id' => $booking->id]);
    }

    public function importArray(array $data): Booking
    {
        return $this->deserialize($this->encode($data));
    }

    public function recordEvent(string $bookingId, string $action, string $actor, array $metadata = []): void
    {
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            INSERT INTO booking_events (booking_id, action, actor, happened_at, metadata_json)
            VALUES (:booking_id, :action, :actor, :happened_at, :metadata_json)
            SQL);
        $statement->execute([
            ':booking_id' => $bookingId,
            ':action' => $action,
            ':actor' => $actor,
            ':happened_at' => $this->timestamp(new DateTimeImmutable('now', new DateTimeZone('UTC'))),
            ':metadata_json' => $this->encode($metadata),
        ]);
    }

    /** @return array<array{id:int, action:string, actor:string, happened_at:string, metadata:array}> */
    public function eventsFor(string $bookingId): array
    {
        $statement = $this->database->pdo()->prepare(
            'SELECT id, action, actor, happened_at, metadata_json FROM booking_events WHERE booking_id = :id ORDER BY id'
        );
        $statement->execute([':id' => $bookingId]);
        $events = [];
        foreach ($statement->fetchAll() as $row) {
            $events[] = [
                'id' => (int) $row['id'],
                'action' => $row['action'],
                'actor' => $row['actor'],
                'happened_at' => $row['happened_at'],
                'metadata' => json_decode($row['metadata_json'], true) ?: [],
            ];
        }
        return $events;
    }

    private function serialize(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'facility_id' => $booking->facilityId,
            'resource_id' => $booking->resourceId,
            'start_utc' => $this->timestamp($booking->interval->start),
            'end_utc' => $this->timestamp($booking->interval->end),
            'facility_timezone' => $booking->facilityTimezone,
            'status' => $booking->status->value,
            'customer_name' => $booking->customerName,
            'customer_email' => $booking->customerEmail,
            'customer_telephone' => $booking->customerTelephone,
            'customer_note' => $booking->customerNote,
            'created_at' => $this->timestamp($booking->createdAt),
            'updated_at' => $this->timestamp($booking->updatedAt),
            'approved_at' => $booking->approvedAt ? $this->timestamp($booking->approvedAt) : null,
            'rejected_at' => $booking->rejectedAt ? $this->timestamp($booking->rejectedAt) : null,
            'rejection_reason' => $booking->rejectionReason,
            'admin_note' => $booking->adminNote,
            'requester_username' => $booking->requesterUsername,
        ];
    }

    private function deserialize(string $json): Booking
    {
        $data = json_decode($json, true);
        if (!is_array($data)) {
            throw new RuntimeException('Booking database contains invalid JSON.');
        }
        $required = ['id', 'facility_id', 'start_utc', 'end_utc', 'facility_timezone', 'status',
            'customer_name', 'customer_email', 'created_at', 'updated_at'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new RuntimeException('Booking database record is missing ' . $field . '.');
            }
        }
        $interval = new Interval(new DateTimeImmutable($data['start_utc']), new DateTimeImmutable($data['end_utc']));

        return new Booking(
            id: (string) $data['id'],
            facilityId: (string) $data['facility_id'],
            resourceId: isset($data['resource_id']) ? (string) $data['resource_id'] : null,
            interval: $interval,
            facilityTimezone: (string) $data['facility_timezone'],
            status: BookingStatus::from((string) $data['status']),
            customerName: (string) $data['customer_name'],
            customerEmail: (string) $data['customer_email'],
            customerTelephone: $data['customer_telephone'] ?? null,
            customerNote: $data['customer_note'] ?? null,
            createdAt: new DateTimeImmutable($data['created_at']),
            updatedAt: new DateTimeImmutable($data['updated_at']),
            approvedAt: isset($data['approved_at']) ? new DateTimeImmutable($data['approved_at']) : null,
            rejectedAt: isset($data['rejected_at']) ? new DateTimeImmutable($data['rejected_at']) : null,
            rejectionReason: $data['rejection_reason'] ?? null,
            adminNote: $data['admin_note'] ?? null,
            requesterUsername: $data['requester_username'] ?? null
        );
    }

    private function timestamp(DateTimeImmutable $date): string
    {
        return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\\TH:i:s\\Z');
    }

    private function encode(array $data): string
    {
        return json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    }
}
