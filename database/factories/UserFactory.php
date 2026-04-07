<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => UserRole::Receptionist->value,
            'cpf' => null,
            'phone' => fake()->numerify('(##) #####-####'),
            'specialty' => null,
            'working_hours' => null,
            'is_active' => true,
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Set the user as admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Admin->value,
        ]);
    }

    /**
     * Set the user as a professional.
     */
    public function professional(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::Professional->value,
            'specialty' => fake()->randomElement(['Fisioterapia', 'Pilates', 'Pilates e Fisioterapia']),
            'working_hours' => [
                ['day' => 1, 'slots' => [['start' => '08:00', 'end' => '18:00']]],
                ['day' => 2, 'slots' => [['start' => '08:00', 'end' => '18:00']]],
                ['day' => 3, 'slots' => [['start' => '08:00', 'end' => '18:00']]],
                ['day' => 4, 'slots' => [['start' => '08:00', 'end' => '18:00']]],
                ['day' => 5, 'slots' => [['start' => '08:00', 'end' => '17:00']]],
            ],
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }
}
