<?php

namespace Tests\Feature\Reports;

use App\Models\Appointment;
use App\Models\Evaluation;
use App\Models\Patient;
use App\Models\Session;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportsControllersTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_clinical_reports_index(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        Patient::factory()->count(3)->has(
            Appointment::factory()->count(2),
        )->create();

        $response = $this->actingAs($user)->get(route('reports.clinical.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Reports/Clinical/Index')
            ->has('topPatients', 3)
        );
    }

    public function test_authenticated_user_can_view_patient_progress(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $patient = Patient::factory()->create();
        $professional = User::factory()->professional()->create();

        Evaluation::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        Session::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        $response = $this->actingAs($user)->get(route('reports.clinical.patientProgress', $patient));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Reports/Clinical/PatientProgress')
            ->where('patient.id', $patient->id)
            ->has('attendanceRate')
        );
    }

    public function test_admin_can_view_performance_reports(): void
    {
        $admin = User::factory()->admin()->create();

        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->count(3)->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        Session::factory()->count(2)->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        $response = $this->actingAs($admin)->get(route('reports.performance.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Reports/Performance/Index')
            ->has('attendanceStats')
            ->has('revenueByProfessional')
            ->has('appointmentsTrend')
        );
    }

    public function test_guest_is_redirected_from_reports(): void
    {
        $response = $this->get(route('reports.clinical.index'));

        $response->assertRedirect(route('login'));
    }
}
