<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Payment;
use App\Models\Session;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceReportsController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Payment::class);

        $startDate = now()->subMonths(3);
        $endDate = now();

        $revenueByProfessional = $this->getRevenueByProfessional($startDate, $endDate);
        $attendanceStats = $this->getAttendanceStats($startDate, $endDate);
        $appointmentsTrend = $this->getAppointmentsTrend($startDate, $endDate);

        return Inertia::render('Reports/Performance/Index', [
            'revenueByProfessional' => $revenueByProfessional,
            'attendanceStats' => $attendanceStats,
            'appointmentsTrend' => $appointmentsTrend,
            'period' => [
                'from' => $startDate->format('Y-m-d'),
                'to' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    private function getRevenueByProfessional($startDate, $endDate): Collection
    {
        return Payment::query()
            ->join('patient_packages', 'payments.patient_package_id', '=', 'patient_packages.id')
            ->join('users', 'patient_packages.professional_id', '=', 'users.id')
            ->whereBetween('payments.created_at', [$startDate, $endDate])
            ->where('payments.status', 'paid')
            ->groupBy('users.id', 'users.name')
            ->selectRaw('users.id, users.name, SUM(payments.amount) as total, COUNT(payments.id) as count')
            ->orderByDesc('total')
            ->get();
    }

    private function getAttendanceStats($startDate, $endDate): array
    {
        $total = Appointment::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $attended = Session::query()
            ->whereBetween('attended_at', [$startDate, $endDate])
            ->count();

        $cancelled = Appointment::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'cancelled')
            ->count();

        return [
            'total' => $total,
            'attended' => $attended,
            'cancelled' => $cancelled,
            'noShow' => $total - $attended - $cancelled,
            'attendanceRate' => $total > 0 ? round(($attended / $total) * 100, 2) : 0,
        ];
    }

    private function getAppointmentsTrend($startDate, $endDate): Collection
    {
        return Appointment::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($item) => [
                'date' => $item->date,
                'count' => $item->count,
            ]);
    }
}
