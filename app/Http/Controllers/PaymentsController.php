<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Http\Requests\Financial\StorePaymentRequest;
use App\Models\Patient;
use App\Models\PatientPackage;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PaymentsController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Payment::class);

        $payments = Payment::query()
            ->with(['patient:id,name', 'patientPackage:id,patient_id'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Financial/Payments/Index', [
            'payments' => $payments,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Payment::class);

        return Inertia::render('Financial/Payments/Create', [
            'patients' => Patient::query()->active()->orderBy('name')->get(['id', 'name']),
            'patientPackages' => PatientPackage::query()
                ->where('status', 'active')
                ->with(['patient:id,name'])
                ->orderByDesc('created_at')
                ->get(['id', 'patient_id']),
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $status = isset($data['paid_at']) ? PaymentStatus::Paid : PaymentStatus::Pending;
        $paidAt = isset($data['paid_at']) ? Carbon::parse($data['paid_at']) : null;

        $payment = Payment::create([
            ...$data,
            'status' => $status,
            'paid_at' => $paidAt,
        ]);

        return to_route('financial.payments.show', $payment)
            ->with('success', 'Pagamento registrado com sucesso.');
    }

    public function show(Payment $payment): Response
    {
        Gate::authorize('view', $payment);

        $payment->load(['patient:id,name', 'patientPackage:id,patient_id,package_id']);

        return Inertia::render('Financial/Payments/Show', [
            'payment' => $payment,
        ]);
    }
}
