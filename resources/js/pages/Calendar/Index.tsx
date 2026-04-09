import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CalendarAppointment, CalendarViewType } from '@/types';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, GripVertical, Plus, User } from 'lucide-react';
import {
    addDays,
    addMonths,
    addWeeks,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isToday,
    parseISO,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Props = {
    appointments: CalendarAppointment[];
    date: string;
    view: CalendarViewType;
    professionals: Array<{ id: number; name: string }>;
    selectedProfessionalId?: number | null;
    range: { start: string; end: string };
};

const PROFESSIONAL_COLORS = [
    { bg: 'bg-teal-100 dark:bg-teal-900/40', border: 'border-teal-400', text: 'text-teal-800 dark:text-teal-200', dot: 'bg-teal-500' },
    { bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-400', text: 'text-blue-800 dark:text-blue-200', dot: 'bg-blue-500' },
    { bg: 'bg-violet-100 dark:bg-violet-900/40', border: 'border-violet-400', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-500' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-400', text: 'text-amber-800 dark:text-amber-200', dot: 'bg-amber-500' },
    { bg: 'bg-rose-100 dark:bg-rose-900/40', border: 'border-rose-400', text: 'text-rose-800 dark:text-rose-200', dot: 'bg-rose-500' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-400', text: 'text-emerald-800 dark:text-emerald-200', dot: 'bg-emerald-500' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-indigo-400', text: 'text-indigo-800 dark:text-indigo-200', dot: 'bg-indigo-500' },
    { bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-pink-400', text: 'text-pink-800 dark:text-pink-200', dot: 'bg-pink-500' },
];

const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    missed: 'Falta',
};

const STATUS_STYLES: Record<string, string> = {
    scheduled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    missed: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6:00 - 19:00

function formatTime(iso: string): string {
    return format(parseISO(iso), 'HH:mm');
}

export default function CalendarIndex({ appointments, date, view, professionals, selectedProfessionalId, range }: Props) {
    const currentDate = parseISO(date);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarAppointment | null>(null);

    const professionalColorMap = useMemo(() => {
        const map = new Map<number, (typeof PROFESSIONAL_COLORS)[0]>();
        professionals.forEach((p, i) => {
            map.set(p.id, PROFESSIONAL_COLORS[i % PROFESSIONAL_COLORS.length]);
        });
        return map;
    }, [professionals]);

    const navigate = useCallback(
        (newDate: Date, newView?: CalendarViewType) => {
            router.get(
                '/calendar',
                {
                    date: format(newDate, 'yyyy-MM-dd'),
                    view: newView ?? view,
                    professional_id: selectedProfessionalId ?? undefined,
                },
                { preserveState: true, replace: true },
            );
        },
        [view, selectedProfessionalId],
    );

    const goToday = () => navigate(new Date());

    const goPrev = () => {
        if (view === 'day') navigate(subDays(currentDate, 1));
        else if (view === 'week') navigate(subWeeks(currentDate, 1));
        else navigate(subMonths(currentDate, 1));
    };

    const goNext = () => {
        if (view === 'day') navigate(addDays(currentDate, 1));
        else if (view === 'week') navigate(addWeeks(currentDate, 1));
        else navigate(addMonths(currentDate, 1));
    };

    const changeView = (newView: CalendarViewType) => navigate(currentDate, newView);

    const changeProfessional = (profId: string) => {
        router.get(
            '/calendar',
            {
                date: format(currentDate, 'yyyy-MM-dd'),
                view,
                professional_id: profId || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleDrop = useCallback(
        (appointmentId: number, dayDate: Date, hour: number, minutes: number) => {
            const newStart = new Date(dayDate);
            newStart.setHours(hour, minutes, 0, 0);

            router.patch(
                `/appointments/${appointmentId}/move`,
                { starts_at: newStart.toISOString() },
                {
                    preserveState: true,
                    onSuccess: () => setDraggingId(null),
                    onError: () => {
                        setDraggingId(null);
                        alert('Conflito de horário detectado. O agendamento não foi movido.');
                    },
                },
            );
        },
        [],
    );

    const headerLabel = useMemo(() => {
        if (view === 'day') return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
        if (view === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            return `${format(start, 'd MMM', { locale: ptBR })} — ${format(end, "d MMM yyyy", { locale: ptBR })}`;
        }
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
    }, [currentDate, view]);

    return (
        <>
            <Head title="Calendário" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <CalendarDays className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold capitalize tracking-tight md:text-2xl">{headerLabel}</h1>
                            <p className="text-sm text-muted-foreground">
                                {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/appointments/create">
                            <Plus className="size-4" />
                            Novo Agendamento
                        </Link>
                    </Button>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={goPrev} className="size-8">
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={goToday}>
                            Hoje
                        </Button>
                        <Button variant="outline" size="icon" onClick={goNext} className="size-8">
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg border p-0.5">
                            {(['day', 'week', 'month'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => changeView(v)}
                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                        view === v
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {{ day: 'Dia', week: 'Semana', month: 'Mês' }[v]}
                                </button>
                            ))}
                        </div>

                        <select
                            className="h-8 rounded-lg border bg-background px-2 text-xs"
                            value={selectedProfessionalId ?? ''}
                            onChange={(e) => changeProfessional(e.target.value)}
                        >
                            <option value="">Todos profissionais</option>
                            {professionals.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Professional Legend */}
                {!selectedProfessionalId && professionals.length > 1 && (
                    <div className="flex flex-wrap gap-3">
                        {professionals.map((p) => {
                            const color = professionalColorMap.get(p.id);
                            return (
                                <div key={p.id} className="flex items-center gap-1.5 text-xs">
                                    <span className={`size-2.5 rounded-full ${color?.dot}`} />
                                    {p.name}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Calendar Body */}
                <div className="flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    {view === 'month' ? (
                        <MonthView
                            appointments={appointments}
                            currentDate={currentDate}
                            professionalColorMap={professionalColorMap}
                            onDayClick={(d) => navigate(d, 'day')}
                        />
                    ) : (
                        <WeekDayView
                            appointments={appointments}
                            currentDate={currentDate}
                            view={view}
                            professionalColorMap={professionalColorMap}
                            draggingId={draggingId}
                            setDraggingId={setDraggingId}
                            onDrop={handleDrop}
                            setSelectedEvent={setSelectedEvent}
                        />
                    )}
                </div>

                {/* Event Detail Modal */}
                {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
            </div>
        </>
    );
}

CalendarIndex.layout = {
    breadcrumbs: [
        {
            title: 'Calendário',
            href: '/calendar',
        },
    ],
};

/* ─── Month View ─── */

function MonthView({
    appointments,
    currentDate,
    professionalColorMap,
    onDayClick,
}: {
    appointments: CalendarAppointment[];
    currentDate: Date;
    professionalColorMap: Map<number, (typeof PROFESSIONAL_COLORS)[0]>;
    onDayClick: (d: Date) => void;
}) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
        <div className="flex h-full flex-col">
            <div className="grid grid-cols-7 border-b">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                    <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid flex-1 grid-cols-7">
                {days.map((day, i) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayAppts = appointments.filter((a) => a.start.startsWith(dayStr));
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <button
                            key={i}
                            onClick={() => onDayClick(day)}
                            className={`group relative min-h-20 border-b border-r p-1.5 text-left transition-colors hover:bg-muted/40 ${
                                !isCurrentMonth ? 'bg-muted/20' : ''
                            }`}
                        >
                            <span
                                className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                                    isToday(day)
                                        ? 'bg-primary text-primary-foreground'
                                        : isCurrentMonth
                                          ? ''
                                          : 'text-muted-foreground/50'
                                }`}
                            >
                                {day.getDate()}
                            </span>
                            <div className="mt-0.5 space-y-0.5">
                                {dayAppts.slice(0, 3).map((apt) => {
                                    const color = professionalColorMap.get(apt.professional_id ?? 0);
                                    return (
                                        <div
                                            key={apt.id}
                                            className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight font-medium ${color?.bg ?? 'bg-muted'} ${color?.text ?? ''}`}
                                        >
                                            {formatTime(apt.start)} {apt.title}
                                        </div>
                                    );
                                })}
                                {dayAppts.length > 3 && (
                                    <span className="text-[10px] font-medium text-primary">+{dayAppts.length - 3} mais</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Week/Day View (Time Grid) ─── */

function WeekDayView({
    appointments,
    currentDate,
    view,
    professionalColorMap,
    draggingId,
    setDraggingId,
    onDrop,
    setSelectedEvent,
}: {
    appointments: CalendarAppointment[];
    currentDate: Date;
    view: 'day' | 'week';
    professionalColorMap: Map<number, (typeof PROFESSIONAL_COLORS)[0]>;
    draggingId: number | null;
    setDraggingId: (id: number | null) => void;
    onDrop: (id: number, day: Date, hour: number, minutes: number) => void;
    setSelectedEvent: (e: CalendarAppointment | null) => void;
}) {
    const days =
        view === 'day'
            ? [currentDate]
            : eachDayOfInterval({
                  start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                  end: endOfWeek(currentDate, { weekStartsOn: 1 }),
              });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnColumn = (e: React.DragEvent, day: Date, colEl: HTMLDivElement) => {
        e.preventDefault();
        if (!draggingId) return;

        const rect = colEl.getBoundingClientRect();
        const y = e.clientY - rect.top + colEl.scrollTop;
        const totalMinutes = Math.round((y / (HOURS.length * 64)) * HOURS.length * 60);
        const hour = HOURS[0] + Math.floor(totalMinutes / 60);
        const rawMinutes = totalMinutes % 60;
        const minutes = Math.round(rawMinutes / 15) * 15;

        onDrop(draggingId, day, Math.min(hour, HOURS[HOURS.length - 1]), minutes >= 60 ? 0 : minutes);
    };

    return (
        <div className="flex h-full max-h-[calc(100vh-320px)] flex-col overflow-auto">
            {/* Day headers */}
            <div
                className="sticky top-0 z-10 grid border-b bg-card"
                style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
            >
                <div className="border-r" />
                {days.map((day) => (
                    <div
                        key={day.toISOString()}
                        className={`flex flex-col items-center border-r py-2 ${isToday(day) ? 'bg-primary/5' : ''}`}
                    >
                        <span className="text-[10px] font-medium uppercase text-muted-foreground">
                            {format(day, 'EEE', { locale: ptBR })}
                        </span>
                        <span
                            className={`mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-bold ${
                                isToday(day) ? 'bg-primary text-primary-foreground' : ''
                            }`}
                        >
                            {day.getDate()}
                        </span>
                    </div>
                ))}
            </div>

            {/* Time grid */}
            <div className="relative grid flex-1" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
                {/* Hour labels */}
                <div className="border-r">
                    {HOURS.map((hour) => (
                        <div key={hour} className="relative h-16 border-b">
                            <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground">
                                {String(hour).padStart(2, '0')}:00
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                {days.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const dayAppts = appointments.filter((a) => a.start.startsWith(dayStr));

                    return (
                        <DayColumn
                            key={day.toISOString()}
                            day={day}
                            dayAppts={dayAppts}
                            professionalColorMap={professionalColorMap}
                            draggingId={draggingId}
                            setDraggingId={setDraggingId}
                            onDragOver={handleDragOver}
                            onDrop={handleDropOnColumn}
                            setSelectedEvent={setSelectedEvent}
                        />
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Day Column ─── */

function DayColumn({
    day,
    dayAppts,
    professionalColorMap,
    draggingId,
    setDraggingId,
    onDragOver,
    onDrop,
    setSelectedEvent,
}: {
    day: Date;
    dayAppts: CalendarAppointment[];
    professionalColorMap: Map<number, (typeof PROFESSIONAL_COLORS)[0]>;
    draggingId: number | null;
    setDraggingId: (id: number | null) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, day: Date, colEl: HTMLDivElement) => void;
    setSelectedEvent: (e: CalendarAppointment | null) => void;
}) {
    const colRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={colRef}
            className={`relative border-r ${isToday(day) ? 'bg-primary/[0.02]' : ''}`}
            onDragOver={onDragOver}
            onDrop={(e) => colRef.current && onDrop(e, day, colRef.current)}
        >
            {/* Hour grid lines */}
            {HOURS.map((hour) => (
                <div key={hour} className="h-16 border-b border-dashed border-border/40">
                    <div className="h-8 border-b border-dotted border-border/20" />
                </div>
            ))}

            {/* Now indicator */}
            {isToday(day) && <NowIndicator />}

            {/* Events */}
            {dayAppts
                .filter((a) => a.status !== 'cancelled')
                .map((apt) => (
                    <EventBlock
                        key={apt.id}
                        event={apt}
                        color={professionalColorMap.get(apt.professional_id ?? 0)}
                        onDragStart={() => setDraggingId(apt.id)}
                        onDragEnd={() => setDraggingId(null)}
                        onClick={() => setSelectedEvent(apt)}
                        isDragging={draggingId === apt.id}
                    />
                ))}
        </div>
    );
}

/* ─── Event Block ─── */

function EventBlock({
    event,
    color,
    onDragStart,
    onDragEnd,
    onClick,
    isDragging,
}: {
    event: CalendarAppointment;
    color?: (typeof PROFESSIONAL_COLORS)[0];
    onDragStart: () => void;
    onDragEnd: () => void;
    onClick: () => void;
    isDragging: boolean;
}) {
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    const startMinutes = (startDate.getHours() - HOURS[0]) * 60 + startDate.getMinutes();
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
    const top = (startMinutes / 60) * 64; // 64px = h-16 = 4rem
    const height = Math.max((durationMinutes / 60) * 64, 24);

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                onDragStart();
            }}
            onDragEnd={onDragEnd}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`absolute inset-x-1 cursor-grab overflow-hidden rounded-lg border-l-3 p-1.5 text-xs shadow-sm transition-all active:cursor-grabbing ${
                color?.bg ?? 'bg-muted'
            } ${color?.border ?? 'border-gray-400'} ${color?.text ?? ''} ${isDragging ? 'opacity-50 ring-2 ring-primary' : 'hover:shadow-md'}`}
            style={{ top: `${top}px`, height: `${height}px`, minHeight: '24px' }}
        >
            <div className="flex items-start gap-1">
                <GripVertical className="mt-0.5 size-3 shrink-0 opacity-40" />
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold leading-tight">{event.title}</p>
                    <p className="mt-0.5 truncate opacity-75">
                        {formatTime(event.start)} – {formatTime(event.end)}
                    </p>
                    {durationMinutes >= 40 && event.professional && (
                        <p className="mt-0.5 truncate opacity-60">{event.professional}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Now Indicator ─── */

function NowIndicator() {
    const now = new Date();
    const minutes = (now.getHours() - HOURS[0]) * 60 + now.getMinutes();
    if (minutes < 0 || minutes > HOURS.length * 60) return null;
    const top = (minutes / 60) * 64;

    return (
        <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: `${top}px` }}>
            <div className="flex items-center">
                <div className="size-2 rounded-full bg-red-500" />
                <div className="h-px flex-1 bg-red-500" />
            </div>
        </div>
    );
}

/* ─── Event Detail Overlay ─── */

function EventDetail({ event, onClose }: { event: CalendarAppointment; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-muted-foreground" />
                        <span>
                            {formatTime(event.start)} – {formatTime(event.end)}
                        </span>
                        <span className="text-muted-foreground">
                            ({Math.round((parseISO(event.end).getTime() - parseISO(event.start).getTime()) / 60000)} min)
                        </span>
                    </div>

                    {event.professional && (
                        <div className="flex items-center gap-2 text-sm">
                            <User className="size-4 text-muted-foreground" />
                            <span>{event.professional}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="size-4 text-muted-foreground" />
                        <span>{event.type_label || event.type}</span>
                    </div>

                    <div>
                        <Badge className={`${STATUS_STYLES[event.status] ?? ''} border-0`}>
                            {STATUS_LABELS[event.status] ?? event.status}
                        </Badge>
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <Button size="sm" asChild className="flex-1">
                        <Link href={`/appointments/${event.id}/edit`}>Editar</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild className="flex-1">
                        <Link href={`/appointments/${event.id}`}>Detalhes</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
