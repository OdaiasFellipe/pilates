<?php

namespace App\Policies;

use App\Models\Evaluation;
use App\Models\User;

class EvaluationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isProfessional();
    }

    public function view(User $user, Evaluation $evaluation): bool
    {
        return $user->isAdmin() || ($user->isProfessional() && $evaluation->professional_id === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isProfessional();
    }

    public function update(User $user, Evaluation $evaluation): bool
    {
        return $this->view($user, $evaluation);
    }

    public function delete(User $user, Evaluation $evaluation): bool
    {
        return $this->view($user, $evaluation);
    }
}
