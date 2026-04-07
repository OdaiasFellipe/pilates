<?php

namespace App\Enums;

enum PatientPackageStatus: string
{
    case Active = 'active';
    case Completed = 'completed';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Ativo',
            self::Completed => 'Concluído',
            self::Expired => 'Expirado',
            self::Cancelled => 'Cancelado',
        };
    }
}
