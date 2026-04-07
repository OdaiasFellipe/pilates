<?php

namespace App\Http\Controllers;

use App\Http\Requests\Clinical\StoreTreatmentPlanRequest;
use App\Models\Patient;
use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TreatmentPlansController extends Controller
{
    public function create(): Response
    {
        Gate::authorize('create', TreatmentPlan::class);

        return Inertia::render('clinical/treatment-plans/create', [
            'patients' => Patient::query()->active()->orderBy('name')->get(['id', 'name']),
            'professionals' => $this->professionalOptions(),
        ]);
    }

    public function store(StoreTreatmentPlanRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->user()->isProfessional()) {
            $data['professional_id'] = $request->user()->id;
        }

        $treatmentPlan = TreatmentPlan::create($data);

        return to_route('clinical.treatment-plans.show', $treatmentPlan)
            ->with('success', 'Plano de tratamento criado com sucesso.');
    }

    public function show(TreatmentPlan $treatmentPlan): Response
    {
        Gate::authorize('view', $treatmentPlan);

        $treatmentPlan->load([
            'patient:id,name',
            'professional:id,name,specialty',
            'sessions:id,treatment_plan_id,attended_at,pain_scale,evolution_notes',
        ]);

        return Inertia::render('clinical/treatment-plans/show', [
            'treatmentPlan' => $treatmentPlan,
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
