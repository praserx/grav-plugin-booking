<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use DateTimeImmutable;
use DateTimeZone;
use Grav\Plugin\Booking\Domain\RecurringBlock;
use RuntimeException;

final class SqliteRecurringBlockRepository
{
    public function __construct(private readonly SqliteDatabase $database)
    {
    }

    public function save(RecurringBlock $block): void
    {
        $data = $this->serialize($block);
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            INSERT INTO recurring_blocks (id, facility_id, data_json)
            VALUES (:id, :facility_id, :data_json)
            ON CONFLICT(id) DO UPDATE SET
                facility_id = excluded.facility_id,
                data_json = excluded.data_json
            SQL);
        $statement->execute([
            ':id' => $block->id,
            ':facility_id' => $block->facilityId,
            ':data_json' => json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
        ]);
    }

    public function findById(string $id): ?RecurringBlock
    {
        $statement = $this->database->pdo()->prepare('SELECT data_json FROM recurring_blocks WHERE id = :id');
        $statement->execute([':id' => $id]);
        $json = $statement->fetchColumn();
        return is_string($json) ? $this->deserialize($json) : null;
    }

    /** @return array<RecurringBlock> */
    public function findByFacility(string $facilityId): array
    {
        $statement = $this->database->pdo()->prepare(
            'SELECT data_json FROM recurring_blocks WHERE facility_id = :facility_id ORDER BY id'
        );
        $statement->execute([':facility_id' => $facilityId]);
        return array_map(
            fn (array $row): RecurringBlock => $this->deserialize($row['data_json']),
            $statement->fetchAll()
        );
    }

    /** @return array<RecurringBlock> */
    public function listForAdmin(?string $facilityId = null): array
    {
        if ($facilityId === null) {
            $statement = $this->database->pdo()->query('SELECT data_json FROM recurring_blocks ORDER BY facility_id, id');
        } else {
            $statement = $this->database->pdo()->prepare(
                'SELECT data_json FROM recurring_blocks WHERE facility_id = :facility_id ORDER BY id'
            );
            $statement->execute([':facility_id' => $facilityId]);
        }
        return array_map(
            fn (array $row): RecurringBlock => $this->deserialize($row['data_json']),
            $statement->fetchAll()
        );
    }

    public function delete(string $id): void
    {
        $statement = $this->database->pdo()->prepare('DELETE FROM recurring_blocks WHERE id = :id');
        $statement->execute([':id' => $id]);
    }

    public function importArray(array $data): RecurringBlock
    {
        return $this->deserialize(json_encode($data, JSON_THROW_ON_ERROR));
    }

    private function serialize(RecurringBlock $block): array
    {
        return [
            'id' => $block->id,
            'facility_id' => $block->facilityId,
            'resource_id' => $block->resourceId,
            'weekday' => $block->weekday,
            'start_time' => $block->startTime,
            'end_time' => $block->endTime,
            'title' => $block->title,
            'description' => $block->description,
            'effective_from' => $block->effectiveFrom?->format(DATE_ATOM),
            'effective_until' => $block->effectiveUntil?->format(DATE_ATOM),
        ];
    }

    private function deserialize(string $json): RecurringBlock
    {
        $data = json_decode($json, true);
        if (!is_array($data) || !isset($data['id'], $data['facility_id'], $data['weekday'],
            $data['start_time'], $data['end_time'], $data['title'])) {
            throw new RuntimeException('Recurring block record is invalid.');
        }
        return new RecurringBlock(
            id: (string) $data['id'],
            facilityId: (string) $data['facility_id'],
            resourceId: isset($data['resource_id']) ? (string) $data['resource_id'] : null,
            weekday: (int) $data['weekday'],
            startTime: (string) $data['start_time'],
            endTime: (string) $data['end_time'],
            title: (string) $data['title'],
            description: isset($data['description']) ? (string) $data['description'] : null,
            effectiveFrom: isset($data['effective_from'])
                ? new DateTimeImmutable($data['effective_from'], new DateTimeZone('UTC'))
                : null,
            effectiveUntil: isset($data['effective_until'])
                ? new DateTimeImmutable($data['effective_until'], new DateTimeZone('UTC'))
                : null
        );
    }
}
