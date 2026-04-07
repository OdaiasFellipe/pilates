import { Head, Link } from '@inertiajs/react';
import { edit, index } from '@/actions/App/Http/Controllers/AppointmentsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment;
};

const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluido',
    cancelled: 'Cancelado',
    missed: 'Falta',
};

export default function ShowAppointment({ appointment }: Props) {
    return (
        <>
            <Head title={`Agendamento #${appointment.id}`} />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Agendamento #{appointment.id}</h1>
                        <p className="text-sm text-muted-foreground">
                            {new Date(appointment.starts_at).toLocaleString('pt-BR', {
                                dateStyle: 'full',
                                timeStyle: 'short',
                            })}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={edit.url(appointment.id)}>Editar</Link>
                    </Button>
                </div>

                <div className="rounded-lg border p-5">
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs text-muted-foreground">Paciente</dt>
                            <dd className="text-sm font-medium">{appointment.patient?.name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">Profissional</dt>
                            <dd className="text-sm font-medium">{appointment.professional?.name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">Tipo</dt>
                            <dd className="text-sm">{appointment.type}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">Status</dt>
                            <dd className="text-sm">
                                <Badge variant={appointment.status === 'cancelled' ? 'secondary' : 'default'}>
                                    {STATUS_LABELS[appointment.status] ?? appointment.status}
                                </Badge>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">Inicio</dt>
                            <dd className="text-sm">{new Date(appointment.starts_at).toLocaleString('pt-BR')}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">Fim</dt>
                            <dd className="text-sm">{new Date(appointment.ends_at).toLocaleString('pt-BR')}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-xs text-muted-foreground">Observacoes</dt>
                            <dd className="text-sm">{appointment.notes || '—'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-xs text-muted-foreground">Motivo de cancelamento</dt>
                            <dd className="text-sm">{appointment.cancellation_reason || '—'}</dd>
                        </div>
                    </dl>
                </div>

                <Button variant="outline" asChild>
                    <Link href={index.url()}>Voltar para agenda</Link>
                </Button>
            </div>
        </>
    );
}
