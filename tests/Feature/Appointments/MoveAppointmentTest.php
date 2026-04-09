<?php

namespace Tests\Feature\Appointments;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MoveAppointmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_move_appointment(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->addDay()->setTime(10, 0),
            'ends_at' => now()->addDay()->setTime(11, 0),
        ]);

        $newStart = now()->addDay()->setTime(14, 0)->toISOString();

        $response = $this->actingAs($admin)->patchJson(
            route('appointments.move', $appointment),
            ['starts_at' => $newStart]
        );

        $response->assertOk();
        $response->assertJson(['message' => 'Agendamento movido com sucesso.']);

        $appointment->refresh();
        $this->assertEquals(14, $appointment->starts_at->hour);
        $this->assertEquals(15, $appointment->ends_at->hour);
    }

    public function test_move_preserves_appointment_duration(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->addDay()->setTime(9, 0),
            'ends_at' => now()->addDay()->setTime(9, 45),
        ]);

        $newStart = now()->addDays(2)->setTime(16, 0)->toISOString();

        $this->actingAs($admin)->patchJson(
            route('appointments.move', $appointment),
            ['starts_at' => $newStart]
        )->assertOk();

        $appointment->refresh();
        $this->assertEquals(45, $appointment->starts_at->diffInMinutes($appointment->ends_at));
    }

    public function test_move_detects_professional_conflict(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient1 = Patient::factory()->create();
        $patient2 = Patient::factory()->create();

        // Existing appointment at 14:00-15:00
        Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient1->id,
            'starts_at' => now()->addDay()->setTime(14, 0),
            'ends_at' => now()->addDay()->setTime(15, 0),
            'status' => AppointmentStatus::Scheduled,
        ]);

        // Appointment to move
        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient2->id,
            'starts_at' => now()->addDay()->setTime(10, 0),
            'ends_at' => now()->addDay()->setTime(11, 0),
        ]);

        // Try to move to conflicting time
        $response = $this->actingAs($admin)->patchJson(
            route('appointments.move', $appointment),
            ['starts_at' => now()->addDay()->setTime(14, 30)->toISOString()]
        );

        $response->assertUnprocessable();
        $response->assertJson(['message' => 'Conflito de horário detectado.']);

        // Ensure original times unchanged
        $appointment->refresh();
        $this->assertEquals(10, $appointment->starts_at->hour);
    }

    public function test_professional_can_move_own_appointment(): void
    {
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->addDay()->setTime(10, 0),
            'ends_at' => now()->addDay()->setTime(11, 0),
        ]);

        $response = $this->actingAs($professional)->patchJson(
            route('appointments.move', $appointment),
            ['starts_at' => now()->addDay()->setTime(16, 0)->toISOString()]
        );

        $response->assertOk();
    }

    public function test_professional_cannot_move_others_appointment(): void
    {
        $prof1 = User::factory()->professional()->create();
        $prof2 = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $prof1->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->addDay()->setTime(10, 0),
            'ends_at' => now()->addDay()->setTime(11, 0),
        ]);

        $response = $this->actingAs($prof2)->patchJson(
            route('appointments.move', $appointment),
            ['starts_at' => now()->addDay()->setTime(14, 0)->toISOString()]
        );

        $response->assertForbidden();
    }

    public function test_move_requires_starts_at(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->addDay()->setTime(10, 0),
            'ends_at' => now()->addDay()->setTime(11, 0),
        ]);

        $response = $this->actingAs($admin)->patchJson(
            route('appointments.move', $appointment),
            []
        );

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('starts_at');
    }

    public function test_unauthenticated_user_cannot_move_appointment(): void
    {
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->addDay()->setTime(10, 0),
            'ends_at' => now()->addDay()->setTime(11, 0),
        ]);

        $response = $this->patchJson(
            route('appointments.move', $appointment),
            ['starts_at' => now()->addDay()->setTime(14, 0)->toISOString()]
        );

        $response->assertUnauthorized();
    }
}
