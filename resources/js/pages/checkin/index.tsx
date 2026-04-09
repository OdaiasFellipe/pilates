import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle,
    Check,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Clock,
    Search,
    Sun,
    Sunset,
    Moon,
    UserX,
    X,
} from 'lucide-react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type CheckInAppointment = {
    id: number;
    patient_id: number;
    patient_name: string;
    patient_phone: string | null;
    professional_name: string;
    starts_at: string;
    ends_at: string;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    checked_in_at: string | null;
};

type Props = {
    appointments: CheckInAppointment[];
    date: string;
    filters: {
        period?: string;
        search?: string;
    };
};

const STATUS_STYLES: Record<string, string> = {
    scheduled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    missed: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

const TYPE_STYLES: Record<string, string> = {
    pilates: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    physiotherapy: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    evaluation: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

const PERIODS = [
    { value: '', label: 'Todos', icon: Clock },
    { value: 'morning', label: 'Manhã', icon: Sun },
    { value: 'afternoon', label: 'Tarde', icon: Sunset },
    { value: 'evening', label: 'Noite', icon: Moon },
] as const;

export default function CheckInIndex({ appointments, date, filters }: Props) {
    const currentDate = parseISO(date);
    const [search, setSearch] = useState(filters.search ?? '');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ id: number; type: 'checkin' | 'noshow' } | null>(null);
    const flash = usePage().props.flash as Record<string, unknown> | undefined;

    const navigate = (newDate: Date, newFilters?: Record<string, string>) => {
        router.get(
            '/checkin',
            {
                date: format(newDate, 'yyyy-MM-dd'),
                period: filters.period ?? undefined,
                search: search || undefined,
                ...newFilters,
            },
            { preserveState: true, replace: true },
        );
    };

    const changePeriod = (period: string) => {
        router.get(
            '/checkin',
            { date, period: period || undefined, search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleSearch = () => {
        router.get(
            '/checkin',
            { date, period: filters.period ?? undefined, search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleCheckIn = (appointmentId: number) => {
        setProcessingId(appointmentId);
        router.post(`/checkin/${appointmentId}/check-in`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessingId(null);
                setFeedback({ id: appointmentId, type: 'checkin' });
                setTimeout(() => setFeedback(null), 3000);
            },
            onError: () => {
                setProcessingId(null);
            },
        });
    };

    const handleNoShow = (appointmentId: number) => {
        setProcessingId(appointmentId);
        router.post(`/checkin/${appointmentId}/no-show`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessingId(null);
                setFeedback({ id: appointmentId, type: 'noshow' });
                setTimeout(() => setFeedback(null), 3000);
            },
            onError: () => {
                setProcessingId(null);
            },
        });
    };

    const checkedIn = appointments.filter((a) => a.status === 'completed');
    const pending = appointments.filter((a) => a.status !== 'completed' && a.status !== 'missed');
    const missed = appointments.filter((a) => a.status === 'missed');

    const headerLabel = format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });

    return (
        <>
            <Head title="Check-in" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <ClipboardCheck className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold capitalize tracking-tight md:text-2xl">Check-in</h1>
                            <p className="text-sm capitalize text-muted-foreground">{headerLabel}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            {checkedIn.length} presentes
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {pending.length} pendentes
                        </span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                            {missed.length} faltas
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Date navigation */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => navigate(subDays(currentDate, 1))} className="size-8">
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(new Date())}>
                            Hoje
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => navigate(addDays(currentDate, 1))} className="size-8">
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Period filter */}
                        <div className="flex rounded-lg border p-0.5">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => changePeriod(p.value)}
                                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                        (filters.period ?? '') === p.value
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <p.icon className="size-3" />
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="h-8 rounded-lg border bg-background pl-7 pr-2 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Flash notifications */}
                {flash?.success && (
                    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                        flash.package_alert
                            ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                        {flash.package_alert ? (
                            <AlertTriangle className="size-4 shrink-0" />
                        ) : (
                            <Check className="size-4 shrink-0" />
                        )}
                        <span>{flash.success as string}</span>
                        {flash.sessions_remaining != null && (
                            <span className="ml-auto text-xs opacity-75">
                                {flash.sessions_remaining === 0
                                    ? 'Pacote finalizado!'
                                    : `${flash.sessions_remaining} sessões restantes no pacote`}
                            </span>
                        )}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300">
                        <X className="size-4 shrink-0" />
                        <span>{flash.error as string}</span>
                    </div>
                )}

                {/* Appointment Cards */}
                {appointments.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-2xl border bg-card p-12">
                        <div className="text-center">
                            <ClipboardCheck className="mx-auto size-12 text-muted-foreground/30" />
                            <h3 className="mt-3 text-lg font-semibold">Nenhum agendamento</h3>
                            <p className="text-sm text-muted-foreground">Não há agendamentos para este dia e filtro.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {appointments.map((apt) => (
                            <AppointmentCard
                                key={apt.id}
                                appointment={apt}
                                isProcessing={processingId === apt.id}
                                feedback={feedback?.id === apt.id ? feedback : null}
                                onCheckIn={() => handleCheckIn(apt.id)}
                                onNoShow={() => handleNoShow(apt.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

CheckInIndex.layout = {
    breadcrumbs: [
        {
            title: 'Check-in',
            href: '/checkin',
        },
    ],
};

/* ─── Appointment Card ─── */

function AppointmentCard({
    appointment,
    isProcessing,
    feedback,
    onCheckIn,
    onNoShow,
}: {
    appointment: CheckInAppointment;
    isProcessing: boolean;
    feedback: { type: 'checkin' | 'noshow'; sessionsRemaining?: number | null; packageAlert?: boolean } | null;
    onCheckIn: () => void;
    onNoShow: () => void;
}) {
    const startsAt = parseISO(appointment.starts_at);
    const endsAt = parseISO(appointment.ends_at);
    const isCheckedIn = appointment.status === 'completed';
    const isMissed = appointment.status === 'missed';
    const isActioned = isCheckedIn || isMissed;

    const initials = appointment.patient_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all ${
                isCheckedIn
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                    : isMissed
                      ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
                      : 'hover:shadow-md'
            }`}
        >
            {/* Feedback animation */}
            {feedback && (
                <div
                    className={`absolute inset-0 z-10 flex items-center justify-center rounded-2xl ${
                        feedback.type === 'checkin'
                            ? 'bg-emerald-500/90'
                            : 'bg-amber-500/90'
                    } animate-in fade-in duration-300`}
                >
                    <div className="text-center text-white">
                        {feedback.type === 'checkin' ? (
                            <>
                                <Check className="mx-auto size-10" />
                                <p className="mt-1 text-sm font-bold">Check-in realizado!</p>
                            </>
                        ) : (
                            <>
                                <X className="mx-auto size-10" />
                                <p className="mt-1 text-sm font-bold">Falta registrada</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Card content */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isCheckedIn
                            ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'
                            : isMissed
                              ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                              : 'bg-primary/10 text-primary'
                    }`}
                >
                    {isCheckedIn ? <Check className="size-5" /> : isMissed ? <UserX className="size-5" /> : initials}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{appointment.patient_name}</h3>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>
                            {format(startsAt, 'HH:mm')} – {format(endsAt, 'HH:mm')}
                        </span>
                        <span className="text-border">•</span>
                        <span>{appointment.professional_name}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge className={`${TYPE_STYLES[appointment.type] ?? ''} border-0 text-[10px]`}>
                            {appointment.type_label}
                        </Badge>
                        <Badge className={`${STATUS_STYLES[appointment.status] ?? ''} border-0 text-[10px]`}>
                            {appointment.status_label}
                        </Badge>
                        {appointment.checked_in_at && (
                            <span className="text-[10px] text-muted-foreground">
                                às {format(parseISO(appointment.checked_in_at), 'HH:mm')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!isActioned && (
                <div className="mt-3 flex gap-2">
                    <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={onCheckIn}
                        disabled={isProcessing}
                    >
                        <Check className="size-4" />
                        {isProcessing ? 'Processando...' : 'Check-in'}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                        onClick={onNoShow}
                        disabled={isProcessing}
                    >
                        <UserX className="size-4" />
                        Falta
                    </Button>
                </div>
            )}
        </div>
    );
}
