<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

class AppointmentConflictService
{
    public function hasProfessionalConflict(
        int $professionalId,
        CarbonInterface $startsAt,
        CarbonInterface $endsAt,
        ?int $excludeAppointmentId = null,
    ): bool
    {
        return $this->baseConflictQuery($startsAt, $endsAt, $excludeAppointmentId)
            ->where('professional_id', $professionalId)
            ->exists();
    }

    public function hasPatientConflict(
        int $patientId,
        CarbonInterface $startsAt,
        CarbonInterface $endsAt,
        ?int $excludeAppointmentId = null,
    ): bool
    {
        return $this->baseConflictQuery($startsAt, $endsAt, $excludeAppointmentId)
            ->where('patient_id', $patientId)
            ->exists();
    }

    private function baseConflictQuery(
        CarbonInterface $startsAt,
        CarbonInterface $endsAt,
        ?int $excludeAppointmentId = null,
    ): Builder
    {
        return Appointment::query()
            ->whereNotIn('status', [AppointmentStatus::Cancelled->value, AppointmentStatus::Missed->value])
            ->when($excludeAppointmentId !== null, fn ($q) => $q->where('id', '!=', $excludeAppointmentId))
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->where('starts_at', '<', $endsAt)
                    ->where('ends_at', '>', $startsAt);
            });
    }
}
