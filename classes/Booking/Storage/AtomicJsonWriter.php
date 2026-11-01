<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use RuntimeException;

/**
 * Atomic JSON file writer with flush and rename.
 */
final class AtomicJsonWriter
{
    public function write(string $path, mixed $data): void
    {
        $dir = dirname($path);
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            throw new RuntimeException("Failed to create directory: $dir");
        }

        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        if ($json === false) {
            throw new RuntimeException('Failed to encode data as JSON.');
        }

        $tmp = $path . '.tmp.' . getmypid() . '.' . uniqid('', true);
        if (file_put_contents($tmp, $json) === false) {
            throw new RuntimeException("Failed to write temporary file: $tmp");
        }

        if (!rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException("Failed to rename $tmp to $path");
        }
    }

    public function read(string $path): mixed
    {
        if (!file_exists($path)) {
            return null;
        }

        $content = file_get_contents($path);
        if ($content === false) {
            throw new RuntimeException("Failed to read file: $path");
        }

        $data = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException("Invalid JSON in $path: " . json_last_error_msg());
        }

        return $data;
    }

    public function delete(string $path): void
    {
        if (file_exists($path) && !unlink($path)) {
            throw new RuntimeException("Failed to delete file: $path");
        }
    }
}
