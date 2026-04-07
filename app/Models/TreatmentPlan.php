<?php

namespace App\Models;

use App\Enums\TreatmentPlanStatus;
use Database\Factories\TreatmentPlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'patient_id',
    'professional_id',
    'diagnosis',
    'goals',
    'observations',
    'started_at',
    'expires_at',
    'status',
])]
class TreatmentPlan extends Model
{
    /** @use HasFactory<TreatmentPlanFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'date',
            'expires_at' => 'date',
            'status' => TreatmentPlanStatus::class,
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function professional(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class);
    }
}
