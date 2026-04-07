import { Head, Link } from '@inertiajs/react';
import { show as showTreatmentPlan } from '@/actions/App/Http/Controllers/TreatmentPlansController';
import { Button } from '@/components/ui/button';
import type { ClinicalSession } from '@/types';

type Props = { session: ClinicalSession };

export default function ShowSession({ session }: Props) {
    return (
        <>
            <Head title="Evolução Clínica" />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Evolução Clínica</h1>
                        <p className="text-sm text-muted-foreground">{session.patient?.name} • {session.professional?.name}</p>
                    </div>
                    {session.treatmentPlan && (
                        <Button asChild>
                            <Link href={showTreatmentPlan.url(session.treatmentPlan.id)}>Ver Plano</Link>
                        </Button>
                    )}
                </div>
                <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                    <div><p className="text-xs text-muted-foreground">Atendimento</p><p className="text-sm">{new Date(session.attended_at).toLocaleString('pt-BR')}</p></div>
                    <div><p className="text-xs text-muted-foreground">Escala de dor</p><p className="text-sm">{session.pain_scale ?? '—'}</p></div>
                    <div className="md:col-span-2"><p className="text-xs text-muted-foreground">Evolução</p><p className="text-sm whitespace-pre-wrap">{session.evolution_notes}</p></div>
                </div>
                <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                    <div><p className="text-xs text-muted-foreground">S - Subjetivo</p><p className="text-sm whitespace-pre-wrap">{session.soap_note?.subjective || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">O - Objetivo</p><p className="text-sm whitespace-pre-wrap">{session.soap_note?.objective || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">A - Avaliação</p><p className="text-sm whitespace-pre-wrap">{session.soap_note?.assessment || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">P - Plano</p><p className="text-sm whitespace-pre-wrap">{session.soap_note?.plan || '—'}</p></div>
                </div>
                <div className="rounded-xl border p-5">
                    <p className="text-xs text-muted-foreground">Exercícios</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                        {(session.exercises ?? []).length === 0 ? <li>Sem exercícios registrados.</li> : session.exercises?.map((exercise) => <li key={exercise}>{exercise}</li>)}
                    </ul>
                </div>
            </div>
        </>
    );
}
