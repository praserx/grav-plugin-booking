<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use Grav\Plugin\Booking\Storage\BookingStoreLock;
use PHPUnit\Framework\TestCase;

final class BookingStoreLockTest extends TestCase
{
    private string $tmpDir;

    protected function setUp(): void
    {
        $this->tmpDir = sys_get_temp_dir() . '/booking-lock-test-' . uniqid();
        mkdir($this->tmpDir, 0755, true);
    }

    protected function tearDown(): void
    {
        $this->removeDir($this->tmpDir);
    }

    public function testAcquireAndRelease(): void
    {
        $lock = new BookingStoreLock($this->tmpDir . '/.booking.lock');
        $lock->acquire();
        $this->assertFileExists($this->tmpDir . '/.booking.lock');
        $lock->release();
    }

    public function testCreatesLockDirectory(): void
    {
        $lockPath = $this->tmpDir . '/subdir/.booking.lock';
        $lock = new BookingStoreLock($lockPath);
        $lock->acquire();
        $this->assertFileExists($lockPath);
        $lock->release();
    }

    public function testDoubleReleaseIsIdempotent(): void
    {
        $lock = new BookingStoreLock($this->tmpDir . '/.booking.lock');
        $lock->acquire();
        $lock->release();
        $lock->release(); // Should not throw
        $this->assertTrue(true);
    }

    private function removeDir(string $dir): void
    {
        if (!is_dir($dir)) return;
        $items = scandir($dir);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            $path = $dir . '/' . $item;
            if (is_dir($path)) {
                $this->removeDir($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }
}
