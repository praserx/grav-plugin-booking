<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
    case VerificationPending = 'verification_pending';

    public function isActive(): bool
    {
        return $this === self::Pending || $this === self::Confirmed;
    }

    public function blocksAvailability(bool $pendingBlocks = true): bool
    {
        return match ($this) {
            self::Confirmed => true,
            self::Pending => $pendingBlocks,
            self::VerificationPending, self::Rejected, self::Cancelled => false,
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::VerificationPending => in_array($target, [self::Pending, self::Confirmed, self::Cancelled], true),
            self::Pending => in_array($target, [self::Confirmed, self::Rejected, self::Cancelled], true),
            self::Confirmed => $target === self::Cancelled,
            self::Rejected, self::Cancelled => false,
        };
    }
}
