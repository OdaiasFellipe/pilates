<?php

namespace App\Http\Controllers;

use App\Http\Requests\Financial\StorePatientPackageRequest;
use App\Models\Package;
use App\Models\Patient;
use App\Models\PatientPackage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PatientPackagesController extends Controller
{
    public function create(): Response
    {
        Gate::authorize('create', PatientPackage::class);

        return Inertia::render('Financial/PatientPackages/Create', [
            'patients' => Patient::query()->active()->orderBy('name')->get(['id', 'name']),
            'packages' => Package::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'session_count', 'validity_days', 'price']),
            'professionals' => $this->professionalOptions(),
        ]);
    }

    public function store(StorePatientPackageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->user()->isProfessional()) {
            $data['professional_id'] = $request->user()->id;
        }

        $package = Package::findOrFail($data['package_id']);
        $startsAt = Carbon::parse($data['starts_at']);

        $patientPackage = PatientPackage::create([
            ...$data,
            'sessions_total' => $package->session_count,
            'expires_at' => $startsAt->addDays($package->validity_days),
            'paid_at' => isset($data['paid_at']) ? Carbon::parse($data['paid_at']) : null,
        ]);

        return to_route('financial.patient-packages.show', $patientPackage)
            ->with('success', 'Pacote associado ao paciente com sucesso.');
    }

    public function show(PatientPackage $patientPackage): Response
    {
        Gate::authorize('view', $patientPackage);

        $patientPackage->load([
            'patient:id,name',
            'package:id,name,session_count,price',
            'professional:id,name,specialty',
            'payments',
        ]);

        return Inertia::render('Financial/PatientPackages/Show', [
            'patientPackage' => $patientPackage,
        ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, User>
     */
    private function professionalOptions()
    {
        $query = User::query()
            ->where('role', 'professional')
            ->where('is_active', true)
            ->orderBy('name');

        if (request()->user()?->isProfessional()) {
            $query->whereKey(request()->user()->id);
        }

        return $query->get(['id', 'name']);
    }
}
