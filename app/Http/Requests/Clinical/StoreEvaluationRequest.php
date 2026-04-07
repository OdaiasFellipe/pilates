<?php

namespace App\Http\Requests\Clinical;

use App\Models\Evaluation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Evaluation::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', Rule::exists('patients', 'id')],
            'professional_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'professional')->where('is_active', true)],
            'chief_complaint' => ['required', 'string', 'max:5000'],
            'medical_history' => ['nullable', 'string', 'max:5000'],
            'physical_exam' => ['nullable', 'array'],
            'physical_exam.posture' => ['nullable', 'string', 'max:1000'],
            'physical_exam.mobility' => ['nullable', 'string', 'max:1000'],
            'physical_exam.observations' => ['nullable', 'string', 'max:2000'],
            'diagnosis' => ['nullable', 'string', 'max:5000'],
            'goals' => ['nullable', 'string', 'max:5000'],
            'evaluated_at' => ['required', 'date'],
        ];
    }
}
