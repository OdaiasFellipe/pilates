<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfessionalsControllerTest extends TestCase
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

    public function test_guests_cannot_view_professionals_list(): void
    {
        $this->get(route('professionals.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_professionals_list(): void
    {
        $this->actingAs($this->admin())
            ->get(route('professionals.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('professionals/index'));
    }

    public function test_professionals_list_only_shows_professionals(): void
    {
        User::factory()->professional()->create(['name' => 'Prof Ana']);
        User::factory()->admin()->create(['name' => 'Admin João']);

        $this->actingAs($this->admin())
            ->get(route('professionals.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('professionals/index')
                ->has('professionals.data', 1)
                ->where('professionals.data.0.name', 'Prof Ana')
            );
    }

    public function test_professionals_list_can_be_filtered_by_search(): void
    {
        User::factory()->professional()->create(['name' => 'Ana Paula', 'specialty' => 'Pilates']);
        User::factory()->professional()->create(['name' => 'Carlos Silva', 'specialty' => 'Fisioterapia']);

        $this->actingAs($this->admin())
            ->get(route('professionals.index', ['search' => 'Ana']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('professionals/index')
                ->has('professionals.data', 1)
                ->where('professionals.data.0.name', 'Ana Paula')
            );
    }

    public function test_professionals_list_can_be_filtered_by_active_status(): void
    {
        User::factory()->professional()->create(['is_active' => true]);
        User::factory()->professional()->create(['is_active' => false]);

        $this->actingAs($this->admin())
            ->get(route('professionals.index', ['status' => 'active']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('professionals.data', 1));
    }

    // ─── SHOW ─────────────────────────────────────────────────────────────────

    public function test_any_authenticated_user_can_view_professional(): void
    {
        $professional = User::factory()->professional()->create();

        $this->actingAs($this->receptionist())
            ->get(route('professionals.show', $professional))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('professionals/show')
                ->where('professional.id', $professional->id)
            );
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────

    public function test_admin_can_view_create_professional_form(): void
    {
        $this->actingAs($this->admin())
            ->get(route('professionals.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('professionals/create'));
    }

    public function test_non_admin_cannot_view_create_professional_form(): void
    {
        $this->actingAs($this->professional())
            ->get(route('professionals.create'))
            ->assertForbidden();
    }

    // ─── STORE ────────────────────────────────────────────────────────────────

    public function test_admin_can_create_professional(): void
    {
        $this->actingAs($this->admin())
            ->post(route('professionals.store'), [
                'name' => 'Nova Profissional',
                'email' => 'nova@pilates.com',
                'password' => 'Password1!',
                'password_confirmation' => 'Password1!',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'nova@pilates.com',
            'role' => UserRole::Professional->value,
        ]);
    }

    public function test_non_admin_cannot_create_professional(): void
    {
        $this->actingAs($this->professional())
            ->post(route('professionals.store'), [
                'name' => 'Nova Profissional',
                'email' => 'nova2@pilates.com',
                'password' => 'Password1!',
                'password_confirmation' => 'Password1!',
            ])
            ->assertForbidden();
    }

    public function test_store_requires_name_and_email(): void
    {
        $this->actingAs($this->admin())
            ->post(route('professionals.store'), [])
            ->assertSessionHasErrors(['name', 'email', 'password']);
    }

    public function test_store_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@pilates.com']);

        $this->actingAs($this->admin())
            ->post(route('professionals.store'), [
                'name' => 'Novo',
                'email' => 'existing@pilates.com',
                'password' => 'Password1!',
                'password_confirmation' => 'Password1!',
            ])
            ->assertSessionHasErrors('email');
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    public function test_admin_can_update_professional(): void
    {
        $professional = User::factory()->professional()->create(['name' => 'Antigo Nome']);

        $this->actingAs($this->admin())
            ->put(route('professionals.update', $professional), [
                'name' => 'Novo Nome',
                'email' => $professional->email,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $professional->id, 'name' => 'Novo Nome']);
    }

    public function test_non_admin_cannot_update_professional(): void
    {
        $professional = User::factory()->professional()->create();

        $this->actingAs($this->professional())
            ->put(route('professionals.update', $professional), [
                'name' => 'Tentativa',
                'email' => $professional->email,
            ])
            ->assertForbidden();
    }

    public function test_update_allows_same_email_for_same_professional(): void
    {
        $professional = User::factory()->professional()->create(['email' => 'same@pilates.com']);

        $this->actingAs($this->admin())
            ->put(route('professionals.update', $professional), [
                'name' => $professional->name,
                'email' => 'same@pilates.com',
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
    }

    public function test_update_does_not_change_password_when_empty(): void
    {
        $professional = User::factory()->professional()->create();
        $oldPassword = $professional->password;

        $this->actingAs($this->admin())
            ->put(route('professionals.update', $professional), [
                'name' => $professional->name,
                'email' => $professional->email,
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertRedirect();

        $this->assertEquals($oldPassword, $professional->fresh()->password);
    }

    // ─── DESTROY ─────────────────────────────────────────────────────────────

    public function test_admin_can_deactivate_professional(): void
    {
        $professional = User::factory()->professional()->create(['is_active' => true]);

        $this->actingAs($this->admin())
            ->delete(route('professionals.destroy', $professional))
            ->assertRedirect(route('professionals.index'));

        $this->assertDatabaseHas('users', ['id' => $professional->id, 'is_active' => false]);
    }

    public function test_non_admin_cannot_deactivate_professional(): void
    {
        $professional = User::factory()->professional()->create();

        $this->actingAs($this->professional())
            ->delete(route('professionals.destroy', $professional))
            ->assertForbidden();
    }

    public function test_admin_cannot_deactivate_themselves(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->delete(route('professionals.destroy', $admin))
            ->assertForbidden();
    }
}

