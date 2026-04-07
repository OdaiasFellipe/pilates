<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'cpf' => fake()->numerify('###.###.###-##'),
            'rg' => fake()->numerify('#########'),
            'birth_date' => fake()->dateTimeBetween('-70 years', '-18 years')->format('Y-m-d'),
            'phone' => fake()->numerify('(##) #####-####'),
            'email' => fake()->unique()->safeEmail(),
            'address' => [
                'street' => fake()->streetName(),
                'number' => fake()->buildingNumber(),
                'neighborhood' => fake()->word(),
                'city' => fake()->city(),
                'state' => fake()->stateAbbr(),
                'zip' => fake()->numerify('#####-###'),
            ],
            'health_insurance' => fake()->optional()->company(),
            'health_insurance_number' => fake()->optional()->numerify('#########'),
            'emergency_contact' => [
                'name' => fake()->name(),
                'phone' => fake()->numerify('(##) #####-####'),
                'relationship' => fake()->randomElement(['Cônjuge', 'Filho(a)', 'Pai/Mãe', 'Irmão/Irmã']),
            ],
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the patient is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
