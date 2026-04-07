<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class ProfessionalPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, User $professional): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === UserRole::Admin;
    }

    public function update(User $user, User $professional): bool
    {
        return $user->role === UserRole::Admin;
    }

    public function delete(User $user, User $professional): bool
    {
        return $user->role === UserRole::Admin && $user->id !== $professional->id;
    }
}
