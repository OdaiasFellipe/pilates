import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Patient, PatientProgressReport } from '@/types';

type Props = {
    patient: Patient;
    evaluations: Array<{
        id: number;
        chief_complaint: string;
        diagnosis: string;
        goals: string;
        evaluated_at: string;
    }>;
    sessions: Array<{
        id: number;
        professional?: { name: string };
        evolution_notes: string;
        pain_scale: number;
        attended_at: string;
    }>;
    attendanceRate: number;
};

export default function PatientProgress({ patient, evaluations, sessions, attendanceRate }: Props) {
    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const formatDateTime = (date: string): string => {
        return new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Head title={`Progresso Clínico - ${patient.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{patient.name}</h1>
                        <p className="text-sm text-muted-foreground">{patient.email} • {patient.phone}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/reports/clinical">Voltar</Link>
                    </Button>
                </div>

                {/* KPI */}
                <div className="rounded-lg border bg-card p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Taxa de Comparecimento</p>
                            <p className="mt-2 text-3xl font-bold">{attendanceRate.toFixed(1)}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Avaliações</p>
                            <p className="mt-2 text-3xl font-bold">{evaluations.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sessões Realizadas</p>
                            <p className="mt-2 text-3xl font-bold">{sessions.length}</p>
                        </div>
                    </div>
                </div>

                {/* Evaluations */}
                <div className="rounded-lg border bg-card p-5">
                    <h2 className="mb-4 text-lg font-semibold">Avaliações</h2>
                    {evaluations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
                    ) : (
                        <div className="space-y-4">
                            {evaluations.map((eval_) => (
                                <div key={eval_.id} className="rounded border p-3 bg-muted/50">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="font-medium text-sm">{eval_.chief_complaint}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(eval_.evaluated_at)}</p>
                                    </div>
                                    <p className="text-sm"><span className="font-medium">Diagnóstico:</span> {eval_.diagnosis}</p>
                                    <p className="text-sm"><span className="font-medium">Objetivos:</span> {eval_.goals}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sessions */}
                <div className="rounded-lg border bg-card p-5">
                    <h2 className="mb-4 text-lg font-semibold">Sessões Clínicas</h2>
                    {sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma sessão realizada.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-2 text-left font-medium">Data</th>
                                        <th className="px-4 py-2 text-left font-medium">Profissional</th>
                                        <th className="px-4 py-2 text-left font-medium">Escala de Dor</th>
                                        <th className="px-4 py-2 text-left font-medium">Notas de Evolução</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((session) => (
                                        <tr key={session.id} className="border-b last:border-0">
                                            <td className="px-4 py-2">{formatDateTime(session.attended_at)}</td>
                                            <td className="px-4 py-2">{session.professional?.name}</td>
                                            <td className="px-4 py-2">
                                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                    {session.pain_scale}/10
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 max-w-xs truncate text-muted-foreground">{session.evolution_notes || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
