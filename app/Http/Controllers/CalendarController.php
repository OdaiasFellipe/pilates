<?php

namespace App\Http\Controllers;

use App\Services\CalendarService;
use App\Models\Appointment;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __construct(private CalendarService $calendarService)
    {
    }

    public function index(Request $request): Response
    {
        $date = $request->query('date') ? Carbon::parse($request->query('date'))->toMutable() : now();
        $view = $request->query('view', 'month');
        $professionalId = $request->query('professional_id');

        Gate::authorize('viewAny', Appointment::class);

        $user = Auth::user();
        if ($user->isProfessional()) {
            $professionalId = $user->id;
        }

        $range = $this->getDateRange($date, $view);

        $appointments = $this->calendarService->getAppointmentsForRange(
            $range['start'],
            $range['end'],
            $professionalId ? (int) $professionalId : null
        )->map(function ($apt) {
            return [
                'id' => $apt->id,
                'title' => "{$apt->patient->name} - {$apt->type->label()}",
                'start' => $apt->starts_at->toIso8601String(),
                'end' => $apt->ends_at->toIso8601String(),
                'status' => $apt->status,
                'professional' => $apt->professional?->name,
                'patient' => $apt->patient?->name,
                'type' => $apt->type,
            ];
        });

        $professionals = User::query()
            ->where('role', 'professional')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Calendar/Index', [
            'appointments' => $appointments,
            'date' => $date->toDateString(),
            'view' => $view,
            'professionals' => $professionals,
            'selectedProfessionalId' => $professionalId ? (int) $professionalId : null,
            'range' => $range,
        ]);
    }

    public function availableSlots(Request $request): array
    {
        $validated = $request->validate([
            'professional_id' => 'required|integer|exists:users,id',
            'date' => 'required|date_format:Y-m-d',
            'duration_minutes' => 'integer|min:15|max:480',
        ]);

        $slots = $this->calendarService->getAvailableSlots(
            $validated['professional_id'],
            $validated['date'],
            $validated['duration_minutes'] ?? 60
        );

        return $slots;
    }

    private function getDateRange(CarbonInterface $date, string $view): array
    {
        return match ($view) {
            'day' => [
                'start' => $date->copy()->startOfDay()->toDateString(),
                'end' => $date->copy()->endOfDay()->toDateString(),
            ],
            'week' => [
                'start' => $date->copy()->startOfWeek()->toDateString(),
                'end' => $date->copy()->endOfWeek()->toDateString(),
            ],
            'month' => [
                'start' => $date->copy()->startOfMonth()->toDateString(),
                'end' => $date->copy()->endOfMonth()->toDateString(),
            ],
            default => [
                'start' => $date->copy()->startOfMonth()->toDateString(),
                'end' => $date->copy()->endOfMonth()->toDateString(),
            ],
        };
    }
}
