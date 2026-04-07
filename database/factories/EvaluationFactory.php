<?php

namespace Database\Factories;

use App\Models\Evaluation;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Evaluation>
 */
class EvaluationFactory extends Factory
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
            'chief_complaint' => fake()->sentence(),
            'medical_history' => fake()->paragraph(),
            'physical_exam' => [
                'posture' => fake()->sentence(3),
                'mobility' => fake()->sentence(3),
            ],
            'diagnosis' => fake()->sentence(),
            'goals' => fake()->paragraph(),
            'evaluated_at' => now(),
        ];
    }
}
