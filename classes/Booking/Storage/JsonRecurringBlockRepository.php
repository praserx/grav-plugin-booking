<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use Grav\Plugin\Booking\Domain\RecurringBlock;
use DateTimeImmutable;
use RuntimeException;

/**
 * JSON file repository for recurring blocks.
 */
final class JsonRecurringBlockRepository
{
    public function __construct(
        private readonly string $basePath,
        private readonly AtomicJsonWriter $writer
    ) {
    }

    public function save(RecurringBlock $block): void
    {
        $path = $this->getPath($block->id);
        $data = $this->serialize($block);
        $this->writer->write($path, $data);
    }

    public function findById(string $id): ?RecurringBlock
    {
        $path = $this->getPath($id);
        $data = $this->writer->read($path);
        if ($data === null) {
            return null;
        }
        return $this->deserialize($data);
    }

    /**
     * Find all recurring blocks for a facility.
     * @return array<RecurringBlock>
     */
    public function findByFacility(string $facilityId): array
    {
        $blocks = [];
        $dir = $this->basePath . '/recurring-blocks';

        if (!is_dir($dir)) {
            return $blocks;
        }

        $files = glob($dir . '/*.json');
        if ($files === false) {
            return $blocks;
        }

        foreach ($files as $file) {
            $data = $this->writer->read($file);
            if ($data === null) {
                continue;
            }

            try {
                $block = $this->deserialize($data);
                if ($block->facilityId === $facilityId) {
                    $blocks[] = $block;
                }
            } catch (\Throwable $e) {
                continue;
            }
        }

        return $blocks;
    }

    public function delete(string $id): void
    {
        $path = $this->getPath($id);
        $this->writer->delete($path);
    }

    private function getPath(string $id): string
    {
        return $this->basePath . "/recurring-blocks/{$id}.json";
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

    private function deserialize(array $data): RecurringBlock
    {
        $required = ['id', 'facility_id', 'weekday', 'start_time', 'end_time', 'title'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new RuntimeException("Missing required field: $field");
            }
        }

        return new RecurringBlock(
            id: $data['id'],
            facilityId: $data['facility_id'],
            resourceId: $data['resource_id'] ?? null,
            weekday: (int) $data['weekday'],
            startTime: $data['start_time'],
            endTime: $data['end_time'],
            title: $data['title'],
            description: $data['description'] ?? null,
            effectiveFrom: isset($data['effective_from']) ? new DateTimeImmutable($data['effective_from']) : null,
            effectiveUntil: isset($data['effective_until']) ? new DateTimeImmutable($data['effective_until']) : null
        );
    }
}
