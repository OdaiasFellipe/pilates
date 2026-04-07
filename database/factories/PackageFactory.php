<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Package>
 */
class PackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sessions = fake()->randomElement([10, 20, 30]);

        return [
            'name' => fake()->randomElement(['Pacote Básico', 'Pacote Mensal', 'Pacote Trimestral', 'Pacote Semestral']) . " {$sessions} sessões",
            'description' => fake()->optional()->sentence(),
            'session_count' => $sessions,
            'price' => fake()->randomFloat(2, 200, 2000),
            'validity_days' => fake()->randomElement([30, 60, 90, 180]),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
