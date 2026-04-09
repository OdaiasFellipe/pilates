<?php

namespace Tests\Feature\CheckIn;

use App\Enums\AppointmentStatus;
use App\Enums\PatientPackageStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\PatientPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckInTest extends TestCase
{
    use RefreshDatabase;

    /* ─── Index ─── */

    public function test_admin_can_view_checkin_page(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->count(3)->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $response = $this->actingAs($admin)->get(route('checkin.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('checkin/index')
            ->has('appointments', 3)
            ->has('date')
        );
    }

    public function test_professional_sees_only_own_appointments(): void
    {
        $prof1 = User::factory()->professional()->create();
        $prof2 = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->create([
            'professional_id' => $prof1->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        Appointment::factory()->create([
            'professional_id' => $prof2->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(14, 0),
            'ends_at' => now()->setTime(15, 0),
        ]);

        $response = $this->actingAs($prof1)->get(route('checkin.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('appointments', 1)
        );
    }

    public function test_checkin_page_filters_by_period(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(9, 0),
            'ends_at' => now()->setTime(10, 0),
        ]);

        Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(15, 0),
            'ends_at' => now()->setTime(16, 0),
        ]);

        $response = $this->actingAs($admin)->get(route('checkin.index', ['period' => 'morning']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('appointments', 1)
        );
    }

    public function test_checkin_page_filters_by_search(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient1 = Patient::factory()->create(['name' => 'Maria Silva']);
        $patient2 = Patient::factory()->create(['name' => 'João Santos']);

        Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient1->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient2->id,
            'starts_at' => now()->setTime(14, 0),
            'ends_at' => now()->setTime(15, 0),
        ]);

        $response = $this->actingAs($admin)->get(route('checkin.index', ['search' => 'Maria']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('appointments', 1)
        );
    }

    public function test_cancelled_appointments_are_excluded(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
            'status' => AppointmentStatus::Cancelled,
        ]);

        $response = $this->actingAs($admin)->get(route('checkin.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('appointments', 0)
        );
    }

    /* ─── Check-In ─── */

    public function test_check_in_marks_appointment_completed(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
            'status' => AppointmentStatus::Scheduled,
        ]);

        $response = $this->actingAs($admin)->post(route('checkin.checkIn', $appointment));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Check-in realizado com sucesso.');

        $appointment->refresh();
        $this->assertEquals(AppointmentStatus::Completed, $appointment->status);
        $this->assertNotNull($appointment->checked_in_at);
    }

    public function test_check_in_creates_session_record(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $this->actingAs($admin)->post(route('checkin.checkIn', $appointment));

        $this->assertDatabaseHas('clinical_sessions', [
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
        ]);
    }

    public function test_check_in_consumes_package_session(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $patientPackage = PatientPackage::factory()->create([
            'patient_id' => $patient->id,
            'sessions_used' => 5,
            'sessions_total' => 10,
            'status' => PatientPackageStatus::Active,
        ]);

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $response = $this->actingAs($admin)->post(route('checkin.checkIn', $appointment));

        $response->assertRedirect();
        $response->assertSessionHas('sessions_remaining', 4);

        $patientPackage->refresh();
        $this->assertEquals(6, $patientPackage->sessions_used);
    }

    public function test_check_in_alerts_when_package_near_depleted(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        PatientPackage::factory()->create([
            'patient_id' => $patient->id,
            'sessions_used' => 8,
            'sessions_total' => 10,
            'status' => PatientPackageStatus::Active,
        ]);

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $response = $this->actingAs($admin)->post(route('checkin.checkIn', $appointment));

        $response->assertRedirect();
        $response->assertSessionHas('sessions_remaining', 1);
        $response->assertSessionHas('package_alert', true);
    }

    public function test_check_in_completes_package_when_last_session(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $patientPackage = PatientPackage::factory()->create([
            'patient_id' => $patient->id,
            'sessions_used' => 9,
            'sessions_total' => 10,
            'status' => PatientPackageStatus::Active,
        ]);

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $this->actingAs($admin)->post(route('checkin.checkIn', $appointment));

        $patientPackage->refresh();
        $this->assertEquals(10, $patientPackage->sessions_used);
        $this->assertEquals(PatientPackageStatus::Completed, $patientPackage->status);
    }

    public function test_duplicate_check_in_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
            'checked_in_at' => now(),
            'status' => AppointmentStatus::Completed,
        ]);

        $response = $this->actingAs($admin)->post(route('checkin.checkIn', $appointment));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Paciente já realizou check-in.');
    }

    /* ─── No Show ─── */

    public function test_no_show_marks_appointment_missed(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $response = $this->actingAs($admin)->post(route('checkin.noShow', $appointment));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Falta registrada.');

        $appointment->refresh();
        $this->assertEquals(AppointmentStatus::Missed, $appointment->status);
    }

    public function test_no_show_does_not_consume_package_session(): void
    {
        $admin = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $patientPackage = PatientPackage::factory()->create([
            'patient_id' => $patient->id,
            'sessions_used' => 5,
            'sessions_total' => 10,
            'status' => PatientPackageStatus::Active,
        ]);

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $this->actingAs($admin)->post(route('checkin.noShow', $appointment));

        $patientPackage->refresh();
        $this->assertEquals(5, $patientPackage->sessions_used);
    }

    /* ─── Authorization ─── */

    public function test_professional_can_check_in_own_appointment(): void
    {
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $professional->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $response = $this->actingAs($professional)->post(route('checkin.checkIn', $appointment));

        $response->assertRedirect();
    }

    public function test_professional_cannot_check_in_other_appointment(): void
    {
        $prof1 = User::factory()->professional()->create();
        $prof2 = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $appointment = Appointment::factory()->create([
            'professional_id' => $prof1->id,
            'patient_id' => $patient->id,
            'starts_at' => now()->setTime(10, 0),
            'ends_at' => now()->setTime(11, 0),
        ]);

        $response = $this->actingAs($prof2)->post(route('checkin.checkIn', $appointment));

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_checkin(): void
    {
        $response = $this->get(route('checkin.index'));

        $response->assertRedirect('/login');
    }
}
