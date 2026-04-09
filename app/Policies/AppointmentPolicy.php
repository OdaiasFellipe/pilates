<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Appointment $appointment): bool
    {
        if ($user->isAdmin() || $user->role === UserRole::Receptionist) {
            return true;
        }

        return $user->isProfessional() && $appointment->professional_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, [UserRole::Admin, UserRole::Receptionist, UserRole::Professional], true);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        return $this->view($user, $appointment);
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $this->view($user, $appointment);
    }

    public function checkIn(User $user, Appointment $appointment): bool
    {
        return $this->view($user, $appointment);
    }
}
