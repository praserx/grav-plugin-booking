<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use RuntimeException;

/**
 * Exclusive file lock for booking store operations.
 */
final class BookingStoreLock
{
    /** @var resource|null */
    private $handle = null;

    public function __construct(
        private readonly string $lockFilePath
    ) {
    }

    public function acquire(): void
    {
        $dir = dirname($this->lockFilePath);
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            throw new RuntimeException("Failed to create lock directory: $dir");
        }

        $this->handle = fopen($this->lockFilePath, 'c');
        if ($this->handle === false) {
            throw new RuntimeException("Failed to open lock file: {$this->lockFilePath}");
        }

        if (!flock($this->handle, LOCK_EX)) {
            fclose($this->handle);
            $this->handle = null;
            throw new RuntimeException("Failed to acquire lock on {$this->lockFilePath}");
        }
    }

    public function release(): void
    {
        if ($this->handle !== null) {
            flock($this->handle, LOCK_UN);
            fclose($this->handle);
            $this->handle = null;
        }
    }

    public function __destruct()
    {
        $this->release();
    }
}
