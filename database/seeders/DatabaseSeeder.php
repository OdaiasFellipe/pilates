<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin padrão
        User::factory()->admin()->create([
            'name' => 'Administrador',
            'email' => 'admin@pilates.com',
            'password' => Hash::make('password'),
        ]);

        // Profissionais de exemplo
        User::factory()->professional()->create([
            'name' => 'Dra. Ana Costa',
            'email' => 'ana@pilates.com',
            'specialty' => 'Fisioterapia e Pilates',
            'password' => Hash::make('password'),
        ]);

        User::factory()->professional()->create([
            'name' => 'Dr. Bruno Lima',
            'email' => 'bruno@pilates.com',
            'specialty' => 'Pilates',
            'password' => Hash::make('password'),
        ]);

        // Recepcionista
        User::factory()->create([
            'name' => 'Recepção',
            'email' => 'recepcao@pilates.com',
            'role' => UserRole::Receptionist->value,
            'password' => Hash::make('password'),
        ]);

        // Pacientes de exemplo
        Patient::factory(20)->create();
    }
}
