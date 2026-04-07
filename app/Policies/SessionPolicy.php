<?php

namespace App\Policies;

use App\Models\Session;
use App\Models\User;

class SessionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isProfessional();
    }

    public function view(User $user, Session $session): bool
    {
        return $user->isAdmin() || ($user->isProfessional() && $session->professional_id === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isProfessional();
    }

    public function update(User $user, Session $session): bool
    {
        return $this->view($user, $session);
    }

    public function delete(User $user, Session $session): bool
    {
        return $this->view($user, $session);
    }
}
