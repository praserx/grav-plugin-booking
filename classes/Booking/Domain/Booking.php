<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

use DateTimeImmutable;

/**
 * A customer booking.
 */
final class Booking
{
    public function __construct(
        public readonly string $id,
        public readonly string $facilityId,
        public readonly ?string $resourceId,
        public readonly Interval $interval,
        public readonly string $facilityTimezone,
        public readonly BookingStatus $status,
        public readonly string $customerName,
        public readonly string $customerEmail,
        public readonly ?string $customerTelephone,
        public readonly ?string $customerNote,
        public readonly DateTimeImmutable $createdAt,
        public readonly DateTimeImmutable $updatedAt,
        public readonly ?DateTimeImmutable $approvedAt = null,
        public readonly ?DateTimeImmutable $rejectedAt = null,
        public readonly ?string $rejectionReason = null,
        public readonly ?string $adminNote = null,
        public readonly ?string $requesterUsername = null
    ) {
        if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid customer email.');
        }
    }

    public function isForFacility(): bool
    {
        return $this->resourceId === null;
    }

    public function isFor(string $facilityId, ?string $resourceId): bool
    {
        return $this->facilityId === $facilityId && $this->resourceId === $resourceId;
    }

    public function withStatus(BookingStatus $newStatus, ?DateTimeImmutable $timestamp = null): self
    {
        if (!$this->status->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException(
                "Cannot transition from {$this->status->value} to {$newStatus->value}."
            );
        }

        $now = $timestamp ?? new DateTimeImmutable();
        $approvedAt = $newStatus === BookingStatus::Confirmed ? $now : $this->approvedAt;
        $rejectedAt = $newStatus === BookingStatus::Rejected ? $now : $this->rejectedAt;

        return new self(
            $this->id,
            $this->facilityId,
            $this->resourceId,
            $this->interval,
            $this->facilityTimezone,
            $newStatus,
            $this->customerName,
            $this->customerEmail,
            $this->customerTelephone,
            $this->customerNote,
            $this->createdAt,
            $now,
            $approvedAt,
            $rejectedAt,
            $this->rejectionReason,
            $this->adminNote,
            $this->requesterUsername
        );
    }
}
