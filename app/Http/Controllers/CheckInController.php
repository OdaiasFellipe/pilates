<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Services\CheckInService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CheckInController extends Controller
{
    public function __construct(
        private CheckInService $checkInService,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Appointment::class);

        $date = $request->date
            ? CarbonImmutable::parse((string) $request->date)
            : CarbonImmutable::today();

        $query = Appointment::query()
            ->with(['patient:id,name,phone', 'professional:id,name'])
            ->whereBetween('starts_at', [$date->startOfDay(), $date->endOfDay()])
            ->whereNotIn('status', [AppointmentStatus::Cancelled])
            ->when($request->user()?->isProfessional(), fn ($q) => $q->where('professional_id', $request->user()->id))
            ->when($request->period, function ($q, string $period) use ($date) {
                match ($period) {
                    'morning' => $q->where('starts_at', '<', $date->setTime(12, 0)),
                    'afternoon' => $q->whereBetween('starts_at', [$date->setTime(12, 0), $date->setTime(18, 0)]),
                    'evening' => $q->where('starts_at', '>=', $date->setTime(18, 0)),
                    default => null,
                };
            })
            ->when($request->search, fn ($q, string $search) => $q->whereHas(
                'patient',
                fn ($pq) => $pq->where('name', 'like', "%{$search}%")
            ))
            ->orderBy('starts_at');

        $appointments = $query->get()->map(fn (Appointment $apt) => [
            'id' => $apt->id,
            'patient_id' => $apt->patient_id,
            'patient_name' => $apt->patient?->name,
            'patient_phone' => $apt->patient?->phone,
            'professional_name' => $apt->professional?->name,
            'starts_at' => $apt->starts_at->toISOString(),
            'ends_at' => $apt->ends_at->toISOString(),
            'type' => $apt->type->value,
            'type_label' => $apt->type->label(),
            'status' => $apt->status->value,
            'status_label' => $apt->status->label(),
            'checked_in_at' => $apt->checked_in_at?->toISOString(),
        ]);

        return Inertia::render('checkin/index', [
            'appointments' => $appointments,
            'date' => $date->toDateString(),
            'filters' => $request->only('period', 'search'),
        ]);
    }

    public function checkIn(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('checkIn', $appointment);

        if ($appointment->checked_in_at) {
            return back()->with('error', 'Paciente já realizou check-in.');
        }

        $result = $this->checkInService->checkIn($appointment);

        return back()->with([
            'success' => 'Check-in realizado com sucesso.',
            'sessions_remaining' => $result['sessions_remaining'],
            'package_alert' => $result['package_alert'],
            'checkin_appointment_id' => $appointment->id,
        ]);
    }

    public function noShow(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('checkIn', $appointment);

        $this->checkInService->markNoShow($appointment);

        return back()->with([
            'success' => 'Falta registrada.',
            'noshow_appointment_id' => $appointment->id,
        ]);
    }
}
