<?php

namespace Tests\Feature\Financial;

use App\Enums\PaymentMethod;
use App\Enums\UserRole;
use App\Models\Package;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancialControllersTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_package(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post(route('financial.packages.store'), [
            'name' => 'Pacote Intensivo',
            'description' => 'Plano para 20 sessoes',
            'session_count' => 20,
            'price' => 899.90,
            'validity_days' => 120,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('packages', [
            'name' => 'Pacote Intensivo',
            'session_count' => 20,
            'validity_days' => 120,
            'is_active' => true,
        ]);
    }

    public function test_receptionist_cannot_create_package(): void
    {
        /** @var User $receptionist */
        $receptionist = User::factory()->create([
            'role' => UserRole::Receptionist,
        ]);

        $response = $this->actingAs($receptionist)->post(route('financial.packages.store'), [
            'name' => 'Pacote Bloqueado',
            'session_count' => 10,
            'price' => 400,
            'validity_days' => 90,
            'is_active' => true,
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('packages', [
            'name' => 'Pacote Bloqueado',
        ]);
    }

    public function test_receptionist_can_view_payments_index(): void
    {
        /** @var User $receptionist */
        $receptionist = User::factory()->create([
            'role' => UserRole::Receptionist,
        ]);

        Payment::factory()->count(3)->create();

        $response = $this->actingAs($receptionist)->get(route('financial.payments.index'));

        $response->assertOk();
    }

    public function test_professional_can_view_payments_index(): void
    {
        $professional = User::factory()->professional()->create();

        $response = $this->actingAs($professional)->get(route('financial.payments.index'));

        $response->assertOk();
    }

    public function test_receptionist_can_store_payment(): void
    {
        /** @var User $receptionist */
        $receptionist = User::factory()->create([
            'role' => UserRole::Receptionist,
        ]);

        $patient = Patient::factory()->create();

        $response = $this->actingAs($receptionist)->post(route('financial.payments.store'), [
            'patient_id' => $patient->id,
            'amount' => 250.50,
            'payment_method' => PaymentMethod::Pix->value,
            'paid_at' => now()->format('Y-m-d H:i:s'),
            'notes' => 'Pagamento parcial',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('payments', [
            'patient_id' => $patient->id,
            'amount' => 250.50,
            'payment_method' => PaymentMethod::Pix->value,
        ]);
    }

    public function test_guest_is_redirected_from_financial_routes(): void
    {
        Package::factory()->create();

        $response = $this->get(route('financial.packages.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_view_financial_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        Payment::factory()->paid()->count(3)->create();
        Payment::factory()->create();
        Package::factory()->count(2)->create();

        $response = $this->actingAs($admin)->get(route('financial.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Financial/Dashboard')
            ->where('activePackages', 2)
        );
    }

    public function test_receptionist_can_view_financial_dashboard(): void
    {
        /** @var User $receptionist */
        $receptionist = User::factory()->create([
            'role' => UserRole::Receptionist,
        ]);

        Payment::factory()->count(2)->create();

        $response = $this->actingAs($receptionist)->get(route('financial.dashboard'));

        $response->assertOk();
    }
}
