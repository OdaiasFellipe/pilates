<?php

namespace App\Enums;

enum DocumentType: string
{
    case EvaluationForm = 'evaluation_form';
    case TreatmentPlan = 'treatment_plan';
    case SignedConsent = 'signed_consent';
    case ProgressPhoto = 'progress_photo';
    case ExerciseGuide = 'exercise_guide';
    case MedicalReport = 'medical_report';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::EvaluationForm => 'Ficha de Avaliação',
            self::TreatmentPlan => 'Plano de Tratamento',
            self::SignedConsent => 'Consentimento Assinado',
            self::ProgressPhoto => 'Foto de Progresso',
            self::ExerciseGuide => 'Guia de Exercícios',
            self::MedicalReport => 'Relatório Médico',
            self::Other => 'Outro',
        };
    }

    public function isImage(): bool
    {
        return in_array($this, [self::ProgressPhoto]);
    }

    public function isPdf(): bool
    {
        return in_array($this, [self::EvaluationForm, self::TreatmentPlan, self::SignedConsent, self::ExerciseGuide, self::MedicalReport]);
    }
}
