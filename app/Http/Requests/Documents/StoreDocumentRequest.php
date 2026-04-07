<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|string|in:evaluation_form,treatment_plan,signed_consent,progress_photo,exercise_guide,medical_report,other',
            'file' => 'required|file|max:51200',
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'O arquivo é obrigatório.',
            'file.file' => 'O upload deve ser um arquivo válido.',
            'file.max' => 'O arquivo não pode exceder 50MB.',
            'title.required' => 'O título é obrigatório.',
            'type.required' => 'O tipo de documento é obrigatório.',
        ];
    }
}
