<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Storage;

use Throwable;

final class SqliteTransaction
{
    public function __construct(private readonly SqliteDatabase $database)
    {
    }

    public function run(callable $operation): mixed
    {
        $this->database->beginImmediate();
        try {
            $result = $operation();
            $this->database->commit();
            return $result;
        } catch (Throwable $e) {
            $this->database->rollback();
            throw $e;
        }
    }
}
