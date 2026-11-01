<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use Grav\Plugin\Booking\Domain\AvailabilityBlock;
use Grav\Plugin\Booking\Domain\Interval;
use DateTimeImmutable;
use RuntimeException;

/**
 * JSON file repository for availability blocks.
 */
final class JsonAvailabilityBlockRepository
{
    public function __construct(
        private readonly string $basePath,
        private readonly AtomicJsonWriter $writer
    ) {
    }

    public function save(AvailabilityBlock $block): void
    {
        $path = $this->getPath($block);
        $data = $this->serialize($block);
        $this->writer->write($path, $data);
    }

    public function findById(string $id, string $facilityId, DateTimeImmutable $startUtc): ?AvailabilityBlock
    {
        $path = $this->getPathForId($id, $facilityId, $startUtc);
        $data = $this->writer->read($path);
        if ($data === null) {
            return null;
        }
        return $this->deserialize($data);
    }

    /**
     * Find all blocks for a facility in a date range.
     * @return array<AvailabilityBlock>
     */
    public function findByFacility(string $facilityId, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $blocks = [];
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
                    $block = $this->deserialize($data);
                    if ($block->interval->start < $to && $block->interval->end > $from) {
                        $blocks[] = $block;
                    }
                } catch (\Throwable $e) {
                    continue;
                }
            }
        }

        return $blocks;
    }

    public function delete(AvailabilityBlock $block): void
    {
        $path = $this->getPath($block);
        $this->writer->delete($path);
    }

    private function getPath(AvailabilityBlock $block): string
    {
        return $this->getPathForId($block->id, $block->facilityId, $block->interval->start);
    }

    private function getPathForId(string $id, string $facilityId, DateTimeImmutable $startUtc): string
    {
        $year = $startUtc->format('Y');
        $month = $startUtc->format('m');
        return $this->basePath . "/blocks/{$facilityId}/{$year}/{$month}/{$id}.json";
    }

    private function getFacilityMonthDir(string $facilityId, DateTimeImmutable $month): string
    {
        $year = $month->format('Y');
        $monthStr = $month->format('m');
        return $this->basePath . "/blocks/{$facilityId}/{$year}/{$monthStr}";
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

    private function serialize(AvailabilityBlock $block): array
    {
        return [
            'id' => $block->id,
            'facility_id' => $block->facilityId,
            'resource_id' => $block->resourceId,
            'start_utc' => $block->interval->start->format(DATE_ATOM),
            'end_utc' => $block->interval->end->format(DATE_ATOM),
            'title' => $block->title,
            'description' => $block->description,
        ];
    }

    private function deserialize(array $data): AvailabilityBlock
    {
        $required = ['id', 'facility_id', 'start_utc', 'end_utc', 'title'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new RuntimeException("Missing required field: $field");
            }
        }

        $start = new DateTimeImmutable($data['start_utc']);
        $end = new DateTimeImmutable($data['end_utc']);
        $interval = new Interval($start, $end);

        return new AvailabilityBlock(
            id: $data['id'],
            facilityId: $data['facility_id'],
            resourceId: $data['resource_id'] ?? null,
            interval: $interval,
            title: $data['title'],
            description: $data['description'] ?? null
        );
    }
}
