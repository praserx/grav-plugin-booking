<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Validation;

/**
 * Server-side validation for booking inputs.
 *
 * Never trust the front-end form alone. Every field is validated here
 * before being passed to the domain service.
 */
final class BookingValidator
{
    /**
     * Validate a booking creation request.
     *
     * @param array<string, mixed> $data Raw input data
     *
     * @return array{valid: bool, errors: array<string, string>, sanitized: array<string, mixed>}
     */
    public static function validateBookingCreation(array $data): array
    {
        $errors = [];
        $sanitized = [];

        // facility_id: required, must be a valid slug
        $facilityId = self::trimString($data['facility_id'] ?? '');
        if ($facilityId === '') {
            $errors['facility_id'] = 'Facility is required.';
        } elseif (!preg_match('/^[a-z0-9-]+$/', $facilityId)) {
            $errors['facility_id'] = 'Facility ID contains invalid characters.';
        } else {
            $sanitized['facility_id'] = $facilityId;
        }

        // resource_id: optional, must be a valid slug if provided
        $resourceId = self::trimString($data['resource_id'] ?? '');
        if ($resourceId !== '') {
            if (!preg_match('/^[a-z0-9-]+$/', $resourceId)) {
                $errors['resource_id'] = 'Resource ID contains invalid characters.';
            } else {
                $sanitized['resource_id'] = $resourceId;
            }
        }

        // start: required, must be RFC3339
        $start = self::trimString($data['start'] ?? '');
        if ($start === '') {
            $errors['start'] = 'Start time is required.';
        } elseif (!self::isValidRfc3339($start)) {
            $errors['start'] = 'Start time must be a valid RFC3339 timestamp.';
        } else {
            $sanitized['start'] = $start;
        }

        // end: required, must be RFC3339 and after start
        $end = self::trimString($data['end'] ?? '');
        if ($end === '') {
            $errors['end'] = 'End time is required.';
        } elseif (!self::isValidRfc3339($end)) {
            $errors['end'] = 'End time must be a valid RFC3339 timestamp.';
        } else {
            $sanitized['end'] = $end;
        }

        // Validate end > start if both are valid
        if (!isset($errors['start']) && !isset($errors['end'])) {
            $startTs = strtotime($start);
            $endTs = strtotime($end);
            if ($startTs === false || $endTs === false) {
                $errors['start'] = 'Could not parse timestamps.';
            } elseif ($endTs <= $startTs) {
                $errors['end'] = 'End time must be after start time.';
            }
        }

        // customer_name: required
        $customerName = self::trimString($data['customer_name'] ?? '');
        if ($customerName === '') {
            $errors['customer_name'] = 'Customer name is required.';
        } elseif (mb_strlen($customerName) > 255) {
            $errors['customer_name'] = 'Customer name is too long (max 255 characters).';
        } else {
            $sanitized['customer_name'] = $customerName;
        }

        // customer_email: required, must be valid
        $customerEmail = self::trimString($data['customer_email'] ?? '');
        if ($customerEmail === '') {
            $errors['customer_email'] = 'Customer email is required.';
        } elseif (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
            $errors['customer_email'] = 'Customer email is invalid.';
        } elseif (mb_strlen($customerEmail) > 255) {
            $errors['customer_email'] = 'Customer email is too long (max 255 characters).';
        } else {
            $sanitized['customer_email'] = $customerEmail;
        }

        // customer_phone: optional
        $customerPhone = self::trimString($data['customer_phone'] ?? '');
        if ($customerPhone !== '') {
            if (mb_strlen($customerPhone) > 50) {
                $errors['customer_phone'] = 'Phone number is too long (max 50 characters).';
            } elseif (!preg_match('/^[\d\s\-\+\(\)\.]+$/', $customerPhone)) {
                $errors['customer_phone'] = 'Phone number contains invalid characters.';
            } else {
                $sanitized['customer_phone'] = $customerPhone;
            }
        }

        // customer_note: optional
        $customerNote = self::trimString($data['customer_note'] ?? '');
        if ($customerNote !== '') {
            if (mb_strlen($customerNote) > 5000) {
                $errors['customer_note'] = 'Note is too long (max 5000 characters).';
            } else {
                $sanitized['customer_note'] = $customerNote;
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'sanitized' => $sanitized,
        ];
    }

    /**
     * Validate a status transition request.
     *
     * @param string $bookingId Booking UUID
     * @param string $newStatus Target status
     *
     * @return array{valid: bool, errors: array<string, string>, sanitized: array<string, string>}
     */
    public static function validateStatusTransition(string $bookingId, string $newStatus): array
    {
        $errors = [];
        $sanitized = [];

        // booking_id: required, must be UUID format
        $bookingId = self::trimString($bookingId);
        if ($bookingId === '') {
            $errors['booking_id'] = 'Booking ID is required.';
        } elseif (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $bookingId)) {
            $errors['booking_id'] = 'Booking ID must be a valid UUID.';
        } else {
            $sanitized['booking_id'] = strtolower($bookingId);
        }

        // new_status: required, must be one of the allowed values
        $allowedStatuses = ['confirmed', 'rejected', 'cancelled'];
        $newStatus = self::trimString($newStatus);
        if ($newStatus === '') {
            $errors['status'] = 'Target status is required.';
        } elseif (!in_array($newStatus, $allowedStatuses, true)) {
            $errors['status'] = 'Invalid target status. Allowed: ' . implode(', ', $allowedStatuses);
        } else {
            $sanitized['status'] = $newStatus;
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'sanitized' => $sanitized,
        ];
    }

    /**
     * Validate an availability check request.
     *
     * @param array<string, mixed> $data Raw input data
     *
     * @return array{valid: bool, errors: array<string, string>, sanitized: array<string, mixed>}
     */
    public static function validateAvailabilityCheck(array $data): array
    {
        $errors = [];
        $sanitized = [];

        $facilityId = self::trimString($data['facility_id'] ?? '');
        if ($facilityId === '') {
            $errors['facility_id'] = 'Facility is required.';
        } elseif (!preg_match('/^[a-z0-9-]+$/', $facilityId)) {
            $errors['facility_id'] = 'Facility ID contains invalid characters.';
        } else {
            $sanitized['facility_id'] = $facilityId;
        }

        $resourceId = self::trimString($data['resource_id'] ?? '');
        if ($resourceId !== '' && !preg_match('/^[a-z0-9-]+$/', $resourceId)) {
            $errors['resource_id'] = 'Resource ID contains invalid characters.';
        } elseif ($resourceId !== '') {
            $sanitized['resource_id'] = $resourceId;
        }

        $date = self::trimString($data['date'] ?? '');
        if ($date === '') {
            $errors['date'] = 'Date is required.';
        } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $errors['date'] = 'Date must be in YYYY-MM-DD format.';
        } else {
            $parts = explode('-', $date);
            if (!checkdate((int) $parts[1], (int) $parts[2], (int) $parts[0])) {
                $errors['date'] = 'Date is not a valid calendar date.';
            } else {
                $sanitized['date'] = $date;
            }
        }

        $start = self::trimString($data['start'] ?? '');
        $end = self::trimString($data['end'] ?? '');
        if ($start === '' && $end === '') {
            $errors['start'] = 'Start and end are required.';
        } elseif (($start === '') !== ($end === '')) {
            $errors['start'] = 'Start and end must be provided together.';
        } elseif ($start !== '') {
            if (!self::isValidRfc3339($start)) {
                $errors['start'] = 'Start must be an RFC3339 timestamp with an offset.';
            } else {
                $sanitized['start'] = $start;
            }
            if (!self::isValidRfc3339($end)) {
                $errors['end'] = 'End must be an RFC3339 timestamp with an offset.';
            } else {
                $sanitized['end'] = $end;
            }
            if (isset($sanitized['start'], $sanitized['end']) && strtotime($end) <= strtotime($start)) {
                $errors['end'] = 'End must be after start.';
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'sanitized' => $sanitized,
        ];
    }

    private static function trimString(mixed $value): string
    {
        return is_string($value) ? trim($value) : '';
    }

    public static function isValidRfc3339(string $value): bool
    {
        // Accept both Z and +HH:MM offset formats
        $pattern = '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?([Zz]|[+\-]\d{2}:\d{2})$/';
        if (!preg_match($pattern, $value)) {
            return false;
        }
        return strtotime($value) !== false;
    }
}
