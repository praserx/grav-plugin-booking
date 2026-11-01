<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use Grav\Plugin\Booking\Storage\AtomicJsonWriter;
use PHPUnit\Framework\TestCase;

final class AtomicJsonWriterTest extends TestCase
{
    private string $tmpDir;
    private AtomicJsonWriter $writer;

    protected function setUp(): void
    {
        $this->tmpDir = sys_get_temp_dir() . '/booking-test-' . uniqid();
        mkdir($this->tmpDir, 0755, true);
        $this->writer = new AtomicJsonWriter();
    }

    protected function tearDown(): void
    {
        $this->removeDir($this->tmpDir);
    }

    public function testWritesAndReadsJson(): void
    {
        $path = $this->tmpDir . '/test.json';
        $data = ['key' => 'value', 'number' => 42];

        $this->writer->write($path, $data);
        $read = $this->writer->read($path);

        $this->assertSame($data, $read);
    }

    public function testCreatesDirectories(): void
    {
        $path = $this->tmpDir . '/a/b/c/test.json';
        $this->writer->write($path, ['test' => true]);

        $this->assertFileExists($path);
    }

    public function testReadReturnsNullForMissingFile(): void
    {
        $this->assertNull($this->writer->read($this->tmpDir . '/nonexistent.json'));
    }

    public function testDeleteRemovesFile(): void
    {
        $path = $this->tmpDir . '/test.json';
        $this->writer->write($path, ['test' => true]);
        $this->assertFileExists($path);

        $this->writer->delete($path);
        $this->assertFileDoesNotExist($path);
    }

    public function testAtomicWriteDoesNotLeavePartialFile(): void
    {
        $path = $this->tmpDir . '/test.json';
        $this->writer->write($path, ['version' => 1]);
        $this->writer->write($path, ['version' => 2]);

        $read = $this->writer->read($path);
        $this->assertSame(['version' => 2], $read);

        // No .tmp files should remain
        $files = glob($this->tmpDir . '/*.tmp.*');
        $this->assertEmpty($files);
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
