<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Api;

use Grav\Plugin\Api\Response\ApiResponse;
use Psr\Http\Message\ResponseInterface;

/**
 * Error response adapter for the Grav API plugin's supported response factory.
 */
final class BookingApiResponse
{
    /**
     * Create an error-shaped JSON response using ApiResponse::create().
     *
     * @param array<mixed>|null $details
     */
    public static function error(string $message, int $status, ?array $details = null): ResponseInterface
    {
        $payload = ['message' => $message];
        if ($details !== null) {
            $payload['errors'] = $details;
        }

        return ApiResponse::create($payload, $status);
    }
}
