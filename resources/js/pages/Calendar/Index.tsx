import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CalendarAppointment, CalendarViewType } from '@/types';

type Props = {
    appointments: CalendarAppointment[];
    date: string;
    view: CalendarViewType;
    professionals: Array<{ id: number; name: string }>;
    selectedProfessionalId?: number;
    range: { start: string; end: string };
};

const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
    }
};

const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        confirmed: 'Confirmado',
        pending: 'Pendente',
        cancelled: 'Cancelado',
    };
    return labels[status.toLowerCase()] || status;
};

const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export default function CalendarIndex({ appointments, date, view, professionals, selectedProfessionalId, range }: Props) {
    const [currentView, setCurrentView] = useState<CalendarViewType>(view as CalendarViewType);
    const [currentDate, setCurrentDate] = useState(date);
    const [selectedProfessional, setSelectedProfessional] = useState(selectedProfessionalId?.toString() || '');

    const handleDateChange = (offset: number): void => {
        const newDate = new Date(currentDate);
        if (currentView === 'day') newDate.setDate(newDate.getDate() + offset);
        else if (currentView === 'week') newDate.setDate(newDate.getDate() + offset * 7);
        else newDate.setMonth(newDate.getMonth() + offset);

        setCurrentDate(newDate.toISOString().split('T')[0]);
    };

    const handleViewChange = (newView: CalendarViewType): void => {
        setCurrentView(newView);
    };

    return (
        <>
            <Head title="Calendário" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Calendário de Agendamentos</h1>
                        <p className="text-sm text-muted-foreground">Período: {formatDate(range.start)} a {formatDate(range.end)}</p>
                    </div>
                    <Button asChild>
                        <Link href="/appointments/create">Novo Agendamento</Link>
                    </Button>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDateChange(-1)}>
                            ← Anterior
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}>
                            Hoje
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDateChange(1)}>
                            Próximo →
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        {(['day', 'week', 'month'] as const).map((v) => (
                            <Button
                                key={v}
                                variant={currentView === v ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleViewChange(v)}
                            >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </Button>
                        ))}
                    </div>

                    <select
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                        value={selectedProfessional}
                        onChange={(e) => setSelectedProfessional(e.target.value)}
                    >
                        <option value="">Todos os profissionais</option>
                        {professionals.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 rounded-lg border bg-card p-4">
                    {appointments.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-center text-muted-foreground">Nenhum agendamento neste período</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {currentView === 'month' ? (
                                // Month view - Grid
                                <div className="grid gap-4 sm:grid-cols-7">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                                        <div key={day} className="text-center font-semibold text-sm py-2">
                                            {day}
                                        </div>
                                    ))}
                                    {Array.from({ length: 35 }).map((_, i) => {
                                        const cellDate = new Date(range.start);
                                        cellDate.setDate(cellDate.getDate() + i);
                                        const cellDateStr = cellDate.toISOString().split('T')[0];
                                        const dayAppointments = appointments.filter((a) => a.start.startsWith(cellDateStr));

                                        return (
                                            <div key={i} className="border rounded p-2 min-h-24 bg-muted/30">
                                                <p className="text-xs font-medium mb-1">{cellDate.getDate()}</p>
                                                <div className="space-y-1">
                                                    {dayAppointments.slice(0, 2).map((apt) => (
                                                        <div key={apt.id} className={`rounded px-1 py-0.5 text-xs truncate ${getStatusColor(apt.status)}`}>
                                                            {formatTime(apt.start)} - {apt.patient}
                                                        </div>
                                                    ))}
                                                    {dayAppointments.length > 2 && (
                                                        <p className="text-xs text-muted-foreground">+{dayAppointments.length - 2}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Day/Week view - List
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="px-4 py-3 text-left font-medium">Hora</th>
                                                <th className="px-4 py-3 text-left font-medium">Paciente</th>
                                                <th className="px-4 py-3 text-left font-medium">Profissional</th>
                                                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.map((apt) => (
                                                <tr key={apt.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-xs">
                                                        {formatTime(apt.start)} - {formatTime(apt.end)}
                                                    </td>
                                                    <td className="px-4 py-3">{apt.patient}</td>
                                                    <td className="px-4 py-3">{apt.professional}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{apt.type}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(apt.status)}`}>
                                                            {getStatusLabel(apt.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
