<?php

namespace App\Models;

use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'cpf',
    'rg',
    'birth_date',
    'phone',
    'email',
    'address',
    'health_insurance',
    'health_insurance_number',
    'emergency_contact',
    'notes',
    'is_active',
])]
class Patient extends Model
{
    /** @use HasFactory<PatientFactory> */
    use HasFactory, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'address' => 'array',
            'emergency_contact' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Scope a query to only include active patients.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    public function treatmentPlans(): HasMany
    {
        return $this->hasMany(TreatmentPlan::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class);
    }

    public function patientPackages(): HasMany
    {
        return $this->hasMany(PatientPackage::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Get the patient's masked CPF (LGPD).
     */
    public function getMaskedCpfAttribute(): string
    {
        return preg_replace('/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/', '***.$2.$3-**', $this->cpf ?? '');
    }
}
