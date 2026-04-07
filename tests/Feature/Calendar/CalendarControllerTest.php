<?php

namespace Tests\Feature\Calendar;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_calendar(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $now = now();
        Appointment::factory()->count(3)->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'starts_at' => $now->copy()->addHours(1),
            'ends_at' => $now->copy()->addHours(2),
        ]);

        $response = $this->actingAs($user)->get(route('calendar.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Calendar/Index')
            ->has('appointments', 3)
        );
    }

    public function test_professional_can_view_calendar_with_filter(): void
    {
        $professional = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $now = now();
        Appointment::factory()->create([
            'patient_id' => $patient->id,
            'professional_id' => $professional->id,
            'starts_at' => $now->copy()->addHours(1),
            'ends_at' => $now->copy()->addHours(2),
        ]);

        $response = $this->actingAs($professional)->get(route('calendar.index'));

        $response->assertOk();
    }

    public function test_calendar_filters_by_professional(): void
    {
        /** @var User $admin */
        $admin = User::factory()->admin()->create();

        $prof1 = User::factory()->professional()->create();
        $prof2 = User::factory()->professional()->create();
        $patient = Patient::factory()->create();

        $now = now();
        Appointment::factory()->create([
            'professional_id' => $prof1->id,
            'patient_id' => $patient->id,
            'starts_at' => $now->copy()->addHours(1),
            'ends_at' => $now->copy()->addHours(2),
        ]);

        Appointment::factory()->create([
            'professional_id' => $prof2->id,
            'patient_id' => $patient->id,
            'starts_at' => $now->copy()->addHours(3),
            'ends_at' => $now->copy()->addHours(4),
        ]);

        $response = $this->actingAs($admin)->get(route('calendar.index', ['professional_id' => $prof1->id]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('selectedProfessionalId', $prof1->id)
        );
    }

    public function test_calendar_supports_different_views(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        foreach (['day', 'week', 'month'] as $view) {
            $response = $this->actingAs($user)->get(route('calendar.index', ['view' => $view]));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page->where('view', $view));
        }
    }

    public function test_guest_is_redirected_from_calendar(): void
    {
        $response = $this->get(route('calendar.index'));

        $response->assertRedirect(route('login'));
    }
}
