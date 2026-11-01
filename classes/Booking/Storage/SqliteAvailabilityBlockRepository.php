<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use DateTimeImmutable;
use DateTimeZone;
use Grav\Plugin\Booking\Domain\AvailabilityBlock;
use Grav\Plugin\Booking\Domain\Interval;
use RuntimeException;

final class SqliteAvailabilityBlockRepository
{
    public function __construct(private readonly SqliteDatabase $database)
    {
    }

    public function save(AvailabilityBlock $block): void
    {
        $data = $this->serialize($block);
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            INSERT INTO availability_blocks (id, facility_id, resource_id, start_utc, end_utc, data_json)
            VALUES (:id, :facility_id, :resource_id, :start_utc, :end_utc, :data_json)
            ON CONFLICT(id) DO UPDATE SET
                facility_id = excluded.facility_id,
                resource_id = excluded.resource_id,
                start_utc = excluded.start_utc,
                end_utc = excluded.end_utc,
                data_json = excluded.data_json
            SQL);
        $statement->execute([
            ':id' => $block->id,
            ':facility_id' => $block->facilityId,
            ':resource_id' => $block->resourceId,
            ':start_utc' => $this->timestamp($block->interval->start),
            ':end_utc' => $this->timestamp($block->interval->end),
            ':data_json' => json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES),
        ]);
    }

    public function findById(string $id, string $facilityId, DateTimeImmutable $startUtc): ?AvailabilityBlock
    {
        $statement = $this->database->pdo()->prepare(
            'SELECT data_json FROM availability_blocks WHERE id = :id AND facility_id = :facility_id'
        );
        $statement->execute([':id' => $id, ':facility_id' => $facilityId]);
        $json = $statement->fetchColumn();
        return is_string($json) ? $this->deserialize($json) : null;
    }

    public function findByIdGlobal(string $id): ?AvailabilityBlock
    {
        $statement = $this->database->pdo()->prepare('SELECT data_json FROM availability_blocks WHERE id = :id');
        $statement->execute([':id' => $id]);
        $json = $statement->fetchColumn();
        return is_string($json) ? $this->deserialize($json) : null;
    }

    /** @return array<AvailabilityBlock> */
    public function findByFacility(string $facilityId, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            SELECT data_json FROM availability_blocks
            WHERE facility_id = :facility_id AND start_utc < :to_utc AND end_utc > :from_utc
            ORDER BY start_utc
            SQL);
        $statement->execute([
            ':facility_id' => $facilityId,
            ':from_utc' => $this->timestamp($from),
            ':to_utc' => $this->timestamp($to),
        ]);
        return array_map(
            fn (array $row): AvailabilityBlock => $this->deserialize($row['data_json']),
            $statement->fetchAll()
        );
    }

    /** @return array<AvailabilityBlock> */
    public function listForAdmin(?string $facilityId = null): array
    {
        if ($facilityId === null) {
            $statement = $this->database->pdo()->query('SELECT data_json FROM availability_blocks ORDER BY start_utc');
        } else {
            $statement = $this->database->pdo()->prepare(
                'SELECT data_json FROM availability_blocks WHERE facility_id = :facility_id ORDER BY start_utc'
            );
            $statement->execute([':facility_id' => $facilityId]);
        }
        return array_map(
            fn (array $row): AvailabilityBlock => $this->deserialize($row['data_json']),
            $statement->fetchAll()
        );
    }

    public function delete(AvailabilityBlock $block): void
    {
        $statement = $this->database->pdo()->prepare(
            'DELETE FROM availability_blocks WHERE id = :id AND facility_id = :facility_id'
        );
        $statement->execute([':id' => $block->id, ':facility_id' => $block->facilityId]);
    }

    public function importArray(array $data): AvailabilityBlock
    {
        return $this->deserialize(json_encode($data, JSON_THROW_ON_ERROR));
    }

    private function serialize(AvailabilityBlock $block): array
    {
        return [
            'id' => $block->id,
            'facility_id' => $block->facilityId,
            'resource_id' => $block->resourceId,
            'start_utc' => $this->timestamp($block->interval->start),
            'end_utc' => $this->timestamp($block->interval->end),
            'title' => $block->title,
            'description' => $block->description,
        ];
    }

    private function deserialize(string $json): AvailabilityBlock
    {
        $data = json_decode($json, true);
        if (!is_array($data) || !isset($data['id'], $data['facility_id'], $data['start_utc'], $data['end_utc'], $data['title'])) {
            throw new RuntimeException('Availability block record is invalid.');
        }
        return new AvailabilityBlock(
            id: (string) $data['id'],
            facilityId: (string) $data['facility_id'],
            resourceId: isset($data['resource_id']) ? (string) $data['resource_id'] : null,
            interval: new Interval(new DateTimeImmutable($data['start_utc']), new DateTimeImmutable($data['end_utc'])),
            title: (string) $data['title'],
            description: isset($data['description']) ? (string) $data['description'] : null
        );
    }

    private function timestamp(DateTimeImmutable $date): string
    {
        return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\\TH:i:s\\Z');
    }
}
