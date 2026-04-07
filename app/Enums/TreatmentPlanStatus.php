<?php

namespace App\Enums;

enum TreatmentPlanStatus: string
{
    case Active = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Ativo',
            self::Completed => 'Concluido',
            self::Cancelled => 'Cancelado',
        };
    }
}
