<?php

namespace App\Enums;

enum AppointmentType: string
{
    case Pilates = 'pilates';
    case Physiotherapy = 'physiotherapy';
    case Evaluation = 'evaluation';

    public function label(): string
    {
        return match ($this) {
            self::Pilates => 'Pilates',
            self::Physiotherapy => 'Fisioterapia',
            self::Evaluation => 'Avaliacao',
        };
    }
}
