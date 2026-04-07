<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientsControllerTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function professional(): User
    {
        return User::factory()->professional()->create();
    }

    private function receptionist(): User
    {
        return User::factory()->create(['role' => UserRole::Receptionist->value]);
    }

    // ─── INDEX ───────────────────────────────────────────────────────────────

    public function test_guests_cannot_view_patients_list(): void
    {
        $this->get(route('patients.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_patients_list(): void
    {
        $this->actingAs($this->admin())
            ->get(route('patients.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('patients/index'));
    }

    public function test_patients_list_can_be_filtered_by_search(): void
    {
        Patient::factory()->create(['name' => 'Ana Paula']);
        Patient::factory()->create(['name' => 'Carlos Silva']);

        $this->actingAs($this->admin())
            ->get(route('patients.index', ['search' => 'Ana']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('patients/index')
                ->has('patients.data', 1)
                ->where('patients.data.0.name', 'Ana Paula')
            );
    }

    public function test_patients_list_can_be_filtered_by_active_status(): void
    {
        Patient::factory()->create(['is_active' => true]);
        Patient::factory()->inactive()->create();

        $this->actingAs($this->admin())
            ->get(route('patients.index', ['status' => 'active']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('patients.data', 1));
    }

    // ─── SHOW ─────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_patient(): void
    {
        $patient = Patient::factory()->create();

        $this->actingAs($this->admin())
            ->get(route('patients.show', $patient))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('patients/show')
                ->where('patient.id', $patient->id)
            );
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────

    public function test_admin_can_view_create_patient_form(): void
    {
        $this->actingAs($this->admin())
            ->get(route('patients.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('patients/create'));
    }

    // ─── STORE ────────────────────────────────────────────────────────────────

    public function test_admin_can_create_patient(): void
    {
        $this->actingAs($this->admin())
            ->post(route('patients.store'), [
                'name' => 'Maria Souza',
                'phone' => '(11) 99999-1234',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('patients', ['name' => 'Maria Souza']);
    }

    public function test_professional_can_create_patient(): void
    {
        $this->actingAs($this->professional())
            ->post(route('patients.store'), ['name' => 'João Costa'])
            ->assertRedirect();

        $this->assertDatabaseHas('patients', ['name' => 'João Costa']);
    }

    public function test_store_requires_name(): void
    {
        $this->actingAs($this->admin())
            ->post(route('patients.store'), [])
            ->assertSessionHasErrors('name');
    }

    public function test_store_rejects_duplicate_cpf(): void
    {
        Patient::factory()->create(['cpf' => '123.456.789-00']);

        $this->actingAs($this->admin())
            ->post(route('patients.store'), [
                'name' => 'Novo Paciente',
                'cpf' => '123.456.789-00',
            ])
            ->assertSessionHasErrors('cpf');
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    public function test_admin_can_update_patient(): void
    {
        $patient = Patient::factory()->create(['name' => 'Antigo Nome']);

        $this->actingAs($this->admin())
            ->put(route('patients.update', $patient), [
                'name' => 'Novo Nome',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('patients', ['id' => $patient->id, 'name' => 'Novo Nome']);
    }

    public function test_update_allows_same_cpf_for_same_patient(): void
    {
        $patient = Patient::factory()->create(['cpf' => '111.222.333-44']);

        $this->actingAs($this->admin())
            ->put(route('patients.update', $patient), [
                'name' => $patient->name,
                'cpf' => '111.222.333-44',
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
    }

    // ─── DESTROY ─────────────────────────────────────────────────────────────

    public function test_admin_can_delete_patient(): void
    {
        $patient = Patient::factory()->create();

        $this->actingAs($this->admin())
            ->delete(route('patients.destroy', $patient))
            ->assertRedirect(route('patients.index'));

        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
    }

    public function test_receptionist_cannot_delete_patient(): void
    {
        $patient = Patient::factory()->create();

        $this->actingAs($this->receptionist())
            ->delete(route('patients.destroy', $patient))
            ->assertForbidden();
    }
}
