<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

enum BookingMode: string
{
    case Facility = 'facility';
    case Resources = 'resources';
    case Both = 'both';
}
