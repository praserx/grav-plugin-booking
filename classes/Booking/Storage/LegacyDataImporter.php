<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use Grav\Plugin\Booking\Configuration\FacilityCatalog;
use RuntimeException;
use Throwable;

/**
 * Previewable, idempotent importer for the previous YAML/JSON data layout.
 */
final class LegacyDataImporter
{
    public function __construct(
        private readonly SqliteDatabase $database,
        private readonly SqliteFacilityRepository $facilities,
        private readonly SqliteBookingRepository $bookings,
        private readonly SqliteAvailabilityBlockRepository $blocks,
        private readonly SqliteRecurringBlockRepository $recurringBlocks,
        private readonly array $legacyFacilities,
        private readonly string $dataPath
    ) {
    }

    public function preview(): array
    {
        $errors = [];
        $facilityRows = [];
        foreach (array_values($this->legacyFacilities) as $index => $facility) {
            try {
                if (!is_array($facility)) {
                    throw new RuntimeException('Facility entry is not an object.');
                }
                new FacilityCatalog([$facility]);
                $facilityRows[] = $facility;
            } catch (Throwable $e) {
                $errors[] = $this->error('facility #' . ($index + 1), $e);
            }
        }

        $bookingRows = $this->validateRows(
            $this->readJsonFiles($this->dataPath . '/bookings', 'booking', $errors),
            'booking',
            fn (array $data) => $this->bookings->importArray($data),
            $errors
        );
        $blockRows = $this->validateRows(
            $this->readJsonFiles($this->dataPath . '/blocks', 'block', $errors),
            'availability block',
            fn (array $data) => $this->blocks->importArray($data),
            $errors
        );
        $recurringRows = $this->validateRows(
            $this->readJsonFiles($this->dataPath . '/recurring-blocks', 'recurring block', $errors),
            'recurring block',
            fn (array $data) => $this->recurringBlocks->importArray($data),
            $errors
        );
        $knownFacilities = [];
        foreach ($this->facilities->all() as $facility) {
            if (isset($facility['id']) && is_string($facility['id'])) {
                $knownFacilities[$facility['id']] = true;
            }
        }
        foreach ($facilityRows as $facility) {
            $knownFacilities[(string) $facility['id']] = true;
        }
        $this->validateFacilityReferences($bookingRows, 'booking', $knownFacilities, $errors);
        $this->validateFacilityReferences($blockRows, 'availability block', $knownFacilities, $errors);
        $this->validateFacilityReferences($recurringRows, 'recurring block', $knownFacilities, $errors);
        $alreadyImported = $this->database->getSetting('legacy_import_completed') !== null;

        return [
            'already_imported' => $alreadyImported,
            'source_counts' => [
                'facilities' => count($facilityRows),
                'bookings' => count($bookingRows),
                'blocks' => count($blockRows),
                'recurring_blocks' => count($recurringRows),
            ],
            'database_counts' => [
                'facilities' => count($this->facilities->all()),
                'bookings' => $this->countTable('bookings'),
                'blocks' => $this->countTable('availability_blocks'),
                'recurring_blocks' => $this->countTable('recurring_blocks'),
            ],
            'errors' => $errors,
            'can_import' => !$alreadyImported && $errors === [],
        ];
    }

    public function import(): array
    {
        $preview = $this->preview();
        if ($preview['already_imported']) {
            throw new RuntimeException('Legacy booking data has already been imported.');
        }
        if ($preview['errors'] !== []) {
            throw new RuntimeException('Correct the legacy data errors before importing.');
        }

        $facilityRows = array_values($this->legacyFacilities);
        $ignored = [];
        $bookingRows = $this->readJsonFiles($this->dataPath . '/bookings', 'booking', $ignored);
        $blockRows = $this->readJsonFiles($this->dataPath . '/blocks', 'block', $ignored);
        $recurringRows = $this->readJsonFiles($this->dataPath . '/recurring-blocks', 'recurring block', $ignored);
        $imported = ['facilities' => 0, 'bookings' => 0, 'blocks' => 0, 'recurring_blocks' => 0];
        $skipped = ['facilities' => 0, 'bookings' => 0, 'blocks' => 0, 'recurring_blocks' => 0];

        $this->database->beginImmediate();
        try {
            foreach ($facilityRows as $facility) {
                if ($this->facilities->get((string) $facility['id']) === null) {
                    $this->facilities->save($facility);
                    $imported['facilities']++;
                } else {
                    $skipped['facilities']++;
                }
            }
            foreach ($bookingRows as $row) {
                $booking = $this->bookings->importArray($row['data']);
                if ($this->bookings->findByIdGlobal($booking->id) === null) {
                    if ($this->facilities->get($booking->facilityId) === null) {
                        throw new RuntimeException('A booking references a facility that was not imported.');
                    }
                    $this->bookings->save($booking);
                    $imported['bookings']++;
                } else {
                    $skipped['bookings']++;
                }
            }
            foreach ($blockRows as $row) {
                $block = $this->blocks->importArray($row['data']);
                if ($this->recordExists('availability_blocks', $block->id) === false) {
                    if ($this->facilities->get($block->facilityId) === null) {
                        throw new RuntimeException('An availability block references a facility that was not imported.');
                    }
                    $this->blocks->save($block);
                    $imported['blocks']++;
                } else {
                    $skipped['blocks']++;
                }
            }
            foreach ($recurringRows as $row) {
                $block = $this->recurringBlocks->importArray($row['data']);
                if ($this->recordExists('recurring_blocks', $block->id) === false) {
                    if ($this->facilities->get($block->facilityId) === null) {
                        throw new RuntimeException('A recurring block references a facility that was not imported.');
                    }
                    $this->recurringBlocks->save($block);
                    $imported['recurring_blocks']++;
                } else {
                    $skipped['recurring_blocks']++;
                }
            }
            $this->database->setSetting('legacy_import_completed', json_encode([
                'completed_at' => gmdate(DATE_ATOM),
                'source_counts' => $preview['source_counts'],
            ], JSON_THROW_ON_ERROR));
            $this->database->commit();
        } catch (Throwable $e) {
            $this->database->rollback();
            throw $e;
        }

        return [
            'source_counts' => $preview['source_counts'],
            'imported' => $imported,
            'skipped' => $skipped,
            'source_files_preserved' => true,
        ];
    }

    /**
     * @return array<int, array{path:string,data:array}>
     */
    private function readJsonFiles(string $root, string $kind, array &$errors): array
    {
        if (!is_dir($root)) {
            return [];
        }
        $items = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if (!$file->isFile() || strtolower($file->getExtension()) !== 'json') {
                continue;
            }
            if ($file->getSize() > 1048576) {
                $errors[] = ['source' => $file->getBasename(), 'message' => 'Record exceeds the 1 MB import limit.'];
                continue;
            }
            try {
                $data = json_decode((string) file_get_contents($file->getPathname()), true, 64, JSON_THROW_ON_ERROR);
                if (!is_array($data)) {
                    throw new RuntimeException('Record must be a JSON object.');
                }
                $items[] = ['path' => $file->getPathname(), 'data' => $data];
            } catch (Throwable $e) {
                $errors[] = $this->error($file->getBasename(), $e);
            }
        }
        return $items;
    }

    private function error(string $source, Throwable $error): array
    {
        return [
            'source' => $source,
            'message' => $error instanceof \JsonException ? 'Record contains invalid JSON.' : $error->getMessage(),
        ];
    }

    private function validateRows(array $rows, string $kind, callable $hydrate, array &$errors): array
    {
        $valid = [];
        foreach ($rows as $row) {
            try {
                $hydrate($row['data']);
                $valid[] = $row;
            } catch (Throwable $e) {
                $errors[] = $this->error(basename($row['path']), $e);
            }
        }
        return $valid;
    }

    private function countTable(string $table): int
    {
        if (!in_array($table, ['bookings', 'availability_blocks', 'recurring_blocks'], true)) {
            throw new RuntimeException('Invalid internal table name.');
        }
        return (int) $this->database->pdo()->query('SELECT COUNT(*) FROM ' . $table)->fetchColumn();
    }

    private function validateFacilityReferences(array $rows, string $kind, array $knownFacilities, array &$errors): void
    {
        foreach ($rows as $row) {
            $facilityId = $row['data']['facility_id'] ?? null;
            if (!is_string($facilityId) || !isset($knownFacilities[$facilityId])) {
                $errors[] = [
                    'source' => basename($row['path']),
                    'message' => ucfirst($kind) . ' references a facility that is not present in the import or database.',
                ];
            }
        }
    }

    private function recordExists(string $table, string $id): bool
    {
        if (!in_array($table, ['availability_blocks', 'recurring_blocks'], true)) {
            throw new RuntimeException('Invalid internal table name.');
        }
        $statement = $this->database->pdo()->prepare('SELECT 1 FROM ' . $table . ' WHERE id = :id');
        $statement->execute([':id' => $id]);
        return $statement->fetchColumn() !== false;
    }
}
