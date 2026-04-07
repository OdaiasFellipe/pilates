<?php

namespace App\Http\Controllers;

use App\Http\Requests\Financial\StorePackageRequest;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PackagesController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Package::class);

        $packages = Package::query()->orderBy('name')->get();

        return Inertia::render('Financial/Packages/Index', [
            'packages' => $packages,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Package::class);

        return Inertia::render('Financial/Packages/Create');
    }

    public function store(StorePackageRequest $request): RedirectResponse
    {
        $package = Package::create($request->validated());

        return to_route('financial.packages.show', $package)
            ->with('success', 'Pacote criado com sucesso.');
    }

    public function show(Package $package): Response
    {
        Gate::authorize('view', $package);

        $package->load('patientPackages.patient:id,name');

        return Inertia::render('Financial/Packages/Show', [
            'package' => $package,
        ]);
    }

    public function edit(Package $package): Response
    {
        Gate::authorize('update', $package);

        return Inertia::render('Financial/Packages/Edit', [
            'package' => $package,
        ]);
    }

    public function update(StorePackageRequest $request, Package $package): RedirectResponse
    {
        $package->update($request->validated());

        return to_route('financial.packages.show', $package)
            ->with('success', 'Pacote atualizado com sucesso.');
    }
}
