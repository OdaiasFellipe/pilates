<?php

namespace App\Http\Requests\Professionals;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateProfessionalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('professional'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $professionalId = $this->route('professional')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($professionalId)],
            'password' => ['nullable', Password::defaults(), 'confirmed'],
            'cpf' => ['nullable', 'string', 'max:14', Rule::unique('users', 'cpf')->ignore($professionalId)],
            'phone' => ['nullable', 'string', 'max:20'],
            'specialty' => ['nullable', 'string', 'max:100'],
            'working_hours' => ['nullable', 'array'],
            'working_hours.*.day' => ['required', 'integer', 'between:0,6'],
            'working_hours.*.slots' => ['required', 'array', 'min:1'],
            'working_hours.*.slots.*.start' => ['required', 'date_format:H:i'],
            'working_hours.*.slots.*.end' => ['required', 'date_format:H:i', 'after:working_hours.*.slots.*.start'],
            'is_active' => ['boolean'],
        ];
    }
}
