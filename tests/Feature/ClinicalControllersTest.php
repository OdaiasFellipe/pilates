<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Evaluation;
use App\Models\Patient;
use App\Models\Session;
use App\Models\TreatmentPlan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicalControllersTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function professional(): User
    {
        return User::factory()->professional()->create();
    }

    public function test_admin_can_open_create_evaluation_form(): void
    {
        $this->actingAs($this->admin())
            ->get(route('clinical.evaluations.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('clinical/evaluations/create'));
    }

    public function test_professional_creates_evaluation_with_own_professional_id(): void
    {
        $professional = $this->professional();
        $otherProfessional = $this->professional();
        $patient = Patient::factory()->create();

        $this->actingAs($professional)
            ->post(route('clinical.evaluations.store'), [
                'patient_id' => $patient->id,
                'professional_id' => $otherProfessional->id,
                'chief_complaint' => 'Dor lombar ao ficar sentado.',
                'medical_history' => 'Sem cirurgia previa.',
                'physical_exam' => [
                    'posture' => 'Anteversao pelvica leve',
                ],
                'evaluated_at' => now()->toDateTimeString(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('evaluations', [
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);
    }

    public function test_professional_cannot_view_other_professional_evaluation(): void
    {
        $professional = $this->professional();
        $otherProfessional = $this->professional();
        $evaluation = Evaluation::factory()->create(['professional_id' => $otherProfessional->id]);

        $this->actingAs($professional)
            ->get(route('clinical.evaluations.show', $evaluation))
            ->assertForbidden();
    }

    public function test_admin_can_create_treatment_plan(): void
    {
        $admin = $this->admin();
        $professional = $this->professional();
        $patient = Patient::factory()->create();

        $this->actingAs($admin)
            ->post(route('clinical.treatment-plans.store'), [
                'patient_id' => $patient->id,
                'professional_id' => $professional->id,
                'diagnosis' => 'Lombalgia mecanica',
                'goals' => 'Reduzir dor e melhorar estabilidade de core',
                'started_at' => now()->toDateString(),
                'status' => 'active',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('treatment_plans', [
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'status' => 'active',
        ]);
    }

    public function test_professional_can_create_session_from_own_appointment(): void
    {
        $professional = $this->professional();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'starts_at' => CarbonImmutable::now()->subHour(),
            'ends_at' => CarbonImmutable::now()->subMinutes(10),
        ]);

        $this->actingAs($professional)
            ->post(route('clinical.sessions.store'), [
                'appointment_id' => $appointment->id,
                'evolution_notes' => 'Paciente evoluiu bem no controle motor.',
                'soap_note' => [
                    'subjective' => 'Menor dor ao levantar.',
                    'objective' => 'Melhor alinhamento lombo-pelvico.',
                ],
                'exercises' => ['Ponte', 'Dead bug'],
                'pain_scale' => 2,
                'attended_at' => now()->toDateTimeString(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('clinical_sessions', [
            'appointment_id' => $appointment->id,
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
        ]);
    }

    public function test_cannot_create_duplicate_session_for_same_appointment(): void
    {
        $professional = $this->professional();
        $patient = Patient::factory()->create();
        $appointment = Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        Session::factory()->create([
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        $this->actingAs($professional)
            ->post(route('clinical.sessions.store'), [
                'appointment_id' => $appointment->id,
                'evolution_notes' => 'Nova evolucao indevida',
                'attended_at' => now()->toDateTimeString(),
            ])
            ->assertSessionHasErrors('appointment_id');
    }
}
