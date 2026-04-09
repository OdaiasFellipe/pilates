import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { index as appointmentsIndex } from '@/actions/App/Http/Controllers/AppointmentsController';
import { index as patientsIndex } from '@/actions/App/Http/Controllers/PatientsController';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/types';
import { Users, CalendarCheck, TrendingUp, AlertCircle, Bell, ArrowRight, Clock } from 'lucide-react';

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
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome + Date */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                            <Bell className="size-4" />
                            {unreadCount} notificaç{unreadCount === 1 ? 'ão' : 'ões'} nova{unreadCount === 1 ? '' : 's'}
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Pacientes Ativos"
                        value={stats.active_patients}
                        href={patientsIndex.url()}
                        icon={Users}
                        gradient="from-teal-500 to-cyan-600"
                        bgLight="bg-teal-50 dark:bg-teal-950/30"
                        iconColor="text-teal-600 dark:text-teal-400"
                    />
                    <StatCard
                        title="Atendimentos Hoje"
                        value={`${stats.today_confirmed}/${stats.today_appointments}`}
                        subtitle="confirmados / total"
                        href={appointmentsIndex.url()}
                        icon={CalendarCheck}
                        gradient="from-blue-500 to-indigo-600"
                        bgLight="bg-blue-50 dark:bg-blue-950/30"
                        iconColor="text-blue-600 dark:text-blue-400"
                    />
                    <StatCard
                        title="Receita do Mês"
                        value={formatCurrency(stats.monthly_revenue)}
                        href="/financial"
                        icon={TrendingUp}
                        gradient="from-emerald-500 to-green-600"
                        bgLight="bg-emerald-50 dark:bg-emerald-950/30"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        title="Pagamentos Pendentes"
                        value={formatCurrency(stats.pending_payments)}
                        href="/financial/payments"
                        icon={AlertCircle}
                        gradient="from-amber-500 to-orange-600"
                        bgLight="bg-amber-50 dark:bg-amber-950/30"
                        iconColor="text-amber-600 dark:text-amber-400"
                    />
                </div>

                {/* Notifications */}
                {notifications.length > 0 && (
                    <section className="rounded-2xl border bg-card p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                                    <Bell className="size-4 text-primary" />
                                </div>
                                <h2 className="font-semibold">Notificações</h2>
                            </div>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                {notifications.length} recentes
                            </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {notifications.slice(0, 6).map((notification) => {
                                const content = (
                                    <div
                                        className={`group relative rounded-xl border p-3 transition-all hover:shadow-sm ${severityClasses(notification.severity)} ${!notification.read_at ? 'ring-1 ring-primary/20' : ''}`}
                                    >
                                        {!notification.read_at && (
                                            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-primary" />
                                        )}
                                        <p className="pr-4 text-sm font-medium leading-snug">{notification.title}</p>
                                        {notification.message && (
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                                        )}
                                        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                                            <Clock className="size-3" />
                                            {new Date(notification.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                );

                                if (!notification.url) {
                                    return <div key={notification.id}>{content}</div>;
                                }

                                return (
                                    <Link key={notification.id} href={notification.url} className="block">
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Today's Appointments */}
                    <section className="rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                                    <CalendarCheck className="size-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="font-semibold">Atendimentos de Hoje</h2>
                            </div>
                            <Link href={appointmentsIndex.url()} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                                Ver todos <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                        <div className="p-5">
                            {todayAppointments.length === 0 ? (
                                <div className="flex flex-col items-center py-8 text-center">
                                    <CalendarCheck className="mb-2 size-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">Nenhum atendimento hoje</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {todayAppointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{apt.patient?.name}</p>
                                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {formatTime(apt.starts_at)} · {TYPE_LABEL[apt.type] || apt.type}
                                                    {apt.professional && ` · ${apt.professional.name}`}
                                                </p>
                                            </div>
                                            <Badge variant={STATUS_VARIANT[apt.status] || 'outline'} className="shrink-0 text-xs">
                                                {STATUS_LABEL[apt.status] || apt.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Upcoming Appointments */}
                    <section className="rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
                                    <CalendarCheck className="size-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="font-semibold">Próximos Agendamentos</h2>
                            </div>
                            <Link href={appointmentsIndex.url()} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                                Ver todos <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                        <div className="p-5">
                            {upcomingAppointments.length === 0 ? (
                                <div className="flex flex-col items-center py-8 text-center">
                                    <CalendarCheck className="mb-2 size-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">Sem próximos agendamentos</p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {upcomingAppointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{apt.patient?.name}</p>
                                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {formatDate(apt.starts_at)} {formatTime(apt.starts_at)} · {TYPE_LABEL[apt.type] || apt.type}
                                                </p>
                                            </div>
                                            <Badge variant={STATUS_VARIANT[apt.status] || 'outline'} className="shrink-0 text-xs">
                                                {STATUS_LABEL[apt.status] || apt.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Recent Patients */}
                    <section className="rounded-2xl border bg-card shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950/50">
                                    <Users className="size-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <h2 className="font-semibold">Pacientes Recentes</h2>
                            </div>
                            <Link href={patientsIndex.url()} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                                Ver todos <ArrowRight className="size-3.5" />
                            </Link>
                        </div>
                        <div className="p-5">
                            {recentPatients.length === 0 ? (
                                <div className="flex flex-col items-center py-8 text-center">
                                    <Users className="mb-2 size-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">Nenhum paciente cadastrado</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                <th className="pb-3">Nome</th>
                                                <th className="hidden pb-3 sm:table-cell">Telefone</th>
                                                <th className="pb-3 text-right">Cadastrado em</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {recentPatients.map((p) => (
                                                <tr key={p.id} className="transition-colors hover:bg-muted/30">
                                                    <td className="py-3">
                                                        <Link href={`/patients/${p.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                                                            {p.name}
                                                        </Link>
                                                    </td>
                                                    <td className="hidden py-3 text-muted-foreground sm:table-cell">{p.phone ?? '—'}</td>
                                                    <td className="py-3 text-right text-muted-foreground">
                                                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
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
    icon: Icon,
    gradient,
    bgLight,
    iconColor,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    bgLight: string;
    iconColor: string;
}) {
    return (
        <Link href={href} className="group block">
            <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-5`} />
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
                        <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
                        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
                    </div>
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${bgLight}`}>
                        <Icon className={`size-5 ${iconColor}`} />
                    </div>
                </div>
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
