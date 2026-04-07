import { Head, useForm } from '@inertiajs/react';
import SessionsController from '@/actions/App/Http/Controllers/SessionsController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SessionFormData } from '@/types';

type AppointmentOption = {
    id: number;
    patient: { id: number; name: string };
    professional: { id: number; name: string };
    starts_at: string;
};

type TreatmentPlanOption = {
    id: number;
    patient: { id: number; name: string };
    started_at: string;
};

type Props = {
    appointments: AppointmentOption[];
    treatmentPlans: TreatmentPlanOption[];
};

export default function CreateSession({ appointments, treatmentPlans }: Props) {
    const { data, setData, post, processing, errors } = useForm<SessionFormData>({
        appointment_id: '',
        treatment_plan_id: '',
        evolution_notes: '',
        soap_note: {
            subjective: '',
            objective: '',
            assessment: '',
            plan: '',
        },
        exercises: [''],
        pain_scale: '',
        attended_at: new Date().toISOString().slice(0, 16),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(SessionsController.store.url());
    };

    return (
        <>
            <Head title="Evolução Clínica" />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Nova Evolução Clínica</h1>
                    <p className="text-sm text-muted-foreground">Registre o atendimento e a evolução SOAP quando necessário.</p>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="appointment_id">Agendamento *</Label>
                            <select id="appointment_id" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.appointment_id} onChange={(e) => setData('appointment_id', Number(e.target.value) || '')}>
                                <option value="">Selecione</option>
                                {appointments.map((appointment) => (
                                    <option key={appointment.id} value={appointment.id}>
                                        {appointment.patient.name} • {appointment.professional.name} • {new Date(appointment.starts_at).toLocaleString('pt-BR')}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.appointment_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="treatment_plan_id">Plano de tratamento</Label>
                            <select id="treatment_plan_id" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.treatment_plan_id} onChange={(e) => setData('treatment_plan_id', Number(e.target.value) || '')}>
                                <option value="">Nenhum</option>
                                {treatmentPlans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.patient.name} • iniciado em {plan.started_at}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.treatment_plan_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="attended_at">Data do atendimento *</Label>
                            <Input id="attended_at" type="datetime-local" value={data.attended_at} onChange={(e) => setData('attended_at', e.target.value)} />
                            <InputError message={errors.attended_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pain_scale">Escala de dor</Label>
                            <Input id="pain_scale" type="number" min={0} max={10} value={data.pain_scale} onChange={(e) => setData('pain_scale', e.target.value === '' ? '' : Number(e.target.value))} />
                            <InputError message={errors.pain_scale} />
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-xl border p-5">
                        <div className="grid gap-2">
                            <Label htmlFor="evolution_notes">Evolução clínica *</Label>
                            <textarea id="evolution_notes" className="min-h-32 rounded-md border bg-background px-3 py-2 text-sm" value={data.evolution_notes} onChange={(e) => setData('evolution_notes', e.target.value)} />
                            <InputError message={errors.evolution_notes} />
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="subjective">S - Subjetivo</Label>
                            <textarea id="subjective" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.soap_note.subjective} onChange={(e) => setData('soap_note', { ...data.soap_note, subjective: e.target.value })} />
                            <InputError message={errors['soap_note.subjective']} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="objective">O - Objetivo</Label>
                            <textarea id="objective" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.soap_note.objective} onChange={(e) => setData('soap_note', { ...data.soap_note, objective: e.target.value })} />
                            <InputError message={errors['soap_note.objective']} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="assessment">A - Avaliação</Label>
                            <textarea id="assessment" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.soap_note.assessment} onChange={(e) => setData('soap_note', { ...data.soap_note, assessment: e.target.value })} />
                            <InputError message={errors['soap_note.assessment']} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="plan">P - Plano</Label>
                            <textarea id="plan" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.soap_note.plan} onChange={(e) => setData('soap_note', { ...data.soap_note, plan: e.target.value })} />
                            <InputError message={errors['soap_note.plan']} />
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-xl border p-5">
                        <Label>Exercícios orientados</Label>
                        {data.exercises.map((exercise, index) => (
                            <div key={index} className="flex gap-2">
                                <Input value={exercise} onChange={(e) => setData('exercises', data.exercises.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} />
                                {data.exercises.length > 1 && (
                                    <Button type="button" variant="outline" onClick={() => setData('exercises', data.exercises.filter((_, itemIndex) => itemIndex !== index))}>Remover</Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => setData('exercises', [...data.exercises, ''])}>Adicionar exercício</Button>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>{processing ? 'Salvando...' : 'Salvar Evolução'}</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
