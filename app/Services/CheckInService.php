<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Enums\PatientPackageStatus;
use App\Models\Appointment;
use App\Models\PatientPackage;
use App\Models\Session;

class CheckInService
{
    /**
     * @return array{appointment: Appointment, sessions_remaining: int|null, package_alert: bool}
     */
    public function checkIn(Appointment $appointment): array
    {
        $appointment->update([
            'status' => AppointmentStatus::Completed,
            'checked_in_at' => now(),
        ]);

        $this->createSession($appointment);

        $packageInfo = $this->consumePackageSession($appointment);

        return [
            'appointment' => $appointment->fresh(['patient', 'professional']),
            'sessions_remaining' => $packageInfo['sessions_remaining'],
            'package_alert' => $packageInfo['package_alert'],
        ];
    }

    public function markNoShow(Appointment $appointment): Appointment
    {
        $appointment->update([
            'status' => AppointmentStatus::Missed,
        ]);

        return $appointment->fresh(['patient', 'professional']);
    }

    private function createSession(Appointment $appointment): Session
    {
        return Session::create([
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'professional_id' => $appointment->professional_id,
            'evolution_notes' => '',
            'attended_at' => now(),
        ]);
    }

    /**
     * @return array{sessions_remaining: int|null, package_alert: bool}
     */
    private function consumePackageSession(Appointment $appointment): array
    {
        $activePackage = PatientPackage::query()
            ->where('patient_id', $appointment->patient_id)
            ->where('status', PatientPackageStatus::Active)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            })
            ->whereColumn('sessions_used', '<', 'sessions_total')
            ->oldest('starts_at')
            ->first();

        if (! $activePackage) {
            return ['sessions_remaining' => null, 'package_alert' => false];
        }

        $activePackage->increment('sessions_used');
        $activePackage->refresh();

        $remaining = $activePackage->sessions_total - $activePackage->sessions_used;

        if ($remaining <= 0) {
            $activePackage->update(['status' => PatientPackageStatus::Completed]);
        }

        return [
            'sessions_remaining' => $remaining,
            'package_alert' => $remaining <= 2 && $remaining >= 0,
        ];
    }
}
