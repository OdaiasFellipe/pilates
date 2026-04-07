<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Package;
use App\Models\PatientPackage;
use App\Models\Payment;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FinancialDashboardController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Payment::class);

        $totalRevenue = Payment::query()
            ->where('status', PaymentStatus::Paid->value)
            ->sum('amount');

        $pendingAmount = Payment::query()
            ->where('status', PaymentStatus::Pending->value)
            ->sum('amount');

        $activePatientPackages = PatientPackage::query()
            ->where('status', 'active')
            ->count();

        $activePackages = Package::query()
            ->where('is_active', true)
            ->count();

        $recentPayments = Payment::query()
            ->with(['patient:id,name'])
            ->latest()
            ->limit(10)
            ->get(['id', 'patient_id', 'amount', 'status', 'created_at']);

        return Inertia::render('Financial/Dashboard', [
            'totalRevenue' => $totalRevenue,
            'pendingAmount' => $pendingAmount,
            'activePatientPackages' => $activePatientPackages,
            'activePackages' => $activePackages,
            'recentPayments' => $recentPayments,
        ]);
    }
}
