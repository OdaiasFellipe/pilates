<?php

namespace App\Http\Requests\Clinical;

use App\Enums\TreatmentPlanStatus;
use App\Models\TreatmentPlan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTreatmentPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', TreatmentPlan::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', Rule::exists('patients', 'id')],
            'professional_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'professional')->where('is_active', true)],
            'diagnosis' => ['required', 'string', 'max:5000'],
            'goals' => ['required', 'string', 'max:5000'],
            'observations' => ['nullable', 'string', 'max:5000'],
            'started_at' => ['required', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'status' => ['required', Rule::enum(TreatmentPlanStatus::class)],
        ];
    }
}
