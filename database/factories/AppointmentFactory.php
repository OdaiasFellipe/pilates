<?php

namespace Database\Factories;

use App\Enums\AppointmentStatus;
use App\Enums\AppointmentType;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = CarbonImmutable::instance(fake()->dateTimeBetween('+1 day', '+30 days'))
            ->setTime((int) fake()->randomElement([7, 8, 9, 10, 14, 15, 16, 17]), 0);

        return [
            'patient_id' => Patient::factory(),
            'professional_id' => User::factory()->professional(),
            'starts_at' => $start,
            'ends_at' => $start->addMinutes(50),
            'type' => fake()->randomElement(AppointmentType::cases())->value,
            'status' => AppointmentStatus::Scheduled->value,
            'notes' => fake()->optional()->sentence(),
            'cancellation_reason' => null,
            'reminder_sent_at' => null,
        ];
    }
}
