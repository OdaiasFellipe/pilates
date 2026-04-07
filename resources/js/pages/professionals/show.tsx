import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Professional } from '@/types';
import { EditIcon, ArrowLeftIcon } from 'lucide-react';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const;

type Props = {
    professional: Professional;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value ?? '—'}</dd>
        </div>
    );
}

export default function ShowProfessional({ professional }: Props) {
    const handleDeactivate = () => {
        router.delete(`/professionals/${professional.id}`, {
            onBefore: () => confirm(`Desativar ${professional.name}?`),
        });
    };

    return (
        <>
            <Head title={professional.name} />

            <div className="mx-auto max-w-3xl p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/professionals">
                                <ArrowLeftIcon />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold">{professional.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={professional.is_active ? 'default' : 'secondary'}>
                                    {professional.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                                {professional.specialty && (
                                    <span className="text-sm text-muted-foreground">{professional.specialty}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/professionals/${professional.id}/edit`}>
                                <EditIcon />
                                Editar
                            </Link>
                        </Button>
                        {professional.is_active && (
                            <Button variant="destructive" size="sm" onClick={handleDeactivate}>
                                Desativar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Dados Pessoais */}
                <div className="rounded-lg border p-5 space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dados Pessoais</h2>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <InfoRow label="CPF" value={professional.cpf} />
                        <InfoRow label="Telefone" value={professional.phone} />
                        <InfoRow label="E-mail" value={professional.email} />
                        <InfoRow label="Especialidade" value={professional.specialty} />
                    </dl>
                </div>

                {/* Horários de Trabalho */}
                {professional.working_hours && professional.working_hours.length > 0 && (
                    <div className="rounded-lg border p-5 space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Horários de Trabalho</h2>
                        <div className="space-y-3">
                            {professional.working_hours.map((wh) => (
                                <div key={wh.day} className="flex items-start gap-4">
                                    <span className="w-24 text-sm font-medium">{DAYS[wh.day]}</span>
                                    <div className="flex flex-wrap gap-2">
                                        {wh.slots.map((slot, i) => (
                                            <span
                                                key={i}
                                                className="rounded bg-muted px-2 py-0.5 text-xs"
                                            >
                                                {slot.start} – {slot.end}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
