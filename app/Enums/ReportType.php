<?php

namespace App\Enums;

enum ReportType: string
{
    case ClinicalProgress = 'clinical_progress';
    case AttendanceRate = 'attendance_rate';
    case RevenueByProfessional = 'revenue_by_professional';
    case TreatmentEffectiveness = 'treatment_effectiveness';

    public function label(): string
    {
        return match ($this) {
            self::ClinicalProgress => 'Progresso Clínico',
            self::AttendanceRate => 'Taxa de Comparecimento',
            self::RevenueByProfessional => 'Receita por Profissional',
            self::TreatmentEffectiveness => 'Efetividade do Tratamento',
        };
    }
}
