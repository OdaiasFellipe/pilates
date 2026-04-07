<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Evaluation;
use App\Models\Patient;
use App\Models\Session;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClinicalReportsController extends Controller
{
    public function patientProgress(Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        $evaluations = Evaluation::query()
            ->where('patient_id', $patient->id)
            ->latest()
            ->get(['id', 'chief_complaint', 'diagnosis', 'goals', 'evaluated_at']);

        $sessions = Session::query()
            ->where('patient_id', $patient->id)
            ->with('professional:id,name')
            ->latest()
            ->limit(20)
            ->get(['id', 'professional_id', 'evolution_notes', 'pain_scale', 'attended_at']);

        $attendanceRate = $this->calculateAttendanceRate($patient->id);

        return Inertia::render('Reports/Clinical/PatientProgress', [
            'patient' => $patient,
            'evaluations' => $evaluations,
            'sessions' => $sessions,
            'attendanceRate' => $attendanceRate,
        ]);
    }

    public function index(): Response
    {
        Gate::authorize('viewAny', Patient::class);

        $topPatients = Patient::query()
            ->withCount('appointments')
            ->having('appointments_count', '>', 0)
            ->orderByDesc('appointments_count')
            ->limit(10)
            ->get();

        return Inertia::render('Reports/Clinical/Index', [
            'topPatients' => $topPatients,
        ]);
    }

    private function calculateAttendanceRate(int $patientId): float
    {
        $total = Appointment::query()
            ->where('patient_id', $patientId)
            ->count();

        if ($total === 0) {
            return 0.0;
        }

        $attended = Session::query()
            ->where('patient_id', $patientId)
            ->count();

        return round(($attended / $total) * 100, 2);
    }
}
