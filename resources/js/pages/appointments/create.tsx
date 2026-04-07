import { Head, Link, useForm } from '@inertiajs/react';
import AppointmentsController, { index } from '@/actions/App/Http/Controllers/AppointmentsController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AppointmentFormData } from '@/types';

type Option = { id: number; name: string };

type Props = {
    patients: Option[];
    professionals: Option[];
    defaultDurationMinutes: number;
};

export default function CreateAppointment({ patients, professionals, defaultDurationMinutes }: Props) {
    const { data, setData, post, processing, errors } = useForm<AppointmentFormData>({
        patient_id: '',
        professional_id: '',
        starts_at: '',
        ends_at: '',
        type: 'pilates',
        status: 'scheduled',
        notes: '',
        cancellation_reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(AppointmentsController.store.url());
    };

    return (
        <>
            <Head title="Novo Agendamento" />

            <div className="mx-auto max-w-3xl p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Novo Agendamento</h1>
                    <p className="text-sm text-muted-foreground">Duracao padrao: {defaultDurationMinutes} minutos</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="patient_id">Paciente *</Label>
                            <select
                                id="patient_id"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={data.patient_id}
                                onChange={(e) => setData('patient_id', Number(e.target.value) || '')}
                            >
                                <option value="">Selecione</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.patient_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="professional_id">Profissional *</Label>
                            <select
                                id="professional_id"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={data.professional_id}
                                onChange={(e) => setData('professional_id', Number(e.target.value) || '')}
                            >
                                <option value="">Selecione</option>
                                {professionals.map((professional) => (
                                    <option key={professional.id} value={professional.id}>
                                        {professional.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.professional_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="starts_at">Inicio *</Label>
                            <Input
                                id="starts_at"
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) => setData('starts_at', e.target.value)}
                            />
                            <InputError message={errors.starts_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ends_at">Fim</Label>
                            <Input
                                id="ends_at"
                                type="datetime-local"
                                value={data.ends_at}
                                onChange={(e) => setData('ends_at', e.target.value)}
                            />
                            <InputError message={errors.ends_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipo *</Label>
                            <select
                                id="type"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value as AppointmentFormData['type'])}
                            >
                                <option value="pilates">Pilates</option>
                                <option value="physiotherapy">Fisioterapia</option>
                                <option value="evaluation">Avaliacao</option>
                            </select>
                            <InputError message={errors.type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status *</Label>
                            <select
                                id="status"
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as AppointmentFormData['status'])}
                            >
                                <option value="scheduled">Agendado</option>
                                <option value="confirmed">Confirmado</option>
                                <option value="completed">Concluido</option>
                                <option value="cancelled">Cancelado</option>
                                <option value="missed">Falta</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="sm:col-span-2 grid gap-2">
                            <Label htmlFor="notes">Observacoes</Label>
                            <textarea
                                id="notes"
                                className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Agendar'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={index.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
