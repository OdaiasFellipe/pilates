<?php

namespace App\Http\Requests\Financial;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientPackageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array($this->user()->role, [UserRole::Admin, UserRole::Receptionist, UserRole::Professional], true);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', Rule::exists('patients', 'id')],
            'package_id' => ['required', 'integer', Rule::exists('packages', 'id')],
            'professional_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'professional')],
            'starts_at' => ['required', 'date'],
            'paid_at' => ['nullable', 'date'],
        ];
    }
}
