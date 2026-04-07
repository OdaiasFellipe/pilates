<?php

namespace App\Models;

use App\Enums\PatientPackageStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'patient_id',
    'package_id',
    'professional_id',
    'starts_at',
    'expires_at',
    'sessions_used',
    'sessions_total',
    'status',
    'paid_at',
])]
class PatientPackage extends Model
{
    /** @use HasFactory<\Database\Factories\PatientPackageFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'expires_at' => 'date',
            'paid_at' => 'datetime',
            'status' => PatientPackageStatus::class,
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function professional(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
