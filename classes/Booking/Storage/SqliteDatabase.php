<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use PDO;
use PDOException;
use RuntimeException;

/**
 * Owns the plugin database connection and its forward-only schema migrations.
 */
final class SqliteDatabase
{
    private PDO $pdo;
    private bool $transactionActive = false;

    public function __construct(string $databasePath)
    {
        if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            throw new RuntimeException(
                'Booking requires the PDO_SQLITE PHP extension. Enable it in the Grav PHP runtime.'
            );
        }

        $directory = dirname($databasePath);
        if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
            throw new RuntimeException('Booking could not create its private data directory.');
        }
        if (!is_writable($directory)) {
            throw new RuntimeException('Booking data directory is not writable by the Grav process.');
        }

        try {
            $this->pdo = new PDO('sqlite:' . $databasePath, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            $this->pdo->exec('PRAGMA foreign_keys = ON');
            $this->pdo->exec('PRAGMA busy_timeout = 5000');
            try {
                $this->pdo->query('PRAGMA journal_mode = WAL')->fetchColumn();
            } catch (PDOException) {
                // SQLite's rollback journal remains a safe single-writer mode.
            }
            $this->migrate();
            @chmod($databasePath, 0640);
        } catch (PDOException $e) {
            throw new RuntimeException('Booking could not open or migrate its SQLite database.', 0, $e);
        }
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }

    public function beginImmediate(): void
    {
        if ($this->transactionActive) {
            throw new RuntimeException('A booking database transaction is already active.');
        }
        $this->pdo->exec('BEGIN IMMEDIATE');
        $this->transactionActive = true;
    }

    public function commit(): void
    {
        if (!$this->transactionActive) {
            return;
        }
        $this->pdo->exec('COMMIT');
        $this->transactionActive = false;
    }

    public function rollback(): void
    {
        if (!$this->transactionActive) {
            return;
        }
        $this->pdo->exec('ROLLBACK');
        $this->transactionActive = false;
    }

    public function inTransaction(): bool
    {
        return $this->transactionActive;
    }

    public function getSetting(string $key): ?string
    {
        $statement = $this->pdo->prepare('SELECT value_json FROM plugin_settings WHERE key = :key');
        $statement->execute([':key' => $key]);
        $value = $statement->fetchColumn();
        return is_string($value) ? $value : null;
    }

    public function setSetting(string $key, string $jsonValue): void
    {
        $statement = $this->pdo->prepare(<<<'SQL'
            INSERT INTO plugin_settings (key, value_json, updated_at)
            VALUES (:key, :value_json, :updated_at)
            ON CONFLICT(key) DO UPDATE SET
                value_json = excluded.value_json,
                updated_at = excluded.updated_at
            SQL);
        $statement->execute([
            ':key' => $key,
            ':value_json' => $jsonValue,
            ':updated_at' => gmdate('Y-m-d\\TH:i:s\\Z'),
        ]);
    }

    private function migrate(): void
    {
        $version = (int) $this->pdo->query('PRAGMA user_version')->fetchColumn();
        if ($version > 2) {
            throw new RuntimeException('Booking database schema is newer than this plugin supports.');
        }
        if ($version === 0) {
          $this->pdo->beginTransaction();
          try {
            $this->pdo->exec(<<<'SQL'
                CREATE TABLE facilities (
                    id TEXT PRIMARY KEY,
                    enabled INTEGER NOT NULL,
                    timezone TEXT NOT NULL,
                    booking_mode TEXT NOT NULL,
                    approval_mode TEXT NOT NULL,
                    data_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE resources (
                    facility_id TEXT NOT NULL,
                    id TEXT NOT NULL,
                    enabled INTEGER NOT NULL,
                    data_json TEXT NOT NULL,
                    PRIMARY KEY (facility_id, id),
                    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
                );
                CREATE TABLE availability_windows (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    facility_id TEXT NOT NULL,
                    position INTEGER NOT NULL,
                    start_weekday INTEGER NOT NULL,
                    start_time TEXT NOT NULL,
                    end_weekday INTEGER NOT NULL,
                    end_time TEXT NOT NULL,
                    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
                );
                CREATE TABLE booking_rules (
                    facility_id TEXT PRIMARY KEY,
                    data_json TEXT NOT NULL,
                    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
                );
                CREATE TABLE facility_notifications (
                    facility_id TEXT PRIMARY KEY,
                    data_json TEXT NOT NULL,
                    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
                );
                CREATE TABLE bookings (
                    id TEXT PRIMARY KEY,
                    facility_id TEXT NOT NULL,
                    resource_id TEXT NULL,
                    start_utc TEXT NOT NULL,
                    end_utc TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    data_json TEXT NOT NULL,
                    CHECK (end_utc > start_utc),
                    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE RESTRICT
                );
                CREATE INDEX bookings_facility_time
                    ON bookings(facility_id, start_utc, end_utc);
                CREATE INDEX bookings_resource_time
                    ON bookings(facility_id, resource_id, start_utc, end_utc);
                CREATE INDEX bookings_status_time
                    ON bookings(status, start_utc);
                CREATE TABLE availability_blocks (
                    id TEXT PRIMARY KEY,
                    facility_id TEXT NOT NULL,
                    resource_id TEXT NULL,
                    start_utc TEXT NOT NULL,
                    end_utc TEXT NOT NULL,
                    data_json TEXT NOT NULL,
                    CHECK (end_utc > start_utc),
                    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE RESTRICT
                );
                CREATE INDEX availability_blocks_facility_time
                    ON availability_blocks(facility_id, start_utc, end_utc);
                CREATE TABLE recurring_blocks (
                    id TEXT PRIMARY KEY,
                    facility_id TEXT NOT NULL,
                    data_json TEXT NOT NULL,
                    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE RESTRICT
                );
                CREATE INDEX recurring_blocks_facility
                    ON recurring_blocks(facility_id);
                CREATE TABLE booking_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    booking_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    happened_at TEXT NOT NULL,
                    metadata_json TEXT NOT NULL
                );
                CREATE INDEX booking_events_booking
                    ON booking_events(booking_id, id);
                CREATE TABLE notification_deliveries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    booking_id TEXT NOT NULL,
                    facility_id TEXT NOT NULL,
                    event TEXT NOT NULL,
                    recipient TEXT NOT NULL,
                    status TEXT NOT NULL,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    last_error TEXT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE INDEX notification_deliveries_booking
                    ON notification_deliveries(booking_id, id);
                CREATE TABLE plugin_settings (
                    key TEXT PRIMARY KEY,
                    value_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                PRAGMA user_version = 1;
                SQL);
            $this->pdo->commit();
          } catch (\Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw new RuntimeException('Booking database migration failed.', 0, $e);
          }
          $version = 1;
        }

        if ($version === 1) {
            $this->pdo->beginTransaction();
            try {
                $this->pdo->exec(<<<'SQL'
                    CREATE TABLE booking_verifications (
                        booking_id TEXT PRIMARY KEY,
                        code_hash TEXT NOT NULL,
                        target_status TEXT NOT NULL CHECK (target_status IN ('pending', 'confirmed')),
                        created_at TEXT NOT NULL,
                        expires_at TEXT NOT NULL,
                        last_sent_at TEXT NOT NULL,
                        attempts INTEGER NOT NULL DEFAULT 0,
                        resend_count INTEGER NOT NULL DEFAULT 0,
                        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
                    );
                    CREATE INDEX booking_verifications_expiry ON booking_verifications(expires_at);
                    PRAGMA user_version = 2;
                    SQL);
                $this->pdo->commit();
            } catch (\Throwable $e) {
                if ($this->pdo->inTransaction()) {
                    $this->pdo->rollBack();
                }
                throw new RuntimeException('Booking verification migration failed.', 0, $e);
            }
        }
    }
}
