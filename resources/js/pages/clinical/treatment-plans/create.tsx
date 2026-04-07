import { Head, useForm } from '@inertiajs/react';
import TreatmentPlansController from '@/actions/App/Http/Controllers/TreatmentPlansController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TreatmentPlanFormData } from '@/types';

type Option = { id: number; name: string };

type Props = { patients: Option[]; professionals: Option[] };

export default function CreateTreatmentPlan({ patients, professionals }: Props) {
    const { data, setData, post, processing, errors } = useForm<TreatmentPlanFormData>({
        patient_id: '',
        professional_id: '',
        diagnosis: '',
        goals: '',
        observations: '',
        started_at: new Date().toISOString().slice(0, 10),
        expires_at: '',
        status: 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(TreatmentPlansController.store.url());
    };

    return (
        <>
            <Head title="Plano de Tratamento" />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Novo Plano de Tratamento</h1>
                    <p className="text-sm text-muted-foreground">Defina diagnóstico, metas e vigência terapêutica.</p>
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
                        <div className="grid gap-2">
                            <Label htmlFor="started_at">Início *</Label>
                            <Input id="started_at" type="date" value={data.started_at} onChange={(e) => setData('started_at', e.target.value)} />
                            <InputError message={errors.started_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="expires_at">Expiração</Label>
                            <Input id="expires_at" type="date" value={data.expires_at} onChange={(e) => setData('expires_at', e.target.value)} />
                            <InputError message={errors.expires_at} />
                        </div>
                    </div>
                    <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="diagnosis">Diagnóstico *</Label>
                            <textarea id="diagnosis" className="min-h-28 rounded-md border bg-background px-3 py-2 text-sm" value={data.diagnosis} onChange={(e) => setData('diagnosis', e.target.value)} />
                            <InputError message={errors.diagnosis} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="goals">Objetivos *</Label>
                            <textarea id="goals" className="min-h-28 rounded-md border bg-background px-3 py-2 text-sm" value={data.goals} onChange={(e) => setData('goals', e.target.value)} />
                            <InputError message={errors.goals} />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="observations">Observações</Label>
                            <textarea id="observations" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.observations} onChange={(e) => setData('observations', e.target.value)} />
                            <InputError message={errors.observations} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>{processing ? 'Salvando...' : 'Salvar Plano'}</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
