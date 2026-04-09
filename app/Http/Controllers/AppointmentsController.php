<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Http\Requests\Appointments\MoveAppointmentRequest;
use App\Http\Requests\Appointments\StoreAppointmentRequest;
use App\Http\Requests\Appointments\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Services\AppointmentConflictService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentsController extends Controller
{
    public function __construct(
        private AppointmentConflictService $conflictService,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Appointment::class);

        $appointments = Appointment::query()
            ->with(['patient:id,name', 'professional:id,name'])
            ->when($request->professional_id, fn ($q, $professionalId) => $q->where('professional_id', $professionalId))
            ->when($request->date, function ($q, $date) {
                $day = CarbonImmutable::parse($date);

                $q->whereBetween('starts_at', [$day->startOfDay(), $day->endOfDay()]);
            })
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->user()?->isProfessional(), fn ($q) => $q->where('professional_id', $request->user()->id))
            ->orderBy('starts_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'filters' => $request->only('professional_id', 'date', 'status'),
            'professionals' => User::query()
                ->where('role', 'professional')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Appointment::class);

        return Inertia::render('appointments/create', [
            'patients' => Patient::query()->active()->orderBy('name')->get(['id', 'name']),
            'professionals' => User::query()
                ->where('role', 'professional')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'defaultDurationMinutes' => 50,
        ]);
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $payload = $this->sanitizePayload($request->validated(), $request->user()->id, $request->user()->isProfessional());

        if ($this->hasConflicts($payload['professional_id'], $payload['patient_id'], $payload['starts_at'], $payload['ends_at'])) {
            return back()->withErrors([
                'starts_at' => 'Ja existe um conflito para o paciente ou profissional nesse horario.',
            ])->withInput();
        }

        $appointment = Appointment::create($payload);

        return to_route('appointments.show', $appointment)
            ->with('success', 'Agendamento criado com sucesso.');
    }

    public function show(Appointment $appointment): Response
    {
        Gate::authorize('view', $appointment);

        $appointment->load(['patient:id,name,phone', 'professional:id,name,specialty']);

        return Inertia::render('appointments/show', [
            'appointment' => $appointment,
        ]);
    }

    public function edit(Appointment $appointment): Response
    {
        Gate::authorize('update', $appointment);

        $appointment->load(['patient:id,name', 'professional:id,name']);

        return Inertia::render('appointments/edit', [
            'appointment' => $appointment,
            'patients' => Patient::query()->active()->orderBy('name')->get(['id', 'name']),
            'professionals' => User::query()
                ->where('role', 'professional')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'defaultDurationMinutes' => 50,
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $payload = $this->sanitizePayload($request->validated(), $request->user()->id, $request->user()->isProfessional());

        if ($this->hasConflicts(
            $payload['professional_id'],
            $payload['patient_id'],
            $payload['starts_at'],
            $payload['ends_at'],
            $appointment->id,
        )) {
            return back()->withErrors([
                'starts_at' => 'Ja existe um conflito para o paciente ou profissional nesse horario.',
            ])->withInput();
        }

        $appointment->update($payload);

        return to_route('appointments.show', $appointment)
            ->with('success', 'Agendamento atualizado com sucesso.');
    }

    public function move(MoveAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $startsAt = CarbonImmutable::parse((string) $request->validated('starts_at'));
        $duration = $appointment->starts_at->diffInMinutes($appointment->ends_at);
        $endsAt = $startsAt->addMinutes($duration);

        if ($this->hasConflicts($appointment->professional_id, $appointment->patient_id, $startsAt, $endsAt, $appointment->id)) {
            return response()->json(['message' => 'Conflito de horário detectado.'], 422);
        }

        $appointment->update([
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);

        return response()->json(['message' => 'Agendamento movido com sucesso.']);
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('delete', $appointment);

        $appointment->update([
            'status' => AppointmentStatus::Cancelled,
            'cancellation_reason' => request('cancellation_reason') ?: 'Cancelado manualmente.',
        ]);

        return to_route('appointments.index')
            ->with('success', 'Agendamento cancelado com sucesso.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function sanitizePayload(array $data, int $currentUserId, bool $isProfessional): array
    {
        $startsAt = CarbonImmutable::parse((string) $data['starts_at']);
        $endsAt = isset($data['ends_at'])
            ? CarbonImmutable::parse((string) $data['ends_at'])
            : $startsAt->addMinutes(50);

        if ($isProfessional) {
            $data['professional_id'] = $currentUserId;
        }

        $data['starts_at'] = $startsAt;
        $data['ends_at'] = $endsAt;
        $data['status'] = $data['status'] ?? AppointmentStatus::Scheduled;

        return $data;
    }

    private function hasConflicts(
        int $professionalId,
        int $patientId,
        CarbonImmutable $startsAt,
        CarbonImmutable $endsAt,
        ?int $excludeAppointmentId = null,
    ): bool {
        return $this->conflictService->hasProfessionalConflict($professionalId, $startsAt, $endsAt, $excludeAppointmentId)
            || $this->conflictService->hasPatientConflict($patientId, $startsAt, $endsAt, $excludeAppointmentId);
    }
}
