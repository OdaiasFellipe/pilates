<?php

namespace Database\Factories;

use App\Enums\PatientPackageStatus;
use App\Models\Package;
use App\Models\Patient;
use App\Models\PatientPackage;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PatientPackage>
 */
class PatientPackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $starts = CarbonImmutable::now()->subDays(fake()->numberBetween(0, 30));
        $sessionsTotal = fake()->randomElement([10, 20, 30]);

        return [
            'patient_id' => Patient::factory(),
            'package_id' => Package::factory(),
            'professional_id' => User::factory()->professional(),
            'starts_at' => $starts,
            'expires_at' => $starts->addDays(90),
            'sessions_used' => 0,
            'sessions_total' => $sessionsTotal,
            'status' => PatientPackageStatus::Active,
            'paid_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(['paid_at' => now()]);
    }

    public function expired(): static
    {
        return $this->state([
            'status' => PatientPackageStatus::Expired,
            'expires_at' => now()->subDay(),
        ]);
    }
}
