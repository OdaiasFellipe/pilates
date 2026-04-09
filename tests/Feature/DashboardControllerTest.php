<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\PendingPaymentNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_renders_for_authenticated_user(): void
    {
        $user = User::factory()->admin()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('dashboard')
                ->has('stats')
                ->has('todayAppointments')
                ->has('upcomingAppointments')
                ->has('recentPatients')
                ->has('notifications')
        );
    }

    public function test_dashboard_stats_include_active_patients(): void
    {
        $user = User::factory()->admin()->create();
        Patient::factory()->count(3)->create(['is_active' => true]);
        Patient::factory()->count(2)->create(['is_active' => false]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertInertia(
            fn ($page) => $page->where('stats.active_patients', 3)
        );
    }

    public function test_dashboard_shows_todays_appointments(): void
    {
        $user = User::factory()->admin()->create();
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'starts_at' => now()->setHour(10)->setMinute(0),
            'ends_at' => now()->setHour(11)->setMinute(0),
            'status' => 'scheduled',
        ]);

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'starts_at' => now()->addDay()->setHour(10),
            'ends_at' => now()->addDay()->setHour(11),
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertInertia(
            fn ($page) => $page->where('stats.today_appointments', 1)
        );
    }

    public function test_professional_only_sees_own_appointments_on_dashboard(): void
    {
        $professional1 = User::factory()->professional()->create();
        $professional2 = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional1->id,
            'starts_at' => now()->setHour(9),
            'ends_at' => now()->setHour(10),
        ]);
        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional2->id,
            'starts_at' => now()->setHour(11),
            'ends_at' => now()->setHour(12),
        ]);

        $response = $this->actingAs($professional1)->get('/dashboard');

        $response->assertInertia(
            fn ($page) => $page->where('stats.today_appointments', 1)
        );
    }

    public function test_dashboard_shows_monthly_revenue(): void
    {
        $user = User::factory()->admin()->create();
        $patient = Patient::factory()->create();

        Payment::factory()->count(2)->create([
            'patient_id' => $patient->id,
            'amount' => '150.00',
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        Payment::factory()->create([
            'patient_id' => $patient->id,
            'amount' => '999.00',
            'status' => 'paid',
            'paid_at' => now()->subMonth(),
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertInertia(
            fn ($page) => $page->where('stats.monthly_revenue', '300.00')
        );
    }

    public function test_dashboard_includes_latest_notifications(): void
    {
        $user = User::factory()->admin()->create();

        $user->notify(new PendingPaymentNotification(2, '500,00', now()->toDateString()));

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertInertia(
            fn ($page) => $page
                ->has('notifications', 1)
                ->where('notifications.0.title', 'Pagamentos pendentes')
        );
    }

    public function test_guest_is_redirected_from_dashboard(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }
}
