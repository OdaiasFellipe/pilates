<?php

namespace App\Http\Controllers;

use App\Http\Requests\Clinical\StoreSessionRequest;
use App\Models\Appointment;
use App\Models\Session;
use App\Models\TreatmentPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SessionsController extends Controller
{
    public function create(): Response
    {
        Gate::authorize('create', Session::class);

        $appointments = Appointment::query()
            ->with(['patient:id,name', 'professional:id,name'])
            ->when(request()->user()?->isProfessional(), fn ($q) => $q->where('professional_id', request()->user()->id))
            ->doesntHave('session')
            ->orderByDesc('starts_at')
            ->get(['id', 'patient_id', 'professional_id', 'starts_at']);

        $treatmentPlans = TreatmentPlan::query()
            ->with('patient:id,name')
            ->when(request()->user()?->isProfessional(), fn ($q) => $q->where('professional_id', request()->user()->id))
            ->where('status', 'active')
            ->orderByDesc('started_at')
            ->get(['id', 'patient_id', 'professional_id', 'started_at']);

        return Inertia::render('clinical/sessions/create', [
            'appointments' => $appointments,
            'treatmentPlans' => $treatmentPlans,
        ]);
    }

    public function store(StoreSessionRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $appointment = Appointment::query()->findOrFail($data['appointment_id']);

        $session = Session::create([
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'professional_id' => $appointment->professional_id,
            'treatment_plan_id' => $data['treatment_plan_id'] ?? null,
            'evolution_notes' => $data['evolution_notes'],
            'soap_note' => $data['soap_note'] ?? null,
            'exercises' => $data['exercises'] ?? null,
            'pain_scale' => $data['pain_scale'] ?? null,
            'attended_at' => $data['attended_at'],
        ]);

        return to_route('clinical.sessions.show', $session)
            ->with('success', 'Evolucao clinica registrada com sucesso.');
    }

    public function show(Session $session): Response
    {
        Gate::authorize('view', $session);

        $session->load([
            'patient:id,name',
            'professional:id,name,specialty',
            'appointment:id,starts_at,ends_at,type,status',
            'treatmentPlan:id,diagnosis,status',
        ]);

        return Inertia::render('clinical/sessions/show', [
            'session' => $session,
        ]);
    }
}
