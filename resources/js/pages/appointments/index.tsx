import { Head, Link, router } from '@inertiajs/react';
import { index, create, show, edit } from '@/actions/App/Http/Controllers/AppointmentsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Appointment } from '@/types';

const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluido',
    cancelled: 'Cancelado',
    missed: 'Falta',
};

type PaginatedAppointments = {
    data: Appointment[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Option = {
    id: number;
    name: string;
};

type Props = {
    appointments: PaginatedAppointments;
    professionals: Option[];
    filters: {
        professional_id?: string;
        date?: string;
        status?: string;
    };
};

export default function AppointmentsIndex({ appointments, professionals, filters }: Props) {
    const updateFilter = (newFilters: Partial<Props['filters']>) => {
        router.get(index.url(), { ...filters, ...newFilters }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Agenda" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Agenda</h1>
                        <p className="text-sm text-muted-foreground">{appointments.total} agendamentos encontrados</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>Novo Agendamento</Link>
                    </Button>
                </div>

                <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-3">
                    <div className="grid gap-1">
                        <label className="text-sm text-muted-foreground">Data</label>
                        <Input
                            type="date"
                            value={filters.date ?? ''}
                            onChange={(e) => updateFilter({ date: e.target.value || undefined })}
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm text-muted-foreground">Profissional</label>
                        <select
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                            value={filters.professional_id ?? ''}
                            onChange={(e) => updateFilter({ professional_id: e.target.value || undefined })}
                        >
                            <option value="">Todos</option>
                            {professionals.map((professional) => (
                                <option key={professional.id} value={professional.id}>
                                    {professional.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm text-muted-foreground">Status</label>
                        <select
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                            value={filters.status ?? ''}
                            onChange={(e) => updateFilter({ status: e.target.value || undefined })}
                        >
                            <option value="">Todos</option>
                            <option value="scheduled">Agendado</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="completed">Concluido</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="missed">Falta</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Horario</th>
                                <th className="px-4 py-3 text-left font-medium">Paciente</th>
                                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Profissional</th>
                                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">Tipo</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Nenhum agendamento encontrado.
                                    </td>
                                </tr>
                            ) : (
                                appointments.data.map((appointment) => (
                                    <tr key={appointment.id} className="border-b last:border-0">
                                        <td className="px-4 py-3">
                                            {new Date(appointment.starts_at).toLocaleString('pt-BR', {
                                                dateStyle: 'short',
                                                timeStyle: 'short',
                                            })}
                                        </td>
                                        <td className="px-4 py-3">{appointment.patient?.name}</td>
                                        <td className="hidden px-4 py-3 sm:table-cell">{appointment.professional?.name}</td>
                                        <td className="hidden px-4 py-3 md:table-cell">{appointment.type}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={appointment.status === 'cancelled' ? 'secondary' : 'default'}>
                                                {STATUS_LABELS[appointment.status] ?? appointment.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={show.url(appointment.id)}>Ver</Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={edit.url(appointment.id)}>Editar</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {appointments.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Página {appointments.current_page} de {appointments.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!appointments.prev_page_url}
                                onClick={() => appointments.prev_page_url && router.get(appointments.prev_page_url)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!appointments.next_page_url}
                                onClick={() => appointments.next_page_url && router.get(appointments.next_page_url)}
                            >
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
