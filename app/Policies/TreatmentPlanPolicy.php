<?php

namespace App\Policies;

use App\Models\TreatmentPlan;
use App\Models\User;

class TreatmentPlanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isProfessional();
    }

    public function view(User $user, TreatmentPlan $treatmentPlan): bool
    {
        return $user->isAdmin() || ($user->isProfessional() && $treatmentPlan->professional_id === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isProfessional();
    }

    public function update(User $user, TreatmentPlan $treatmentPlan): bool
    {
        return $this->view($user, $treatmentPlan);
    }

    public function delete(User $user, TreatmentPlan $treatmentPlan): bool
    {
        return $this->view($user, $treatmentPlan);
    }
}
