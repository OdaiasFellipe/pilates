import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as appointmentsIndex } from '@/actions/App/Http/Controllers/AppointmentsController';
import { index as patientsIndex } from '@/actions/App/Http/Controllers/PatientsController';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/types';

type DashboardStats = {
    active_patients: number;
    today_appointments: number;
    today_confirmed: number;
    monthly_revenue: string | number;
    pending_payments: string | number;
};

type RecentPatient = {
    id: number;
    name: string;
    phone: string | null;
    created_at: string;
};

type DashboardNotification = {
    id: string;
    title: string;
    message: string | null;
    url: string | null;
    severity: 'info' | 'warning' | 'success' | 'error' | string;
    read_at: string | null;
    created_at: string;
};

type Props = {
    stats: DashboardStats;
    todayAppointments: Appointment[];
    upcomingAppointments: Appointment[];
    recentPatients: RecentPatient[];
    notifications: DashboardNotification[];
};

const STATUS_LABEL: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    missed: 'Faltou',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    scheduled: 'outline',
    confirmed: 'default',
    completed: 'secondary',
    cancelled: 'destructive',
    missed: 'destructive',
};

const TYPE_LABEL: Record<string, string> = {
    pilates: 'Pilates',
    physiotherapy: 'Fisioterapia',
    evaluation: 'Avaliação',
};

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function severityClasses(severity: string): string {
    if (severity === 'warning') {
        return 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30';
    }

    if (severity === 'success') {
        return 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30';
    }

    if (severity === 'error') {
        return 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30';
    }

    return 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30';
}

export default function Dashboard({ stats, todayAppointments, upcomingAppointments, recentPatients, notifications }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Pacientes Ativos"
                        value={stats.active_patients}
                        href={patientsIndex.url()}
                        color="blue"
                    />
                    <StatCard
                        title="Atendimentos Hoje"
                        value={`${stats.today_confirmed}/${stats.today_appointments}`}
                        subtitle="confirmados / total"
                        href={appointmentsIndex.url()}
                        color="green"
                    />
                    <StatCard
                        title="Receita do Mês"
                        value={formatCurrency(stats.monthly_revenue)}
                        href="/financial"
                        color="emerald"
                    />
                    <StatCard
                        title="Pagamentos Pendentes"
                        value={formatCurrency(stats.pending_payments)}
                        href="/financial/payments"
                        color="amber"
                    />
                </div>

                <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">Central de Notificações</h2>
                        <span className="text-xs text-muted-foreground">{notifications.length} mais recentes</span>
                    </div>

                    {notifications.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma notificação recente</p>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notification) => {
                                const content = (
                                    <div className={`rounded-lg border px-3 py-2 ${severityClasses(notification.severity)}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-medium">{notification.title}</p>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(notification.created_at).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                        {notification.message && (
                                            <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                                        )}
                                    </div>
                                );

                                if (!notification.url) {
                                    return <div key={notification.id}>{content}</div>;
                                }

                                return (
                                    <Link key={notification.id} href={notification.url} className="block hover:opacity-95">
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Atendimentos de Hoje</h2>
                            <Link href={appointmentsIndex.url()} className="text-sm text-primary hover:underline">
                                Ver todos
                            </Link>
                        </div>
                        {todayAppointments.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum atendimento hoje</p>
                        ) : (
                            <div className="space-y-2">
                                {todayAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-medium">{apt.patient?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatTime(apt.starts_at)} · {TYPE_LABEL[apt.type] || apt.type}
                                                {apt.professional && ` · ${apt.professional.name}`}
                                            </p>
                                        </div>
                                        <Badge variant={STATUS_VARIANT[apt.status] || 'outline'} className="text-xs">
                                            {STATUS_LABEL[apt.status] || apt.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Próximos Agendamentos</h2>
                            <Link href={appointmentsIndex.url()} className="text-sm text-primary hover:underline">
                                Ver todos
                            </Link>
                        </div>
                        {upcomingAppointments.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Sem próximos agendamentos</p>
                        ) : (
                            <div className="space-y-2">
                                {upcomingAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-medium">{apt.patient?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(apt.starts_at)} {formatTime(apt.starts_at)} · {TYPE_LABEL[apt.type] || apt.type}
                                            </p>
                                        </div>
                                        <Badge variant={STATUS_VARIANT[apt.status] || 'outline'} className="text-xs">
                                            {STATUS_LABEL[apt.status] || apt.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 lg:col-span-2 dark:border-sidebar-border">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Pacientes Recentes</h2>
                            <Link href={patientsIndex.url()} className="text-sm text-primary hover:underline">
                                Ver todos
                            </Link>
                        </div>
                        {recentPatients.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum paciente cadastrado</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                            <th className="pb-2 font-medium">Nome</th>
                                            <th className="pb-2 font-medium">Telefone</th>
                                            <th className="pb-2 font-medium">Cadastrado em</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {recentPatients.map((p) => (
                                            <tr key={p.id} className="hover:bg-muted/40">
                                                <td className="py-2">
                                                    <Link href={`/patients/${p.id}`} className="font-medium hover:underline">
                                                        {p.name}
                                                    </Link>
                                                </td>
                                                <td className="py-2 text-muted-foreground">{p.phone ?? '—'}</td>
                                                <td className="py-2 text-muted-foreground">
                                                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    href,
    color,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    href: string;
    color: 'blue' | 'green' | 'emerald' | 'amber';
}) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        green: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    };

    return (
        <Link href={href} className="block">
            <div className={`rounded-xl border border-sidebar-border/70 p-5 transition-shadow hover:shadow-md dark:border-sidebar-border ${colors[color]}`}>
                <p className="text-xs font-medium uppercase tracking-wide opacity-70">{title}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
                {subtitle && <p className="mt-0.5 text-xs opacity-60">{subtitle}</p>}
            </div>
        </Link>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
