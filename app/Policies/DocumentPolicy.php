<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isReceptionist()) {
            return true;
        }

        if ($user->isProfessional()) {
            return $document->patient->appointments()
                ->where('professional_id', $user->id)
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isReceptionist() || $user->isProfessional();
    }

    public function update(User $user, Document $document): bool
    {
        return $user->isAdmin() || ($user->id === $document->uploaded_by_id);
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->isAdmin() || ($user->id === $document->uploaded_by_id);
    }
}
