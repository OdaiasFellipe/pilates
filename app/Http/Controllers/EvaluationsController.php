<?php

namespace App\Http\Controllers;

use App\Http\Requests\Clinical\StoreEvaluationRequest;
use App\Models\Evaluation;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationsController extends Controller
{
    public function create(): Response
    {
        Gate::authorize('create', Evaluation::class);

        return Inertia::render('clinical/evaluations/create', [
            'patients' => Patient::query()->active()->orderBy('name')->get(['id', 'name']),
            'professionals' => $this->professionalOptions(),
        ]);
    }

    public function store(StoreEvaluationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->user()->isProfessional()) {
            $data['professional_id'] = $request->user()->id;
        }

        $evaluation = Evaluation::create($data);

        return to_route('clinical.evaluations.show', $evaluation)
            ->with('success', 'Avaliacao inicial registrada com sucesso.');
    }

    public function show(Evaluation $evaluation): Response
    {
        Gate::authorize('view', $evaluation);

        $evaluation->load(['patient:id,name', 'professional:id,name,specialty']);

        return Inertia::render('clinical/evaluations/show', [
            'evaluation' => $evaluation,
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
