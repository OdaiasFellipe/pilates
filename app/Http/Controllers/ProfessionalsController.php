<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\Professionals\StoreProfessionalRequest;
use App\Http\Requests\Professionals\UpdateProfessionalRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfessionalsController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $professionals = User::query()
            ->where('role', UserRole::Professional)
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('cpf', 'like', "%{$search}%")
                ->orWhere('specialty', 'like', "%{$search}%")
            )
            ->when($request->status !== null, function ($q) use ($request) {
                $q->where('is_active', $request->status === 'active');
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('professionals/index', [
            'professionals' => $professionals,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('professionals/create');
    }

    public function store(StoreProfessionalRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['role'] = UserRole::Professional;
        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = $data['is_active'] ?? true;

        $professional = User::create($data);

        return to_route('professionals.show', $professional)
            ->with('success', 'Profissional cadastrado com sucesso.');
    }

    public function show(User $professional): Response
    {
        Gate::authorize('view', $professional);

        return Inertia::render('professionals/show', [
            'professional' => $professional,
        ]);
    }

    public function edit(User $professional): Response
    {
        Gate::authorize('update', $professional);

        return Inertia::render('professionals/edit', [
            'professional' => $professional,
        ]);
    }

    public function update(UpdateProfessionalRequest $request, User $professional): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password'], $data['password_confirmation']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $professional->update($data);

        return to_route('professionals.show', $professional)
            ->with('success', 'Profissional atualizado com sucesso.');
    }

    public function destroy(User $professional): RedirectResponse
    {
        Gate::authorize('delete', $professional);

        $professional->update(['is_active' => false]);

        return to_route('professionals.index')
            ->with('success', 'Profissional desativado com sucesso.');
    }

}
