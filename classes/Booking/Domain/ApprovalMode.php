<?php

declare(strict_types=1);

namespace Grav\Plugin\Booking\Domain;

enum ApprovalMode: string
{
    case Automatic = 'automatic';
    case Manual = 'manual';
}
