<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use DateTimeImmutable;
use Grav\Plugin\Booking\Configuration\FacilityCatalog;
use Grav\Plugin\Booking\Domain\AvailabilityBlock;
use Grav\Plugin\Booking\Domain\Interval;
use Grav\Plugin\Booking\Domain\RecurringBlock;
use Grav\Plugin\Booking\Storage\SqliteAvailabilityBlockRepository;
use Grav\Plugin\Booking\Storage\SqliteBookingRepository;
use Grav\Plugin\Booking\Storage\SqliteRecurringBlockRepository;
use Grav\Plugin\Booking\Storage\SqliteTransaction;
use RuntimeException;

/**
 * Creates and manages availability blocks.
 */
final class AvailabilityBlockService
{
    public function __construct(
        private readonly FacilityCatalog $catalog,
        private readonly SqliteBookingRepository $bookingRepo,
        private readonly SqliteAvailabilityBlockRepository $blockRepo,
        private readonly SqliteRecurringBlockRepository $recurringBlockRepo,
        private readonly SqliteTransaction $transaction,
        private readonly ConflictDetector $conflictDetector
    ) {
    }

    /**
     * Create a fixed availability block.
     */
    public function createFixedBlock(
        string $facilityId,
        ?string $resourceId,
        Interval $interval,
        string $title,
        ?string $description = null
    ): AvailabilityBlock {
        $facility = $this->catalog->get($facilityId);
        if ($facility === null) {
            throw new RuntimeException('Facility not found.');
        }

        // Validate resource if specified
        if ($resourceId !== null && !$facility->hasResource($resourceId)) {
            throw new RuntimeException('Resource not found.');
        }

        $block = new AvailabilityBlock(
            id: $this->generateUuid(),
            facilityId: $facilityId,
            resourceId: $resourceId,
            interval: $interval,
            title: $title,
            description: $description
        );

        return $this->transaction->run(function () use ($facilityId, $resourceId, $interval, $facility, $block): AvailabilityBlock {
            // Check for conflicts with existing bookings
            $bookings = $this->bookingRepo->findByFacility(
                $facilityId,
                $interval->start->modify('-' . $facility->bookingRules->maximumDurationSeconds . ' seconds'),
                $interval->end
            );

            if ($this->conflictDetector->hasBookingConflict(
                $facility,
                $interval,
                $resourceId,
                $bookings,
                true // pending blocks
            )) {
                throw new RuntimeException('Block conflicts with existing booking.');
            }

            $this->blockRepo->save($block);
            return $block;
        });
    }

    /**
     * Create a recurring weekly block.
     */
    public function createRecurringBlock(
        string $facilityId,
        ?string $resourceId,
        int $weekday,
        string $startTime,
        string $endTime,
        string $title,
        ?string $description = null,
        ?DateTimeImmutable $effectiveFrom = null,
        ?DateTimeImmutable $effectiveUntil = null
    ): RecurringBlock {
        $facility = $this->catalog->get($facilityId);
        if ($facility === null) {
            throw new RuntimeException('Facility not found.');
        }

        if ($resourceId !== null && !$facility->hasResource($resourceId)) {
            throw new RuntimeException('Resource not found.');
        }

        $block = new RecurringBlock(
            id: $this->generateUuid(),
            facilityId: $facilityId,
            resourceId: $resourceId,
            weekday: $weekday,
            startTime: $startTime,
            endTime: $endTime,
            title: $title,
            description: $description,
            effectiveFrom: $effectiveFrom,
            effectiveUntil: $effectiveUntil
        );

        return $this->transaction->run(function () use (
            $facilityId,
            $resourceId,
            $weekday,
            $startTime,
            $endTime,
            $effectiveFrom,
            $effectiveUntil,
            $facility,
            $block
        ): RecurringBlock {
            // Check for conflicts with existing bookings in the effective range
            $from = $effectiveFrom ?? new DateTimeImmutable('-1 year');
            $to = $effectiveUntil ?? new DateTimeImmutable('+1 year');

            $bookings = $this->bookingRepo->findByFacility($facilityId, $from, $to);

            // Build a test interval for the recurring block's first occurrence
            $tz = new \DateTimeZone($facility->timezone);
            $testStart = new DateTimeImmutable("next " . $this->weekdayName($weekday), $tz);
            $testStart = $testStart->setTime(
                (int) substr($startTime, 0, 2),
                (int) substr($startTime, 3, 2)
            );
            $testEnd = $testStart->setTime(
                (int) substr($endTime, 0, 2),
                (int) substr($endTime, 3, 2)
            );

            if ($testEnd <= $testStart) {
                $testEnd = $testEnd->modify('+1 day');
            }

            $testInterval = new Interval($testStart, $testEnd);

            if ($this->conflictDetector->hasBookingConflict(
                $facility,
                $testInterval,
                $resourceId,
                $bookings,
                true
            )) {
                throw new RuntimeException('Recurring block conflicts with existing booking.');
            }

            $this->recurringBlockRepo->save($block);
            return $block;
        });
    }

    /**
     * Delete a recurring block.
     */
    public function deleteRecurringBlock(string $blockId): void
    {
        $this->transaction->run(function () use ($blockId): void {
            $this->recurringBlockRepo->delete($blockId);
        });
    }

    /**
     * Delete a fixed block.
     */
    public function deleteFixedBlock(string $blockId, string $facilityId, DateTimeImmutable $startUtc): void
    {
        $this->transaction->run(function () use ($blockId, $facilityId, $startUtc): void {
            $block = $this->blockRepo->findById($blockId, $facilityId, $startUtc);
            if ($block === null) {
                throw new RuntimeException('Block not found.');
            }
            $this->blockRepo->delete($block);
        });
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    private function weekdayName(int $weekday): string
    {
        return match ($weekday) {
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
            7 => 'Sunday',
            default => throw new RuntimeException("Invalid weekday: $weekday"),
        };
    }
}
