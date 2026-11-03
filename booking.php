<?php

declare(strict_types=1);

namespace Grav\Plugin;

use Grav\Common\Plugin;
use Grav\Common\Data\Blueprint;
use Grav\Plugin\Booking\Api\AdminBookingController;
use Grav\Plugin\Booking\Api\PublicBookingController;
use Grav\Plugin\Booking\Blueprint\BookingPageOptions;
use Grav\Plugin\Booking\ServiceLocator;
use RocketTheme\Toolbox\Event\Event;

/**
 * Grav 2 booking plugin entry point.
 *
 * Registers booking API routes and Admin Next integration.
 */
class BookingPlugin extends Plugin
{
    public function autoload(): \Composer\Autoload\ClassLoader
    {
        $loader = new \Composer\Autoload\ClassLoader();
        $loader->addPsr4('Grav\\Plugin\\Booking\\', __DIR__ . '/classes/Booking');
        $loader->register(true);

        return $loader;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'onPluginsInitialized' => ['onPluginsInitialized', 0],
            'onApiRegisterRoutes' => ['onApiRegisterRoutes', 0],
            'onApiCollectPublicRoutes' => ['onApiCollectPublicRoutes', 0],
            'onApiSidebarItems' => ['onApiSidebarItems', 0],
            'onApiPluginPageInfo' => ['onApiPluginPageInfo', 0],
            'onTwigTemplatePaths' => ['onTwigTemplatePaths', 0],
            'onGetPageTemplates' => ['onGetPageTemplates', 0],
            'onGetPageBlueprints' => ['onGetPageBlueprints', 0],
            'onTwigSiteVariables' => ['onTwigSiteVariables', 0],
            'onSchedulerInitialized' => ['onSchedulerInitialized', 0],
        ];
    }

    /**
     * Initialize the booking services with the site configuration and data path.
     */
    public function onPluginsInitialized(): void
    {
        Blueprint::addAllowedDynamicCallable(BookingPageOptions::class . '::facilityOptions');

        // Initialize the service locator with facility configuration
        $facilityConfig = $this->config->get('plugins.booking.facilities', []);
        $dataPath = $this->grav['locator']->findResource('user://data/booking', true, true);

        if ($dataPath === false) {
            // Create the data directory if it doesn't exist
            $dataPath = $this->grav['locator']->findResource('user://data', true, true) . '/booking';
            if (!is_dir($dataPath)) {
                mkdir($dataPath, 0750, true);
            }
        }
        @chmod($dataPath, 0750);

        $services = ServiceLocator::instance();
        $services->initialize($facilityConfig, $dataPath);
        $services->setEmailSender(function (string $recipient, string $subject, string $body, string $contentType = 'text/plain'): bool {
            try {
                $email = $this->grav['Email'];
                $from = $this->grav['config']->get('plugins.email.from');
                if (!$email || !$from) {
                    return false;
                }
                $message = $email->message($subject, $body, $contentType)
                    ->setFrom($from)
                    ->setTo($recipient);
                return (int) $email->send($message) > 0;
            } catch (\Throwable $e) {
                $this->grav['log']->warning('Booking email delivery failed.');
                return false;
            }
        });
        try {
            $services->getVerificationService()->expire();
        } catch (\Throwable) {
            $this->grav['log']->warning('Booking verification cleanup failed.');
        }
    }

    /** Register periodic cleanup for email codes that were never verified. */
    public function onSchedulerInitialized(Event $event): void
    {
        $scheduler = $event['scheduler'] ?? null;
        if (!is_object($scheduler) || !method_exists($scheduler, 'addFunction')) {
            return;
        }
        $scheduler->addFunction(self::class . '::expireBookingVerifications', [], 'booking-expire-verifications')
            ->at('*/5 * * * *');
    }

    public static function expireBookingVerifications(): void
    {
        try {
            ServiceLocator::instance()->getVerificationService()->expire();
        } catch (\Throwable $exception) {
            if (isset($GLOBALS['grav']) && isset($GLOBALS['grav']['log'])) {
                $GLOBALS['grav']['log']->warning('Booking verification expiry job failed.');
            }
        }
    }

    /**
     * Make the plugin's trusted Twig templates available to front-end pages.
     */
    public function onTwigTemplatePaths(): void
    {
        $this->grav['twig']->twig_paths[] = __DIR__ . '/templates';
    }

    /**
     * Expose the booking form as a selectable Admin Next page type.
     */
    public function onGetPageTemplates(Event $event): void
    {
        $event->types->register('booking-form');
    }

    /**
     * Load the page blueprint that accompanies the booking-form template.
     */
    public function onGetPageBlueprints(Event $event): void
    {
        $event->types->scanBlueprints('plugins://' . $this->name . '/blueprints/pages');
    }

    /**
     * Pass enabled facilities to the trusted public booking Twig template.
     *
     * The template receives plain arrays so it does not need to know about the
     * booking domain objects or call methods from page content.
     */
    public function onTwigSiteVariables(): void
    {
        $facilities = [];
        $page = $this->grav['page'] ?? null;
        $pageHeader = is_object($page) && method_exists($page, 'header') ? $page->header() : null;
        $pageFacilityId = is_object($pageHeader)
            ? trim((string) ($pageHeader->booking_facility_id ?? ''))
            : '';
        $accessPolicy = new \Grav\Plugin\Booking\Service\BookingAccessPolicy();
        $user = $this->grav['user'] ?? null;
        $groups = [];
        if (is_object($user) && method_exists($user, 'get')) {
            $groups = $accessPolicy->groups($user->get('groups'));
        }

        foreach (ServiceLocator::instance()->getCatalog()->all() as $facility) {
            if ($pageFacilityId !== '' && $facility->id !== $pageFacilityId) {
                continue;
            }
            if (!$facility->enabled || !$accessPolicy->canRequest($facility, null, $groups)) {
                continue;
            }

            $resources = [];
            foreach ($facility->getResources() as $resource) {
                if ($accessPolicy->canRequest($facility, $resource, $groups)) {
                    $resources[] = [
                        'id' => $resource->id,
                        'name' => $resource->name,
                    ];
                }
            }
            if ($facility->bookingMode === \Grav\Plugin\Booking\Domain\BookingMode::Resources && $resources === []) {
                continue;
            }

            $facilities[] = [
                'id' => $facility->id,
                'name' => $facility->name,
                'booking_mode' => $facility->bookingMode->value,
                'timezone' => $facility->timezone,
                'resources' => $resources,
                'booking_options' => PublicBookingController::publicBookingOptions($facility->id),
            ];
        }

        $this->grav['twig']->twig_vars['booking_facilities'] = $facilities;
        $apiRoute = trim((string) $this->grav['config']->get('plugins.api.route', 'api'), '/');
        $apiVersion = trim((string) $this->grav['config']->get('plugins.api.version_prefix', 'v1'), '/');
        $rootUrl = rtrim((string) $this->grav['uri']->rootUrl(), '/');
        $this->grav['twig']->twig_vars['booking_api_base'] = $rootUrl . '/' . $apiRoute . '/' . $apiVersion . '/booking';
        $this->grav['twig']->twig_vars['booking_requester'] = [
            'name' => is_object($user) && method_exists($user, 'get')
                ? (string) ($user->get('fullname') ?: $user->get('username') ?: '') : '',
            'email' => is_object($user) && method_exists($user, 'get') ? (string) ($user->get('email') ?: '') : '',
            'logged_in' => is_object($user) && method_exists($user, 'get') && (string) $user->get('username') !== '',
        ];
    }

    public function onApiRegisterRoutes(Event $event): void
    {
        $routes = $event['routes'];

        // Public routes (always available when plugin is enabled)
        $routes->get('/booking/facilities', [PublicBookingController::class, 'listFacilities']);
        $routes->get('/booking/availability', [PublicBookingController::class, 'checkAvailability']);
        $routes->get('/booking/calendar', [PublicBookingController::class, 'availabilityCalendar']);
        $routes->post('/booking/reservations', [PublicBookingController::class, 'createReservation']);
        $routes->post('/booking/reservations/verify', [PublicBookingController::class, 'verifyReservation']);
        $routes->post('/booking/reservations/resend-verification', [PublicBookingController::class, 'resendVerification']);

        // Admin routes (require authorization)
        $routes->get('/booking/admin/facilities', [AdminBookingController::class, 'listFacilities']);
        $routes->get('/booking/admin/facilities/{id}', [AdminBookingController::class, 'getFacility']);
        $routes->post('/booking/admin/facilities', [AdminBookingController::class, 'createFacility']);
        $routes->put('/booking/admin/facilities/{id}', [AdminBookingController::class, 'updateFacility']);
        $routes->delete('/booking/admin/facilities/{id}', [AdminBookingController::class, 'deleteFacility']);
        $routes->get('/booking/admin/bookings', [AdminBookingController::class, 'listBookings']);
        $routes->post('/booking/admin/bookings', [AdminBookingController::class, 'createBooking']);
        $routes->get('/booking/admin/bookings/{id}', [AdminBookingController::class, 'getBooking']);
        $routes->patch('/booking/admin/bookings/{id}', [AdminBookingController::class, 'editBooking']);
        $routes->delete('/booking/admin/bookings/{id}', [AdminBookingController::class, 'deleteBooking']);
        $routes->patch('/booking/admin/bookings/{id}/status', [AdminBookingController::class, 'transitionStatus']);
        $routes->post('/booking/admin/bookings/{id}/payment-email', [AdminBookingController::class, 'sendPaymentInformation']);
        $routes->get('/booking/admin/blocks', [AdminBookingController::class, 'listBlocks']);
        $routes->post('/booking/admin/blocks/fixed', [AdminBookingController::class, 'createFixedBlock']);
        $routes->post('/booking/admin/blocks/recurring', [AdminBookingController::class, 'createRecurringBlock']);
        $routes->delete('/booking/admin/blocks/fixed/{id}', [AdminBookingController::class, 'deleteFixedBlock']);
        $routes->delete('/booking/admin/blocks/recurring/{id}', [AdminBookingController::class, 'deleteRecurringBlock']);
        $routes->get('/booking/admin/migration/preview', [AdminBookingController::class, 'previewMigration']);
        $routes->post('/booking/admin/migration/import', [AdminBookingController::class, 'importLegacyData']);
    }

    public function onApiCollectPublicRoutes(Event $event): void
    {
        $exact = $event['exact'] ?? [];
        $apiBase = rtrim((string) ($event['api_base'] ?? ''), '/');

        // Public read-only endpoints (no auth required)
        $exact[] = 'GET ' . $apiBase . '/booking/facilities';
        $exact[] = 'GET ' . $apiBase . '/booking/availability';
        $exact[] = 'GET ' . $apiBase . '/booking/calendar';

        // Public write endpoint (requires CSRF, but no API token)
        $exact[] = 'POST ' . $apiBase . '/booking/reservations';
        $exact[] = 'POST ' . $apiBase . '/booking/reservations/verify';
        $exact[] = 'POST ' . $apiBase . '/booking/reservations/resend-verification';

        $event['exact'] = $exact;
    }

    public function onApiSidebarItems(Event $event): void
    {
        $items = $event['items'] ?? [];

        // Main booking sidebar entry
        $items[] = [
            'id' => 'booking',
            'plugin' => 'booking',
            'label' => 'PLUGIN_BOOKING.NAME',
            'icon' => 'fa-calendar-check',
            'route' => '/plugin/booking',
            'priority' => 10,
            'authorize' => ['booking.admin'],
        ];

        $event['items'] = $items;
    }

    public function onApiPluginPageInfo(Event $event): void
    {
        if (($event['plugin'] ?? null) !== 'booking') {
            return;
        }

        $event['definition'] = [
            'id' => 'booking',
            'plugin' => 'booking',
            // Plugin page info is rendered by Admin Next as API data, so these
            // values are display strings rather than Grav translation keys.
            'title' => 'Booking',
            'icon' => 'fa-calendar-check',
            'page_type' => 'component',
        ];
    }

}
