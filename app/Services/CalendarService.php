<?php

namespace App\Services;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CalendarService
{
    public function getAppointmentsForRange(string $startDate, string $endDate, ?int $professionalId = null): Collection
    {
        $query = Appointment::query()
            ->with(['patient:id,name', 'professional:id,name'])
            ->whereBetween('starts_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);

        if ($professionalId) {
            $query->where('professional_id', $professionalId);
        }

        return $query->orderBy('starts_at')->get();
    }

    public function detectConflicts(int $professionalId, Carbon $startsAt, Carbon $endsAt, ?int $exceptAppointmentId = null): Collection
    {
        $query = Appointment::query()
            ->where('professional_id', $professionalId)
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->whereBetween('starts_at', [$startsAt, $endsAt])
                    ->orWhereBetween('ends_at', [$startsAt, $endsAt])
                    ->orWhere(function ($q2) use ($startsAt, $endsAt) {
                        $q2->where('starts_at', '<=', $startsAt)
                            ->where('ends_at', '>=', $endsAt);
                    });
            })
            ->where('status', '!=', 'cancelled');

        if ($exceptAppointmentId) {
            $query->where('id', '!=', $exceptAppointmentId);
        }

        return $query->get();
    }

    public function getAvailableSlots(int $professionalId, string $date, int $durationMinutes = 60): array
    {
        $dateCarbon = Carbon::parse($date);
        $workingHours = $this->getWorkingHours($professionalId, $dateCarbon->dayOfWeek);

        if (!$workingHours) {
            return [];
        }

        $appointments = $this->getAppointmentsForRange(
            $dateCarbon->toDateString(),
            $dateCarbon->toDateString(),
            $professionalId
        );

        $slots = [];
        foreach ($workingHours as $slot) {
            $current = Carbon::parse("{$date} {$slot['start']}");
            $slotEnd = Carbon::parse("{$date} {$slot['end']}");

            while ($current->addMinutes($durationMinutes) <= $slotEnd) {
                $slotStartTime = $current->copy();
                $slotEndTime = $current->copy()->addMinutes($durationMinutes);

                $hasConflict = $appointments->some(fn ($apt) => 
                    $apt->starts_at->lessThan($slotEndTime) && $apt->ends_at->greaterThan($slotStartTime)
                );

                if (!$hasConflict) {
                    $slots[] = [
                        'start' => $slotStartTime->format('H:i'),
                        'end' => $slotEndTime->format('H:i'),
                        'available' => true,
                    ];
                }

                $current = $slotEndTime;
            }
        }

        return $slots;
    }

    private function getWorkingHours(int $professionalId, int $dayOfWeek): ?array
    {
        $professional = \App\Models\User::find($professionalId);

        if (!$professional?->working_hours) {
            return null;
        }

        $dayHours = collect($professional->working_hours)
            ->first(fn ($h) => $h['day'] === $dayOfWeek);

        return $dayHours['slots'] ?? null;
    }
}
