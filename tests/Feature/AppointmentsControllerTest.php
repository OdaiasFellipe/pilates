<?php

namespace Tests\Feature;

use App\Enums\AppointmentStatus;
use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentsControllerTest extends TestCase
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

    private function receptionist(): User
    {
        return User::factory()->create(['role' => UserRole::Receptionist->value]);
    }

    public function test_guests_cannot_view_appointments_list(): void
    {
        $this->get(route('appointments.index'))->assertRedirect(route('login'));
    }

    public function test_admin_can_view_appointments_list(): void
    {
        $this->actingAs($this->admin())
            ->get(route('appointments.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('appointments/index'));
    }

    public function test_professional_sees_only_own_appointments(): void
    {
        $professional = $this->professional();
        $otherProfessional = $this->professional();

        Appointment::factory()->create(['professional_id' => $professional->id]);
        Appointment::factory()->create(['professional_id' => $otherProfessional->id]);

        $this->actingAs($professional)
            ->get(route('appointments.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('appointments.data', 1));
    }

    public function test_admin_can_create_appointment_with_default_duration(): void
    {
        $admin = $this->admin();
        $patient = Patient::factory()->create();
        $professional = $this->professional();

        $startsAt = CarbonImmutable::now()->addDay()->setTime(10, 0);

        $this->actingAs($admin)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'professional_id' => $professional->id,
                'starts_at' => $startsAt->toDateTimeString(),
                'type' => 'pilates',
            ])
            ->assertRedirect();

        $appointment = Appointment::query()->firstOrFail();

        $this->assertEquals(
            $startsAt->addMinutes(50)->toDateTimeString(),
            $appointment->ends_at->format('Y-m-d H:i:s'),
        );
    }

    public function test_cannot_create_when_professional_has_time_conflict(): void
    {
        $admin = $this->admin();
        $patient = Patient::factory()->create();
        $otherPatient = Patient::factory()->create();
        $professional = $this->professional();

        $startsAt = CarbonImmutable::now()->addDay()->setTime(9, 0);

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->addMinutes(50),
        ]);

        $this->actingAs($admin)
            ->post(route('appointments.store'), [
                'patient_id' => $otherPatient->id,
                'professional_id' => $professional->id,
                'starts_at' => $startsAt->addMinutes(20)->toDateTimeString(),
                'ends_at' => $startsAt->addMinutes(70)->toDateTimeString(),
                'type' => 'pilates',
            ])
            ->assertSessionHasErrors('starts_at');
    }

    public function test_cannot_create_when_patient_has_time_conflict(): void
    {
        $admin = $this->admin();
        $patient = Patient::factory()->create();
        $professionalOne = $this->professional();
        $professionalTwo = $this->professional();

        $startsAt = CarbonImmutable::now()->addDay()->setTime(15, 0);

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professionalOne->id,
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->addMinutes(50),
        ]);

        $this->actingAs($admin)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'professional_id' => $professionalTwo->id,
                'starts_at' => $startsAt->addMinutes(10)->toDateTimeString(),
                'ends_at' => $startsAt->addMinutes(60)->toDateTimeString(),
                'type' => 'pilates',
            ])
            ->assertSessionHasErrors('starts_at');
    }

    public function test_professional_cannot_schedule_for_other_professional(): void
    {
        $professional = $this->professional();
        $otherProfessional = $this->professional();
        $patient = Patient::factory()->create();

        $this->actingAs($professional)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'professional_id' => $otherProfessional->id,
                'starts_at' => CarbonImmutable::now()->addDay()->setTime(12, 0)->toDateTimeString(),
                'type' => 'pilates',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('appointments', [
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
        ]);
    }

    public function test_admin_can_update_appointment(): void
    {
        $admin = $this->admin();
        $appointment = Appointment::factory()->create(['status' => AppointmentStatus::Scheduled]);

        $this->actingAs($admin)
            ->put(route('appointments.update', $appointment), [
                'patient_id' => $appointment->patient_id,
                'professional_id' => $appointment->professional_id,
                'starts_at' => $appointment->starts_at->toDateTimeString(),
                'ends_at' => $appointment->ends_at->toDateTimeString(),
                'type' => $appointment->type->value,
                'status' => AppointmentStatus::Confirmed->value,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => AppointmentStatus::Confirmed->value,
        ]);
    }

    public function test_professional_cannot_view_other_professional_appointment(): void
    {
        $professional = $this->professional();
        $otherProfessional = $this->professional();
        $appointment = Appointment::factory()->create(['professional_id' => $otherProfessional->id]);

        $this->actingAs($professional)
            ->get(route('appointments.show', $appointment))
            ->assertForbidden();
    }

    public function test_receptionist_can_cancel_appointment(): void
    {
        $receptionist = $this->receptionist();
        $appointment = Appointment::factory()->create(['status' => AppointmentStatus::Scheduled]);

        $this->actingAs($receptionist)
            ->delete(route('appointments.destroy', $appointment), [
                'cancellation_reason' => 'Paciente solicitou cancelamento.',
            ])
            ->assertRedirect(route('appointments.index'));

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => AppointmentStatus::Cancelled->value,
            'cancellation_reason' => 'Paciente solicitou cancelamento.',
        ]);
    }
}
