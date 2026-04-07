<?php

namespace Database\Factories;

use App\Enums\TreatmentPlanStatus;
use App\Models\TreatmentPlan;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TreatmentPlan>
 */
class TreatmentPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'professional_id' => User::factory()->professional(),
            'diagnosis' => fake()->sentence(),
            'goals' => fake()->paragraph(),
            'observations' => fake()->optional()->paragraph(),
            'started_at' => now()->toDateString(),
            'expires_at' => now()->addMonths(3)->toDateString(),
            'status' => TreatmentPlanStatus::Active->value,
        ];
    }
}
