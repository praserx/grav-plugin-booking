<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Domain\BookingStatus;
use Grav\Plugin\Booking\Storage\SqliteDatabase;
use RuntimeException;

/** Issues, verifies, rate-limits, and expires public booking email codes. */
final class BookingVerificationService
{
    private const CODE_TTL = 86400;
    private const MAX_ATTEMPTS = 6;
    private const MAX_RESENDS = 5;
    private const RESEND_DELAY = 60;

    public function __construct(
        private readonly SqliteDatabase $database,
        private readonly BookingService $bookings,
        private readonly BookingNotificationService $notifications
    ) {
    }

    /** @return array{sent:bool,expires_at:string} */
    public function issue(Booking $booking, BookingStatus $targetStatus): array
    {
        if (!in_array($targetStatus, [BookingStatus::Pending, BookingStatus::Confirmed], true)) {
            throw new RuntimeException('Invalid verification target status.');
        }
        $code = $this->newCode();
        $now = time();
        $createdAt = gmdate('Y-m-d\TH:i:s\Z', $now);
        $expiresAt = gmdate('Y-m-d\TH:i:s\Z', $now + self::CODE_TTL);
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            INSERT INTO booking_verifications
                (booking_id, code_hash, target_status, created_at, expires_at, last_sent_at, attempts, resend_count)
            VALUES (:booking_id, :code_hash, :target_status, :created_at, :expires_at, :last_sent_at, 0, 0)
            ON CONFLICT(booking_id) DO UPDATE SET
                code_hash = excluded.code_hash,
                target_status = excluded.target_status,
                created_at = excluded.created_at,
                expires_at = excluded.expires_at,
                last_sent_at = excluded.last_sent_at,
                attempts = 0,
                resend_count = 0
            SQL);
        $statement->execute([
            ':booking_id' => $booking->id,
            ':code_hash' => password_hash($code, PASSWORD_DEFAULT),
            ':target_status' => $targetStatus->value,
            ':created_at' => $createdAt,
            ':expires_at' => $expiresAt,
            ':last_sent_at' => $createdAt,
        ]);
        return ['sent' => $this->notifications->sendVerificationCode($booking, $code), 'expires_at' => $expiresAt];
    }

    public function resend(string $bookingId): bool
    {
        $row = $this->verification($bookingId);
        $booking = $this->bookings->findBookingById($bookingId);
        if (!$row || !$booking || $booking->status !== BookingStatus::VerificationPending) {
            throw new RuntimeException('Email verification is no longer available.');
        }
        if (strtotime((string) $row['expires_at']) <= time()) {
            $this->expireOne($bookingId);
            throw new RuntimeException('The verification period has expired. Start a new reservation.');
        }
        if ((int) $row['resend_count'] >= self::MAX_RESENDS) {
            throw new RuntimeException('The verification email resend limit has been reached.');
        }
        if ((int) $row['resend_count'] > 0
            && time() - (int) strtotime((string) $row['last_sent_at']) < self::RESEND_DELAY) {
            throw new RuntimeException('Wait a minute before requesting another verification email.');
        }

        $code = $this->newCode();
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $sent = $this->notifications->sendVerificationCode($booking, $code);
        if ($sent) {
            // PDO SQLite with native prepares does not reliably bind a named
            // placeholder reused multiple times in a statement. Keep each
            // parameter unique so the emailed code always replaces its hash.
            $update = $this->database->pdo()->prepare(<<<'SQL'
                UPDATE booking_verifications SET
                    code_hash = :code_hash,
                    last_sent_at = :last_sent_at,
                    expires_at = :expires_at,
                    attempts = 0,
                    resend_count = resend_count + 1
                WHERE booking_id = :booking_id
                SQL);
            $update->execute([
                ':code_hash' => password_hash($code, PASSWORD_DEFAULT),
                ':last_sent_at' => $now,
                ':expires_at' => gmdate('Y-m-d\TH:i:s\Z', time() + self::CODE_TTL),
                ':booking_id' => $bookingId,
            ]);
        } else {
            $update = $this->database->pdo()->prepare(<<<'SQL'
                UPDATE booking_verifications SET
                    last_sent_at = :last_sent_at,
                    resend_count = resend_count + 1
                WHERE booking_id = :booking_id
                SQL);
            $update->execute([
                ':last_sent_at' => $now,
                ':booking_id' => $bookingId,
            ]);
        }
        return $sent;
    }

    public function verify(string $bookingId, string $code): Booking
    {
        $row = $this->verification($bookingId);
        $booking = $this->bookings->findBookingById($bookingId);
        if (!$row || !$booking || $booking->status !== BookingStatus::VerificationPending) {
            throw new RuntimeException('The verification code is invalid or expired.');
        }
        if (strtotime((string) $row['expires_at']) <= time()) {
            $this->expireOne($bookingId);
            throw new RuntimeException('The verification code is invalid or expired. Start a new reservation.');
        }
        if ((int) $row['attempts'] >= self::MAX_ATTEMPTS) {
            throw new RuntimeException('Too many verification attempts. Request another code.');
        }
        if (!password_verify($code, (string) $row['code_hash'])) {
            $attempt = $this->database->pdo()->prepare(
                'UPDATE booking_verifications SET attempts = attempts + 1 WHERE booking_id = :booking_id'
            );
            $attempt->execute([':booking_id' => $bookingId]);
            throw new RuntimeException('The verification code is invalid or expired.');
        }

        $target = BookingStatus::tryFrom((string) $row['target_status']);
        if (!in_array($target, [BookingStatus::Pending, BookingStatus::Confirmed], true)) {
            throw new RuntimeException('The verification code is invalid or expired.');
        }
        try {
            $verified = $this->bookings->activateVerifiedBooking($bookingId, $target);
        } catch (RuntimeException $exception) {
            if (str_contains($exception->getMessage(), 'no longer available')) {
                $this->database->pdo()->prepare('DELETE FROM booking_verifications WHERE booking_id = :id')
                    ->execute([':id' => $bookingId]);
            }
            throw $exception;
        }
        $this->database->pdo()->prepare('DELETE FROM booking_verifications WHERE booking_id = :id')
            ->execute([':id' => $bookingId]);
        $this->notifications->dispatch($verified, $verified->status === BookingStatus::Confirmed ? 'confirmed' : 'created');
        return $verified;
    }

    /** Cancel expired provisional records. Safe to run from requests and Grav Scheduler. */
    public function expire(): int
    {
        $query = $this->database->pdo()->prepare(
            'SELECT booking_id FROM booking_verifications WHERE expires_at <= :now ORDER BY expires_at LIMIT 500'
        );
        $query->execute([':now' => gmdate('Y-m-d\TH:i:s\Z')]);
        $ids = $query->fetchAll(\PDO::FETCH_COLUMN);
        foreach ($ids as $id) {
            $this->expireOne((string) $id);
        }
        return count($ids);
    }

    private function expireOne(string $bookingId): void
    {
        $booking = $this->bookings->findBookingById($bookingId);
        if ($booking && $booking->status === BookingStatus::VerificationPending) {
            try {
                $this->bookings->updateStatus($bookingId, BookingStatus::Cancelled, null, null, null, 'system');
            } catch (\Throwable) {
                // Cleanup must continue even if a concurrent admin action changed the row.
            }
        }
        $this->database->pdo()->prepare('DELETE FROM booking_verifications WHERE booking_id = :id')
            ->execute([':id' => $bookingId]);
    }

    private function verification(string $bookingId): ?array
    {
        $query = $this->database->pdo()->prepare('SELECT * FROM booking_verifications WHERE booking_id = :id');
        $query->execute([':id' => $bookingId]);
        $row = $query->fetch();
        return is_array($row) ? $row : null;
    }

    private function newCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
