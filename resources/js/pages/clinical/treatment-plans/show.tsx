import { Head, Link } from '@inertiajs/react';
import { create as createSession } from '@/actions/App/Http/Controllers/SessionsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TreatmentPlan } from '@/types';

type Props = { treatmentPlan: TreatmentPlan };

const STATUS_LABELS: Record<string, string> = {
    active: 'Ativo',
    completed: 'Concluido',
    cancelled: 'Cancelado',
};

export default function ShowTreatmentPlan({ treatmentPlan }: Props) {
    return (
        <>
            <Head title="Plano de Tratamento" />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Plano de Tratamento</h1>
                        <p className="text-sm text-muted-foreground">{treatmentPlan.patient?.name} • {treatmentPlan.professional?.name}</p>
                    </div>
                    <Button asChild>
                        <Link href={createSession.url()}>Nova Evolução</Link>
                    </Button>
                </div>
                <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                    <div><p className="text-xs text-muted-foreground">Status</p><Badge>{STATUS_LABELS[treatmentPlan.status]}</Badge></div>
                    <div><p className="text-xs text-muted-foreground">Vigência</p><p className="text-sm">{treatmentPlan.started_at} até {treatmentPlan.expires_at || 'indefinido'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Diagnóstico</p><p className="text-sm whitespace-pre-wrap">{treatmentPlan.diagnosis}</p></div>
                    <div><p className="text-xs text-muted-foreground">Objetivos</p><p className="text-sm whitespace-pre-wrap">{treatmentPlan.goals}</p></div>
                    <div className="md:col-span-2"><p className="text-xs text-muted-foreground">Observações</p><p className="text-sm whitespace-pre-wrap">{treatmentPlan.observations || '—'}</p></div>
                </div>
                <div className="rounded-xl border p-5">
                    <h2 className="mb-4 text-base font-medium">Sessões vinculadas</h2>
                    <div className="space-y-3">
                        {(treatmentPlan.sessions ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhuma sessão vinculada ainda.</p>
                        ) : (
                            treatmentPlan.sessions?.map((session) => (
                                <div key={session.id} className="rounded-lg border p-3">
                                    <p className="text-sm font-medium">Sessão #{session.id}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(session.attended_at).toLocaleString('pt-BR')} • Dor: {session.pain_scale ?? '—'}</p>
                                    <p className="mt-2 text-sm line-clamp-3">{session.evolution_notes}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
