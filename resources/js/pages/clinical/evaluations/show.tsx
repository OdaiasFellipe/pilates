import { Head, Link } from '@inertiajs/react';
import { create as createTreatmentPlan } from '@/actions/App/Http/Controllers/TreatmentPlansController';
import { Button } from '@/components/ui/button';
import type { Evaluation } from '@/types';

type Props = { evaluation: Evaluation };

export default function ShowEvaluation({ evaluation }: Props) {
    return (
        <>
            <Head title="Avaliação" />
            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Avaliação Inicial</h1>
                        <p className="text-sm text-muted-foreground">{evaluation.patient?.name} • {evaluation.professional?.name}</p>
                    </div>
                    <Button asChild>
                        <Link href={createTreatmentPlan.url()}>Criar Plano</Link>
                    </Button>
                </div>
                <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-2">
                    <div><p className="text-xs text-muted-foreground">Queixa principal</p><p className="text-sm whitespace-pre-wrap">{evaluation.chief_complaint}</p></div>
                    <div><p className="text-xs text-muted-foreground">Histórico clínico</p><p className="text-sm whitespace-pre-wrap">{evaluation.medical_history || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Diagnóstico</p><p className="text-sm whitespace-pre-wrap">{evaluation.diagnosis || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Objetivos</p><p className="text-sm whitespace-pre-wrap">{evaluation.goals || '—'}</p></div>
                </div>
                <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-3">
                    <div><p className="text-xs text-muted-foreground">Postura</p><p className="text-sm whitespace-pre-wrap">{evaluation.physical_exam?.posture || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Mobilidade</p><p className="text-sm whitespace-pre-wrap">{evaluation.physical_exam?.mobility || '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground">Observações</p><p className="text-sm whitespace-pre-wrap">{evaluation.physical_exam?.observations || '—'}</p></div>
                </div>
            </div>
        </>
    );
}
