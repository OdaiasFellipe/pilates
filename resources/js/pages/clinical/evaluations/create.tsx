import { Head, Link, useForm } from '@inertiajs/react';
import EvaluationsController from '@/actions/App/Http/Controllers/EvaluationsController';
import { create as createTreatmentPlan } from '@/actions/App/Http/Controllers/TreatmentPlansController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EvaluationFormData } from '@/types';

type Option = { id: number; name: string };

type Props = {
    patients: Option[];
    professionals: Option[];
};

export default function CreateEvaluation({ patients, professionals }: Props) {
    const { data, setData, post, processing, errors } = useForm<EvaluationFormData>({
        patient_id: '',
        professional_id: '',
        chief_complaint: '',
        medical_history: '',
        physical_exam: {
            posture: '',
            mobility: '',
            observations: '',
        },
        diagnosis: '',
        goals: '',
        evaluated_at: new Date().toISOString().slice(0, 16),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(EvaluationsController.store.url());
    };

    return (
        <>
            <Head title="Avaliação Inicial" />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Avaliação Inicial</h1>
                        <p className="text-sm text-muted-foreground">Registre anamnese, exame físico e objetivos terapêuticos.</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={createTreatmentPlan.url()}>Novo Plano</Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="patient_id">Paciente *</Label>
                            <select id="patient_id" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.patient_id} onChange={(e) => setData('patient_id', Number(e.target.value) || '')}>
                                <option value="">Selecione</option>
                                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
                            </select>
                            <InputError message={errors.patient_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="professional_id">Profissional *</Label>
                            <select id="professional_id" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.professional_id} onChange={(e) => setData('professional_id', Number(e.target.value) || '')}>
                                <option value="">Selecione</option>
                                {professionals.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
                            </select>
                            <InputError message={errors.professional_id} />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="evaluated_at">Data da avaliação *</Label>
                            <Input id="evaluated_at" type="datetime-local" value={data.evaluated_at} onChange={(e) => setData('evaluated_at', e.target.value)} />
                            <InputError message={errors.evaluated_at} />
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-xl border p-5">
                        <div className="grid gap-2">
                            <Label htmlFor="chief_complaint">Queixa principal *</Label>
                            <textarea id="chief_complaint" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.chief_complaint} onChange={(e) => setData('chief_complaint', e.target.value)} />
                            <InputError message={errors.chief_complaint} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="medical_history">Histórico clínico</Label>
                            <textarea id="medical_history" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.medical_history} onChange={(e) => setData('medical_history', e.target.value)} />
                            <InputError message={errors.medical_history} />
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="posture">Postura</Label>
                            <textarea id="posture" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.physical_exam.posture} onChange={(e) => setData('physical_exam', { ...data.physical_exam, posture: e.target.value })} />
                            <InputError message={errors['physical_exam.posture']} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobility">Mobilidade</Label>
                            <textarea id="mobility" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.physical_exam.mobility} onChange={(e) => setData('physical_exam', { ...data.physical_exam, mobility: e.target.value })} />
                            <InputError message={errors['physical_exam.mobility']} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="observations">Observações do exame</Label>
                            <textarea id="observations" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.physical_exam.observations} onChange={(e) => setData('physical_exam', { ...data.physical_exam, observations: e.target.value })} />
                            <InputError message={errors['physical_exam.observations']} />
                        </div>
                    </div>

                    <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="diagnosis">Diagnóstico funcional</Label>
                            <textarea id="diagnosis" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.diagnosis} onChange={(e) => setData('diagnosis', e.target.value)} />
                            <InputError message={errors.diagnosis} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="goals">Objetivos terapêuticos</Label>
                            <textarea id="goals" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.goals} onChange={(e) => setData('goals', e.target.value)} />
                            <InputError message={errors.goals} />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>{processing ? 'Salvando...' : 'Salvar Avaliação'}</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
