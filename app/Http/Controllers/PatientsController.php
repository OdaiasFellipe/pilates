<?php

namespace App\Http\Controllers;

use App\Http\Requests\Patients\StorePatientRequest;
use App\Http\Requests\Patients\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PatientsController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Patient::class);

        $patients = Patient::query()
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('cpf', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
            )
            ->when($request->status !== null, function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Patient::class);

        return Inertia::render('patients/create');
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $patient = Patient::create($request->validated());

        return to_route('patients.show', $patient)
            ->with('success', 'Paciente cadastrado com sucesso.');
    }

    public function show(Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        $patient->load([
            'appointments' => fn ($q) => $q
                ->with(['professional:id,name'])
                ->latest('starts_at')
                ->limit(20),
            'evaluations' => fn ($q) => $q
                ->with(['professional:id,name'])
                ->latest('evaluated_at'),
            'treatmentPlans' => fn ($q) => $q
                ->with(['professional:id,name'])
                ->latest('created_at'),
            'sessions' => fn ($q) => $q
                ->with(['professional:id,name'])
                ->latest('attended_at')
                ->limit(20),
            'patientPackages' => fn ($q) => $q
                ->with(['package:id,name', 'payments:id,patient_package_id,amount,status'])
                ->latest('created_at'),
            'documents' => fn ($q) => $q
                ->with(['uploadedBy:id,name'])
                ->latest('uploaded_at'),
        ]);

        return Inertia::render('patients/show', [
            'patient' => $patient,
        ]);
    }

    public function edit(Patient $patient): Response
    {
        Gate::authorize('update', $patient);

        return Inertia::render('patients/edit', [
            'patient' => $patient,
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        $patient->update($request->validated());

        return to_route('patients.show', $patient)
            ->with('success', 'Paciente atualizado com sucesso.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        Gate::authorize('delete', $patient);

        $patient->delete();

        return to_route('patients.index')
            ->with('success', 'Paciente removido com sucesso.');
    }
}
