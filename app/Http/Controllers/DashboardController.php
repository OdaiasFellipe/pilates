<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Enums\PaymentStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $today = now()->toDateString();

        $appointmentsQuery = Appointment::query();

        if ($user->isProfessional()) {
            $appointmentsQuery->where('professional_id', $user->id);
        }

        $todayAppointments = (clone $appointmentsQuery)
            ->with(['patient:id,name', 'professional:id,name'])
            ->whereDate('starts_at', $today)
            ->orderBy('starts_at')
            ->get(['id', 'patient_id', 'professional_id', 'starts_at', 'ends_at', 'type', 'status']);

        $stats = [
            'active_patients' => Patient::where('is_active', true)->count(),
            'today_appointments' => $todayAppointments->count(),
            'today_confirmed' => $todayAppointments->where('status', AppointmentStatus::Confirmed)->count(),
            'monthly_revenue' => Payment::query()
                ->where('status', PaymentStatus::Paid)
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('amount'),
            'pending_payments' => Payment::query()
                ->where('status', PaymentStatus::Pending)
                ->sum('amount'),
        ];

        $upcomingAppointments = (clone $appointmentsQuery)
            ->with(['patient:id,name', 'professional:id,name'])
            ->where('starts_at', '>', now())
            ->whereIn('status', [AppointmentStatus::Scheduled->value, AppointmentStatus::Confirmed->value])
            ->orderBy('starts_at')
            ->limit(5)
            ->get(['id', 'patient_id', 'professional_id', 'starts_at', 'type', 'status']);

        $recentPatients = Patient::query()
            ->where('is_active', true)
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'phone', 'created_at']);

        $notifications = $user->notifications()
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notificação',
                'message' => $notification->data['message'] ?? null,
                'url' => $notification->data['url'] ?? null,
                'severity' => $notification->data['severity'] ?? 'info',
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
            ]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'todayAppointments' => $todayAppointments,
            'upcomingAppointments' => $upcomingAppointments,
            'recentPatients' => $recentPatients,
            'notifications' => $notifications,
        ]);
    }
}
