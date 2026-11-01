<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Service;

use Grav\Plugin\Booking\Domain\Booking;
use Grav\Plugin\Booking\Storage\SqliteDatabase;
use Grav\Plugin\Booking\Storage\SqliteFacilityRepository;
use RuntimeException;
use Throwable;

/** Sends configured booking messages after a booking transaction has committed. */
final class BookingNotificationService
{
    private $sendEmail;
    private ?string $cachedDefaultEmailLayout = null;

    /** @param callable(string,string,string,string=):bool|null $sendEmail */
    public function __construct(
        private readonly SqliteDatabase $database,
        private readonly SqliteFacilityRepository $facilities,
        ?callable $sendEmail = null
    ) {
        $this->sendEmail = $sendEmail;
    }

    /**
     * Send the post-verification request/approval notices.
     * Requesters always receive the initial and final status mails; facility
     * recipients are controlled by their notification settings.
     */
    public function dispatch(Booking $booking, string $event): array
    {
        $settings = $this->settings($booking);
        $recipients = [];
        if (in_array($event, ['created', 'confirmed'], true) && filter_var($booking->customerEmail, FILTER_VALIDATE_EMAIL)) {
            $recipients[$booking->customerEmail] = 'requester';
        } elseif (!empty($settings['enabled']) && in_array($event, (array) ($settings['requester_events'] ?? []), true)
            && filter_var($booking->customerEmail, FILTER_VALIDATE_EMAIL)) {
            $recipients[$booking->customerEmail] = 'requester';
        }

        if (!empty($settings['enabled']) && in_array($event, (array) ($settings['facility_events'] ?? []), true)) {
            foreach ((array) ($settings['admin_recipients'] ?? []) as $email) {
                if (is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $recipients[$email] = $recipients[$email] ?? 'facility';
                }
            }
        }
        if ($event === 'payment_information' && filter_var($booking->customerEmail, FILTER_VALIDATE_EMAIL)) {
            $recipients = [$booking->customerEmail => 'requester'];
        }

        $result = ['queued' => 0, 'sent' => 0, 'failed' => 0];
        foreach ($recipients as $recipient => $audience) {
            [$subject, $body, $contentType] = $this->message($booking, $event, $audience, $settings);
            $result = $this->deliver($booking, $event, $recipient, $subject, $body, $contentType, $result);
        }
        return $result;
    }

    /** Always sent to the requester before normal booking notices. */
    public function sendVerificationCode(Booking $booking, string $code): bool
    {
        $settings = $this->settings($booking);
        $templates = is_array($settings['templates'] ?? null) ? $settings['templates'] : [];
        $context = $this->context($booking) + ['verification.code' => $code, 'verification.expires_in_hours' => '24'];
        $subject = $this->templateOrDefault($templates, 'verification_subject', 'Verify your booking request');
        $body = $this->templateOrDefault($templates, 'verification_body', '<p>Hello {{ customer.name }},</p><p>Your booking request for {{ facility.name }} was received.</p><p>Enter this code in the reservation form within 24 hours:</p><p style="font-size:28px;font-weight:bold;letter-spacing:5px">{{ verification.code }}</p>');
        $subject = $this->renderSubject($subject, $context);
        $sent = $this->deliver(
            $booking,
            'email_verification',
            $booking->customerEmail,
            $subject,
            $this->renderEmail($subject, $body, $context, $templates),
            'text/html',
            ['queued' => 0, 'sent' => 0, 'failed' => 0]
        );
        return $sent['sent'] > 0;
    }

    /** Explicit administrator action; delivers the configured HTML payment note to the requester. */
    public function sendPaymentInformation(Booking $booking): array
    {
        return $this->dispatch($booking, 'payment_information');
    }

    public function deliveriesFor(string $bookingId): array
    {
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            SELECT id, event, recipient, status, attempts, last_error, created_at, updated_at
            FROM notification_deliveries WHERE booking_id = :booking_id ORDER BY id DESC
            SQL);
        $statement->execute([':booking_id' => $bookingId]);
        return $statement->fetchAll();
    }

    private function settings(Booking $booking): array
    {
        try {
            $facility = $this->facilities->get($booking->facilityId);
        } catch (Throwable) {
            $facility = null;
        }
        return is_array($facility['notifications'] ?? null) ? $facility['notifications'] : [];
    }

    /** @return array{0:string,1:string,2:string} */
    private function message(Booking $booking, string $event, string $audience, array $settings): array
    {
        $facility = $this->facilities->get($booking->facilityId) ?? [];
        $templates = is_array($settings['templates'] ?? null) ? $settings['templates'] : [];
        $key = match (true) {
            $event === 'created' && $audience === 'facility' => 'created_admin',
            $event === 'created' => 'created_requester',
            $event === 'confirmed' => 'confirmed',
            $event === 'payment_information' => 'payment',
            default => $event,
        };
        $defaultSubject = match ($event) {
            'created' => 'Booking request received: ' . ($facility['name'] ?? $booking->facilityId),
            'confirmed' => 'Booking confirmed: ' . ($facility['name'] ?? $booking->facilityId),
            'payment_information' => 'Payment information: ' . ($facility['name'] ?? $booking->facilityId),
            default => 'Booking ' . $event . ': ' . ($facility['name'] ?? $booking->facilityId),
        };
        $subject = $this->templateOrDefault($templates, $key . '_subject', $defaultSubject);
        $details = '<ul><li><strong>Facility:</strong> {{ facility.name }}</li>'
            . '<li><strong>Room or resource:</strong> {{ booking.resource }}</li>'
            . '<li><strong>Start:</strong> {{ booking.start }}</li><li><strong>End:</strong> {{ booking.end }}</li>'
            . '<li><strong>Status:</strong> {{ booking.status }}</li></ul>';
        $defaultBody = match (true) {
            $event === 'created' && $audience === 'facility' => '<p>A new verified booking request is waiting for approval.</p>'
                . $details . '<p><strong>Requester:</strong> {{ customer.name }} &lt;{{ customer.email }}&gt;</p>'
                . '<p><strong>Telephone:</strong> {{ customer.phone }}</p><p><strong>Note:</strong> {{ booking.note }}</p>',
            $event === 'created' => '<p>Hello {{ customer.name }},</p>'
                . '<p>Your email address is verified and your booking request is waiting for approval.</p>' . $details,
            $event === 'confirmed' => '<p>Hello {{ customer.name }},</p>'
                . '<p>Your booking has been approved.</p>' . $details,
            $event === 'payment_information' => '<p>Hello {{ customer.name }},</p>'
                . '<p>Payment information for your booking:</p>' . $details,
            default => '<p>Booking update: ' . htmlspecialchars($event, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '.</p>'
                . $details . '<p><strong>Requester note:</strong> {{ booking.note }}</p>',
        };
        $bodyKey = match ($key) {
            'confirmed' => 'confirmed_body_html',
            'payment' => 'payment_body_html',
            default => $key . '_body',
        };
        $body = $this->templateOrDefault($templates, $bodyKey, $defaultBody);
        $context = $this->context($booking);
        $subject = $this->renderSubject($subject, $context);
        return [
            $subject,
            $this->renderEmail($subject, $body, $context, $templates),
            'text/html',
        ];
    }

    private function context(Booking $booking): array
    {
        $facility = $this->facilities->get($booking->facilityId) ?? [];
        $resourceName = '';
        foreach ((array) ($facility['resources'] ?? []) as $resource) {
            if (is_array($resource) && ($resource['id'] ?? null) === $booking->resourceId) {
                $resourceName = (string) ($resource['name'] ?? '');
                break;
            }
        }
        $zone = new \DateTimeZone($booking->facilityTimezone);
        return [
            'booking.id' => $booking->id,
            'booking.status' => $booking->status->value,
            'booking.start' => $booking->interval->start->setTimezone($zone)->format('Y-m-d H:i T'),
            'booking.end' => $booking->interval->end->setTimezone($zone)->format('Y-m-d H:i T'),
            'booking.timezone' => $booking->facilityTimezone,
            'booking.note' => (string) ($booking->customerNote ?? ''),
            'booking.resource' => $resourceName,
            'customer.name' => $booking->customerName,
            'customer.email' => $booking->customerEmail,
            'customer.phone' => (string) ($booking->customerTelephone ?? ''),
            'facility.id' => $booking->facilityId,
            'facility.name' => (string) ($facility['name'] ?? $booking->facilityId),
            'facility.description' => (string) ($facility['description'] ?? ''),
        ];
    }

    private function render(string $template, array $context, bool $html = false): string
    {
        return preg_replace_callback('/\{\{\s*([a-z][a-z0-9_.]*)\s*\}\}/i', static function (array $match) use ($context, $html): string {
            $value = (string) ($context[$match[1]] ?? '');
            if ($html && $match[1] === 'email.body') {
                return $value;
            }
            return $html ? htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : $value;
        }, $template) ?? $template;
    }

    private function renderEmail(string $subject, string $bodyTemplate, array $context, array $templates): string
    {
        $body = $this->render($bodyTemplate, $context, true);
        // Preserve line breaks in custom templates saved by earlier versions.
        if (!preg_match('/<\s*\/?\s*[a-z][^>]*>/i', $bodyTemplate)) {
            $body = nl2br($body, false);
        }

        $layout = $templates['email_layout_html'] ?? '';
        if (!is_string($layout) || trim($layout) === '') {
            $layout = $this->defaultEmailLayout();
        }
        $emailContext = $context;
        $emailContext['email.subject'] = $subject;
        $emailContext['email.body'] = $body;
        return $this->render($layout, $emailContext, true);
    }

    private function defaultEmailLayout(): string
    {
        if ($this->cachedDefaultEmailLayout === null) {
            $layout = file_get_contents(dirname(__DIR__, 3) . '/templates/emails/layout.html');
            if (!is_string($layout)) {
                throw new RuntimeException('The default booking email layout could not be loaded.');
            }
            $this->cachedDefaultEmailLayout = $layout;
        }
        return $this->cachedDefaultEmailLayout;
    }

    private function renderSubject(string $template, array $context): string
    {
        $subject = preg_replace('/[\r\n]+/', ' ', $this->render($template, $context)) ?? '';
        return mb_substr($subject, 0, 255);
    }

    private function templateOrDefault(array $templates, string $key, string $default): string
    {
        $value = $templates[$key] ?? null;
        return is_string($value) && trim($value) !== '' ? $value : $default;
    }

    private function deliver(
        Booking $booking,
        string $event,
        string $recipient,
        string $subject,
        string $body,
        string $contentType,
        array $result
    ): array {
        $id = null;
        try {
            $id = $this->queue($booking, $event, $recipient);
            $result['queued']++;
            if (!is_callable($this->sendEmail) || !($this->sendEmail)($recipient, $subject, $body, $contentType)) {
                throw new \RuntimeException('Email delivery is not available or failed.');
            }
            $this->finish($id, 'sent', null);
            $result['sent']++;
        } catch (Throwable) {
            $result['failed']++;
            if ($id !== null) {
                try {
                    $this->finish($id, 'failed', 'Delivery failed; check the Grav Email plugin configuration.');
                } catch (Throwable) {
                    // Booking changes have already committed; bookkeeping must not reverse them.
                }
            }
        }
        return $result;
    }

    private function queue(Booking $booking, string $event, string $recipient): int
    {
        $now = gmdate(DATE_ATOM);
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            INSERT INTO notification_deliveries
                (booking_id, facility_id, event, recipient, status, attempts, created_at, updated_at)
            VALUES (:booking_id, :facility_id, :event, :recipient, 'pending', 0, :created_at, :updated_at)
            SQL);
        $statement->execute([
            ':booking_id' => $booking->id,
            ':facility_id' => $booking->facilityId,
            ':event' => $event,
            ':recipient' => $recipient,
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);
        return (int) $this->database->pdo()->lastInsertId();
    }

    private function finish(int $id, string $status, ?string $error): void
    {
        $statement = $this->database->pdo()->prepare(<<<'SQL'
            UPDATE notification_deliveries
            SET status = :status, attempts = attempts + 1, last_error = :last_error, updated_at = :updated_at
            WHERE id = :id
            SQL);
        $statement->execute([
            ':status' => $status,
            ':last_error' => $error,
            ':updated_at' => gmdate(DATE_ATOM),
            ':id' => $id,
        ]);
    }
}
