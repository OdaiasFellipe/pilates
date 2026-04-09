<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientShowEnhancedTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_show_includes_all_related_data(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->count(2)->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        Evaluation::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        Document::factory()->count(2)->for($patient)->create();

        $response = $this->actingAs($admin)->get("/patients/{$patient->id}");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('patients/show')
                ->has('patient.appointments', 2)
                ->has('patient.evaluations', 1)
                ->has('patient.documents', 2)
        );
    }

    public function test_patient_show_appointments_include_professional(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);

        $response = $this->actingAs($admin)->get("/patients/{$patient->id}");

        $response->assertInertia(
            fn ($page) => $page->has('patient.appointments.0.professional')
        );
    }

    public function test_patient_show_documents_include_uploader(): void
    {
        $admin = User::factory()->admin()->create();
        $patient = Patient::factory()->create();
        Document::factory()->for($patient)->create(['uploaded_by_id' => $admin->id]);

        $response = $this->actingAs($admin)->get("/patients/{$patient->id}");

        $response->assertInertia(
            fn ($page) => $page->has('patient.documents.0.uploaded_by')
        );
    }
}
