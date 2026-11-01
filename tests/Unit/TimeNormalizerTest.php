<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Tests\Unit;

use Grav\Plugin\Booking\Service\TimeNormalizer;
use Grav\Plugin\Booking\Domain\Interval;
use PHPUnit\Framework\TestCase;

final class TimeNormalizerTest extends TestCase
{
    private TimeNormalizer $normalizer;

    protected function setUp(): void
    {
        $this->normalizer = new TimeNormalizer();
    }

    public function testParsesUtcTimestamp(): void
    {
        $dt = $this->normalizer->parseToUtc('2026-01-05T10:00:00Z');
        $this->assertSame('2026-01-05 10:00:00', $dt->format('Y-m-d H:i:s'));
        $this->assertSame('UTC', $dt->getTimezone()->getName());
    }

    public function testParsesOffsetTimestamp(): void
    {
        $dt = $this->normalizer->parseToUtc('2026-01-05T12:00:00+02:00');
        $this->assertSame('2026-01-05 10:00:00', $dt->format('Y-m-d H:i:s'));
    }

    public function testRejectsTimestampWithoutOffset(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->normalizer->parseToUtc('2026-01-05T10:00:00');
    }

    public function testValidatesExistingLocalTime(): void
    {
        $this->assertTrue($this->normalizer->validateLocalTime('2026-01-05 10:00:00', 'Europe/London'));
    }

    public function testCreatesIntervalFromLocalTimes(): void
    {
        $interval = $this->normalizer->createIntervalFromLocal(
            '2026-01-05 10:00:00',
            '2026-01-05 12:00:00',
            'Europe/London'
        );

        $this->assertInstanceOf(Interval::class, $interval);
        $this->assertSame(7200, $interval->durationSeconds());
    }
}
