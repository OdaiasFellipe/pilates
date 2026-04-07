<?php

namespace App\Enums;

enum CalendarView: string
{
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';

    public function label(): string
    {
        return match ($this) {
            self::Day => 'Dia',
            self::Week => 'Semana',
            self::Month => 'Mês',
        };
    }
}
