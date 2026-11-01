<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use DateTimeImmutable;
use RuntimeException;

final class SqliteFacilityRepository
{
    public function __construct(private readonly SqliteDatabase $database)
    {
    }

    /** @return array<int, array<string, mixed>> */
    public function all(): array
    {
        $rows = $this->database->pdo()->query('SELECT data_json FROM facilities ORDER BY id')->fetchAll();
        return array_map(fn (array $row): array => $this->decode($row['data_json']), $rows);
    }

    public function get(string $id): ?array
    {
        $statement = $this->database->pdo()->prepare('SELECT data_json FROM facilities WHERE id = :id');
        $statement->execute([':id' => $id]);
        $json = $statement->fetchColumn();
        return is_string($json) ? $this->decode($json) : null;
    }

    public function save(array $facility): void
    {
        $required = ['id', 'name', 'timezone', 'booking_mode', 'approval_mode'];
        foreach ($required as $field) {
            if (!isset($facility[$field]) || !is_string($facility[$field]) || trim($facility[$field]) === '') {
                throw new RuntimeException('Facility field is required: ' . $field);
            }
        }
        $pdo = $this->database->pdo();
        $startedTransaction = !$this->database->inTransaction();
        if ($startedTransaction) {
            $this->database->beginImmediate();
        }
        try {
        $newResourceIds = [];
        foreach (($facility['resources'] ?? []) as $resource) {
            if (is_array($resource) && isset($resource['id']) && is_string($resource['id'])) {
                $newResourceIds[$resource['id']] = true;
            }
        }
        $referenced = [];
        foreach (['bookings', 'availability_blocks'] as $table) {
            $check = $pdo->prepare("SELECT DISTINCT resource_id FROM {$table} WHERE facility_id = :facility_id AND resource_id IS NOT NULL");
            $check->execute([':facility_id' => $facility['id']]);
            foreach ($check->fetchAll() as $row) {
                $referenced[(string) $row['resource_id']] = true;
            }
        }
        $recurringCheck = $pdo->prepare('SELECT data_json FROM recurring_blocks WHERE facility_id = :facility_id');
        $recurringCheck->execute([':facility_id' => $facility['id']]);
        foreach ($recurringCheck->fetchAll() as $row) {
            $block = json_decode($row['data_json'], true);
            if (is_array($block) && !empty($block['resource_id'])) {
                $referenced[(string) $block['resource_id']] = true;
            }
        }
        foreach ($referenced as $resourceId => $_) {
            if (!isset($newResourceIds[$resourceId])) {
                throw new RuntimeException('Resource ' . $resourceId . ' has booking or availability history. Disable it instead of removing it.');
            }
        }
        $bookedScopes = $pdo->prepare('SELECT DISTINCT resource_id FROM bookings WHERE facility_id = :facility_id');
        $bookedScopes->execute([':facility_id' => $facility['id']]);
        foreach ($bookedScopes->fetchAll() as $row) {
            if (($facility['booking_mode'] === 'facility' && $row['resource_id'] !== null)
                || ($facility['booking_mode'] === 'resources' && $row['resource_id'] === null)) {
                throw new RuntimeException('Booking mode cannot change while existing bookings use the current mode.');
            }
        }

        $statement = $pdo->prepare(<<<'SQL'
            INSERT INTO facilities (id, enabled, timezone, booking_mode, approval_mode, data_json, updated_at)
            VALUES (:id, :enabled, :timezone, :booking_mode, :approval_mode, :data_json, :updated_at)
            ON CONFLICT(id) DO UPDATE SET
                enabled = excluded.enabled,
                timezone = excluded.timezone,
                booking_mode = excluded.booking_mode,
                approval_mode = excluded.approval_mode,
                data_json = excluded.data_json,
                updated_at = excluded.updated_at
            SQL);
        $statement->execute([
            ':id' => $facility['id'],
            ':enabled' => !empty($facility['enabled']) ? 1 : 0,
            ':timezone' => $facility['timezone'],
            ':booking_mode' => $facility['booking_mode'],
            ':approval_mode' => $facility['approval_mode'],
            ':data_json' => json_encode($facility, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
            ':updated_at' => (new DateTimeImmutable('now'))->format(DATE_ATOM),
        ]);

        $resourceDelete = $pdo->prepare('DELETE FROM resources WHERE facility_id = :facility_id');
        $resourceDelete->execute([':facility_id' => $facility['id']]);
        $resourceInsert = $pdo->prepare(
            'INSERT INTO resources (facility_id, id, enabled, data_json) VALUES (:facility_id, :id, :enabled, :data_json)'
        );
        foreach (($facility['resources'] ?? []) as $resource) {
            if (!is_array($resource) || !isset($resource['id'], $resource['name'])) {
                throw new RuntimeException('Facility resource data is invalid.');
            }
            $resourceInsert->execute([
                ':facility_id' => $facility['id'],
                ':id' => $resource['id'],
                ':enabled' => !empty($resource['enabled']) ? 1 : 0,
                ':data_json' => json_encode($resource, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
            ]);
        }

        $windowDelete = $pdo->prepare('DELETE FROM availability_windows WHERE facility_id = :facility_id');
        $windowDelete->execute([':facility_id' => $facility['id']]);
        $windowInsert = $pdo->prepare(<<<'SQL'
            INSERT INTO availability_windows
                (facility_id, position, start_weekday, start_time, end_weekday, end_time)
            VALUES (:facility_id, :position, :start_weekday, :start_time, :end_weekday, :end_time)
            SQL);
        foreach (($facility['availability_windows'] ?? []) as $position => $window) {
            if (!is_array($window) || !isset($window['start'], $window['end'])) {
                throw new RuntimeException('Facility availability window is invalid.');
            }
            [$startDay, $startTime] = $this->parseWindow($window['start']);
            [$endDay, $endTime] = $this->parseWindow($window['end']);
            $windowInsert->execute([
                ':facility_id' => $facility['id'],
                ':position' => $position,
                ':start_weekday' => $startDay,
                ':start_time' => $startTime,
                ':end_weekday' => $endDay,
                ':end_time' => $endTime,
            ]);
        }

        $rules = $pdo->prepare(
            'INSERT INTO booking_rules (facility_id, data_json) VALUES (:facility_id, :data_json)
             ON CONFLICT(facility_id) DO UPDATE SET data_json = excluded.data_json'
        );
        $rules->execute([
            ':facility_id' => $facility['id'],
            ':data_json' => json_encode($facility['booking_rules'] ?? [], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
        ]);

        $notifications = $pdo->prepare(
            'INSERT INTO facility_notifications (facility_id, data_json) VALUES (:facility_id, :data_json)
             ON CONFLICT(facility_id) DO UPDATE SET data_json = excluded.data_json'
        );
        $notifications->execute([
            ':facility_id' => $facility['id'],
            ':data_json' => json_encode($facility['notifications'] ?? ['enabled' => false], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
        ]);
        if ($startedTransaction) {
            $this->database->commit();
        }
        } catch (\Throwable $e) {
            if ($startedTransaction) {
                $this->database->rollback();
            }
            throw $e;
        }
    }

    public function delete(string $id): void
    {
        $statement = $this->database->pdo()->prepare('DELETE FROM facilities WHERE id = :id');
        $statement->execute([':id' => $id]);
    }

    private function decode(string $json): array
    {
        $data = json_decode($json, true);
        if (!is_array($data)) {
            throw new RuntimeException('Facility database record contains invalid JSON.');
        }
        return $data;
    }

    /** @return array{0:int, 1:string} */
    private function parseWindow(mixed $value): array
    {
        $days = ['mon' => 1, 'tue' => 2, 'wed' => 3, 'thu' => 4, 'fri' => 5, 'sat' => 6, 'sun' => 7];
        if (!is_string($value) || !preg_match('/^(mon|tue|wed|thu|fri|sat|sun)\\s+(\\d{2}:\\d{2})$/i', trim($value), $matches)) {
            throw new RuntimeException('Availability window must use the weekday and HH:MM format.');
        }
        return [$days[strtolower($matches[1])], $matches[2]];
    }
}
