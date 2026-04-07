<?php

namespace App\Http\Requests\Clinical;

use App\Models\Appointment;
use App\Models\Session;
use App\Models\TreatmentPlan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Session::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'appointment_id' => ['required', 'integer', Rule::exists('appointments', 'id')],
            'treatment_plan_id' => ['nullable', 'integer', Rule::exists('treatment_plans', 'id')],
            'evolution_notes' => ['required', 'string', 'max:10000'],
            'soap_note' => ['nullable', 'array'],
            'soap_note.subjective' => ['nullable', 'string', 'max:2000'],
            'soap_note.objective' => ['nullable', 'string', 'max:2000'],
            'soap_note.assessment' => ['nullable', 'string', 'max:2000'],
            'soap_note.plan' => ['nullable', 'string', 'max:2000'],
            'exercises' => ['nullable', 'array'],
            'exercises.*' => ['string', 'max:255'],
            'pain_scale' => ['nullable', 'integer', 'between:0,10'],
            'attended_at' => ['required', 'date'],
        ];
    }

    /**
     * @return array<int, \Closure>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $appointment = Appointment::query()->find($this->integer('appointment_id'));

            if ($appointment === null) {
                return;
            }

            if ($this->user()->isProfessional() && $appointment->professional_id !== $this->user()->id) {
                $validator->errors()->add('appointment_id', 'Voce so pode registrar sessoes para seus proprios atendimentos.');
            }

            if (Session::query()->where('appointment_id', $appointment->id)->exists()) {
                $validator->errors()->add('appointment_id', 'Ja existe uma sessao registrada para este agendamento.');
            }

            if ($this->filled('treatment_plan_id')) {
                $treatmentPlanPatientId = (int) TreatmentPlan::query()
                    ->whereKey($this->integer('treatment_plan_id'))
                    ->value('patient_id');

                if ($treatmentPlanPatientId !== 0 && $treatmentPlanPatientId !== $appointment->patient_id) {
                    $validator->errors()->add('treatment_plan_id', 'O plano de tratamento deve pertencer ao mesmo paciente do agendamento.');
                }
            }
        }];
    }
}
