import { Head, Link, router } from '@inertiajs/react';
import { edit, destroy } from '@/actions/App/Http/Controllers/PatientsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Patient } from '@/types';
import { CalendarIcon, MailIcon, MapPinIcon, PhoneIcon, UserIcon } from 'lucide-react';

type Props = {
    patient: Patient;
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-3 gap-2 py-2 text-sm">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd className="col-span-2">{value}</dd>
        </div>
    );
}

export default function ShowPatient({ patient }: Props) {
    const handleDelete = () => {
        if (confirm(`Deseja remover o paciente "${patient.name}"?`)) {
            router.delete(destroy.url(patient.id));
        }
    };

    const address = patient.address;
    const addressFormatted = address
        ? [address.street, address.number, address.neighborhood, address.city, address.state, address.zip]
              .filter(Boolean)
              .join(', ')
        : null;

    return (
        <>
            <Head title={patient.name} />

            <div className="mx-auto max-w-3xl p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">{patient.name}</h1>
                            <Badge variant={patient.is_active ? 'default' : 'secondary'}>
                                {patient.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                        {patient.cpf && (
                            <p className="text-sm text-muted-foreground">CPF: {patient.cpf}</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={edit.url(patient.id)}>Editar</Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            Remover
                        </Button>
                    </div>
                </div>

                {/* Dados Pessoais */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <UserIcon className="size-4 text-muted-foreground" />
                        <h2 className="text-base font-medium">Dados Pessoais</h2>
                    </div>
                    <dl className="divide-y divide-border">
                        <InfoRow label="Nome" value={patient.name} />
                        <InfoRow label="CPF" value={patient.cpf} />
                        <InfoRow label="RG" value={patient.rg} />
                        <InfoRow label="Nascimento" value={patient.birth_date ?? undefined} />
                        <InfoRow label="Convênio" value={patient.health_insurance} />
                        <InfoRow label="Nº Convênio" value={patient.health_insurance_number} />
                    </dl>
                </div>

                {/* Contato */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <PhoneIcon className="size-4 text-muted-foreground" />
                        <h2 className="text-base font-medium">Contato</h2>
                    </div>
                    <dl className="divide-y divide-border">
                        <InfoRow label="Telefone" value={patient.phone} />
                        <InfoRow label="E-mail" value={patient.email} />
                        <InfoRow label="Endereço" value={addressFormatted} />
                    </dl>
                </div>

                {/* Contato de Emergência */}
                {patient.emergency_contact && (
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <PhoneIcon className="size-4 text-muted-foreground" />
                            <h2 className="text-base font-medium">Contato de Emergência</h2>
                        </div>
                        <dl className="divide-y divide-border">
                            <InfoRow label="Nome" value={patient.emergency_contact.name} />
                            <InfoRow label="Telefone" value={patient.emergency_contact.phone} />
                            <InfoRow label="Parentesco" value={patient.emergency_contact.relationship} />
                        </dl>
                    </div>
                )}

                {/* Notas */}
                {patient.notes && (
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5">
                        <h2 className="mb-2 text-base font-medium">Notas / Histórico</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.notes}</p>
                    </div>
                )}

                {/* Cadastrado em */}
                <p className="text-xs text-muted-foreground">
                    Cadastrado em {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                </p>
            </div>
        </>
    );
}

ShowPatient.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pacientes', href: '/patients' },
        { title: 'Paciente', href: '#' },
    ],
};
