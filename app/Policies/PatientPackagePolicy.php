<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\PatientPackage;
use App\Models\User;

class PatientPackagePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PatientPackage $patientPackage): bool
    {
        if ($user->isAdmin() || $user->role === UserRole::Receptionist) {
            return true;
        }

        return $user->isProfessional() && $patientPackage->professional_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::Admin, UserRole::Receptionist, UserRole::Professional], true);
    }

    public function update(User $user, PatientPackage $patientPackage): bool
    {
        return $this->view($user, $patientPackage);
    }

    public function delete(User $user, PatientPackage $patientPackage): bool
    {
        return $user->isAdmin();
    }
}
