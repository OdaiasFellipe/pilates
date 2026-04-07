<?php

namespace Database\Factories;

use App\Models\Session;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Session>
 */
class SessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'appointment_id' => Appointment::factory(),
            'patient_id' => Patient::factory(),
            'professional_id' => User::factory()->professional(),
            'treatment_plan_id' => TreatmentPlan::factory(),
            'evolution_notes' => fake()->paragraph(),
            'soap_note' => [
                'subjective' => fake()->sentence(),
                'objective' => fake()->sentence(),
                'assessment' => fake()->sentence(),
                'plan' => fake()->sentence(),
            ],
            'exercises' => [fake()->words(3, true), fake()->words(2, true)],
            'pain_scale' => fake()->numberBetween(0, 10),
            'attended_at' => now(),
        ];
    }
}
