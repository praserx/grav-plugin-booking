<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking;

use Grav\Plugin\Booking\Configuration\FacilityCatalog;
use Grav\Plugin\Booking\Service\AvailabilityBlockService;
use Grav\Plugin\Booking\Service\AvailabilityService;
use Grav\Plugin\Booking\Service\BookingNotificationService;
use Grav\Plugin\Booking\Service\BookingService;
use Grav\Plugin\Booking\Service\BookingVerificationService;
use Grav\Plugin\Booking\Service\ConflictDetector;
use Grav\Plugin\Booking\Service\ScheduleEvaluator;
use Grav\Plugin\Booking\Storage\SqliteAvailabilityBlockRepository;
use Grav\Plugin\Booking\Storage\SqliteBookingRepository;
use Grav\Plugin\Booking\Storage\SqliteDatabase;
use Grav\Plugin\Booking\Storage\SqliteFacilityRepository;
use Grav\Plugin\Booking\Storage\LegacyDataImporter;
use Grav\Plugin\Booking\Storage\SqliteRecurringBlockRepository;
use Grav\Plugin\Booking\Storage\SqliteTransaction;

/**
 * Shared runtime services for Grav API controllers and public templates.
 */
final class ServiceLocator
{
    private static ?self $instance = null;

    private ?SqliteDatabase $database = null;
    private ?SqliteFacilityRepository $facilityRepo = null;
    private ?SqliteBookingRepository $bookingRepo = null;
    private ?SqliteAvailabilityBlockRepository $blockRepo = null;
    private ?SqliteRecurringBlockRepository $recurringBlockRepo = null;
    private ?FacilityCatalog $catalog = null;
    private ?BookingService $bookingService = null;
    private ?AvailabilityService $availabilityService = null;
    private ?AvailabilityBlockService $availabilityBlockService = null;
    private ?BookingNotificationService $notificationService = null;
    private ?BookingVerificationService $verificationService = null;
    private $emailSender = null;
    private array $legacyFacilityConfig = [];
    private string $dataPath = '';

    private function __construct()
    {
    }

    public static function instance(): self
    {
        return self::$instance ??= new self();
    }

    public static function reset(): void
    {
        self::$instance = null;
    }

    public function initialize(array $facilityConfig, string $dataPath): void
    {
        $this->dataPath = $dataPath;
        $this->legacyFacilityConfig = $facilityConfig;
        $this->notificationService = null;
        $this->verificationService = null;
        $this->database = new SqliteDatabase($dataPath . '/booking.sqlite');
        $this->facilityRepo = new SqliteFacilityRepository($this->database);
        $this->bookingRepo = new SqliteBookingRepository($this->database);
        $this->blockRepo = new SqliteAvailabilityBlockRepository($this->database);
        $this->recurringBlockRepo = new SqliteRecurringBlockRepository($this->database);
        $this->refreshCatalog();
    }

    public function refreshCatalog(): void
    {
        if ($this->facilityRepo === null || $this->database === null) {
            throw new \RuntimeException('Booking storage is not initialized.');
        }
        $this->catalog = new FacilityCatalog($this->facilityRepo->all());
        $transaction = new SqliteTransaction($this->database);
        $scheduleEvaluator = new ScheduleEvaluator();
        $conflictDetector = new ConflictDetector();
        $this->availabilityService = new AvailabilityService(
            $this->catalog,
            $this->bookingRepo(),
            $this->blockRepo(),
            $this->recurringBlockRepo(),
            $scheduleEvaluator,
            $conflictDetector
        );
        $this->bookingService = new BookingService(
            $this->catalog,
            $this->bookingRepo(),
            $this->blockRepo(),
            $this->recurringBlockRepo(),
            $transaction,
            $this->availabilityService
        );
        $this->availabilityBlockService = new AvailabilityBlockService(
            $this->catalog,
            $this->bookingRepo(),
            $this->blockRepo(),
            $this->recurringBlockRepo(),
            $transaction,
            $conflictDetector
        );
    }

    public function getCatalog(): FacilityCatalog
    {
        return $this->catalog ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    public function getDatabase(): SqliteDatabase
    {
        return $this->database ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    public function getFacilityRepository(): SqliteFacilityRepository
    {
        return $this->facilityRepo ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    public function getBookingService(): BookingService
    {
        return $this->bookingService ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    public function getAvailabilityService(): AvailabilityService
    {
        return $this->availabilityService ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    public function getAvailabilityBlockService(): AvailabilityBlockService
    {
        return $this->availabilityBlockService ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    public function getBookingRepository(): SqliteBookingRepository
    {
        return $this->bookingRepo();
    }

    public function getAvailabilityBlockRepository(): SqliteAvailabilityBlockRepository
    {
        return $this->blockRepo();
    }

    public function getRecurringBlockRepository(): SqliteRecurringBlockRepository
    {
        return $this->recurringBlockRepo();
    }

    public function getLegacyFacilityConfig(): array
    {
        return $this->legacyFacilityConfig;
    }

    public function getLegacyDataImporter(): LegacyDataImporter
    {
        return new LegacyDataImporter(
            $this->database(),
            $this->getFacilityRepository(),
            $this->bookingRepo(),
            $this->blockRepo(),
            $this->recurringBlockRepo(),
            $this->legacyFacilityConfig,
            $this->getDataPath()
        );
    }

    /** @param callable(string,string,string,string=):bool|null $sender */
    public function setEmailSender(?callable $sender): void
    {
        $this->emailSender = $sender;
        $this->notificationService = null;
        $this->verificationService = null;
    }

    public function getNotificationService(): BookingNotificationService
    {
        if ($this->notificationService === null) {
            $this->notificationService = new BookingNotificationService(
                $this->database(),
                $this->getFacilityRepository(),
                $this->emailSender
            );
        }
        return $this->notificationService;
    }

    public function getVerificationService(): BookingVerificationService
    {
        return $this->verificationService ??= new BookingVerificationService(
            $this->database(),
            $this->getBookingService(),
            $this->getNotificationService()
        );
    }

    public function getDataPath(): string
    {
        return $this->dataPath;
    }

    private function bookingRepo(): SqliteBookingRepository
    {
        return $this->bookingRepo ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    private function database(): SqliteDatabase
    {
        return $this->database ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    private function blockRepo(): SqliteAvailabilityBlockRepository
    {
        return $this->blockRepo ?? throw new \RuntimeException('Booking storage is not initialized.');
    }

    private function recurringBlockRepo(): SqliteRecurringBlockRepository
    {
        return $this->recurringBlockRepo ?? throw new \RuntimeException('Booking storage is not initialized.');
    }
}
