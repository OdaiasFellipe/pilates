import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { PerformanceReport } from '@/types';

type Props = {
    revenueByProfessional: Array<{
        id: number;
        name: string;
        total: string | number;
        count: number;
    }>;
    attendanceStats: {
        total: number;
        attended: number;
        cancelled: number;
        noShow: number;
        attendanceRate: number;
    };
    appointmentsTrend: Array<{
        date: string;
        count: number;
    }>;
    period: { from: string; to: string };
};

export default function PerformanceReportsIndex({ revenueByProfessional, attendanceStats, appointmentsTrend, period }: Props) {
    const formatCurrency = (value: string | number): string => {
        return `R$ ${Number(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <>
            <Head title="Relatórios de Desempenho" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold">Relatórios de Desempenho</h1>
                    <p className="text-sm text-muted-foreground">Período: {formatDate(period.from)} a {formatDate(period.to)}</p>
                </div>

                {/* Attendance Stats */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Agendamentos Totais</p>
                        <p className="mt-2 text-3xl font-bold">{attendanceStats.total}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Executados</p>
                        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{attendanceStats.attended}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Cancelados</p>
                        <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{attendanceStats.cancelled}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Taxa de Comparecimento</p>
                        <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.attendanceRate.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Revenue by Professional */}
                <div className="rounded-lg border bg-card p-5">
                    <h2 className="mb-4 text-lg font-semibold">Receita por Profissional</h2>
                    {revenueByProfessional.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma receita registrada neste período.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">Profissional</th>
                                        <th className="px-4 py-3 text-left font-medium">Pagamentos</th>
                                        <th className="px-4 py-3 text-left font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueByProfessional.map((prof) => (
                                        <tr key={prof.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 font-medium">{prof.name}</td>
                                            <td className="px-4 py-3">{prof.count}</td>
                                            <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">{formatCurrency(prof.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Appointments Trend */}
                <div className="rounded-lg border bg-card p-5">
                    <h2 className="mb-4 text-lg font-semibold">Agendamentos por Dia</h2>
                    {appointmentsTrend.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum dado de agendamentos neste período.</p>
                    ) : (
                        <div className="space-y-2">
                            {appointmentsTrend.map((day) => (
                                <div key={day.date} className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-2">
                                    <span className="text-sm font-medium">{formatDate(day.date)}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-32 rounded-full bg-muted" style={{ width: `${Math.min(day.count * 20, 128)}px` }} />
                                        <span className="text-sm text-muted-foreground w-8 text-right">{day.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
