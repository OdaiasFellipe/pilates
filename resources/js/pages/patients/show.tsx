import { Head, Link, router } from '@inertiajs/react';
import { edit, destroy } from '@/actions/App/Http/Controllers/PatientsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {
    Patient,
    PatientAppointment,
    PatientEvaluation,
    PatientTreatmentPlan,
    PatientSession,
    PatientPackage,
    PatientDocument,
} from '@/types';
import { CalendarIcon, ClipboardIcon, CreditCardIcon, FileIcon, MailIcon, MapPinIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
    patient: Patient;
};

const TABS = ['dados', 'agendamentos', 'clinico', 'financeiro', 'documentos'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
    dados: 'Dados',
    agendamentos: 'Agendamentos',
    clinico: 'Clínico',
    financeiro: 'Financeiro',
    documentos: 'Documentos',
};

const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    missed: 'Faltou',
};

const APPOINTMENT_TYPE_LABEL: Record<string, string> = {
    pilates: 'Pilates',
    physiotherapy: 'Fisioterapia',
    evaluation: 'Avaliação',
};

const DOCUMENT_TYPE_LABEL: Record<string, string> = {
    evaluation_form: 'Ficha de Avaliação',
    treatment_plan: 'Plano de Tratamento',
    signed_consent: 'Consentimento',
    progress_photo: 'Foto',
    exercise_guide: 'Guia de Exercícios',
    medical_report: 'Relatório',
    other: 'Outro',
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

function EmptyState({ message }: { message: string }) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>;
}

export default function ShowPatient({ patient }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('dados');

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

            <div className="mx-auto max-w-5xl p-6 space-y-6">
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

                {/* Tabs */}
                <div className="border-b border-border">
                    <nav className="-mb-px flex gap-6 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                                    activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {TAB_LABELS[tab]}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab: Dados */}
                {activeTab === 'dados' && (
                    <div className="space-y-6">
                        <Card title="Dados Pessoais" icon={<UserIcon className="size-4" />}>
                            <dl className="divide-y divide-border">
                                <InfoRow label="Nome" value={patient.name} />
                                <InfoRow label="CPF" value={patient.cpf} />
                                <InfoRow label="RG" value={patient.rg} />
                                <InfoRow label="Nascimento" value={patient.birth_date ?? undefined} />
                                <InfoRow label="Convênio" value={patient.health_insurance} />
                                <InfoRow label="Nº Convênio" value={patient.health_insurance_number} />
                            </dl>
                        </Card>

                        <Card title="Contato" icon={<PhoneIcon className="size-4" />}>
                            <dl className="divide-y divide-border">
                                <InfoRow label="Telefone" value={patient.phone} />
                                <InfoRow label="E-mail" value={patient.email} />
                                <InfoRow label="Endereço" value={addressFormatted} />
                            </dl>
                        </Card>

                        {patient.emergency_contact && (
                            <Card title="Contato de Emergência" icon={<PhoneIcon className="size-4" />}>
                                <dl className="divide-y divide-border">
                                    <InfoRow label="Nome" value={patient.emergency_contact.name} />
                                    <InfoRow label="Telefone" value={patient.emergency_contact.phone} />
                                    <InfoRow label="Parentesco" value={patient.emergency_contact.relationship} />
                                </dl>
                            </Card>
                        )}

                        {patient.notes && (
                            <Card title="Notas / Histórico" icon={<ClipboardIcon className="size-4" />}>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.notes}</p>
                            </Card>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Cadastrado em {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                )}

                {/* Tab: Agendamentos */}
                {activeTab === 'agendamentos' && (
                    <div>
                        <div className="mb-4 flex justify-end">
                            <Button size="sm" asChild>
                                <Link href={`/appointments/create?patient_id=${patient.id}`}>Novo Agendamento</Link>
                            </Button>
                        </div>
                        {!patient.appointments?.length ? (
                            <EmptyState message="Nenhum agendamento encontrado" />
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40">
                                        <tr className="text-left text-xs text-muted-foreground">
                                            <th className="px-4 py-3 font-medium">Data/Hora</th>
                                            <th className="px-4 py-3 font-medium">Tipo</th>
                                            <th className="px-4 py-3 font-medium">Profissional</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {patient.appointments.map((apt) => (
                                            <tr key={apt.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    {new Date(apt.starts_at).toLocaleString('pt-BR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="px-4 py-3">{APPOINTMENT_TYPE_LABEL[apt.type] || apt.type}</td>
                                                <td className="px-4 py-3">{apt.professional?.name ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={apt.status} labels={APPOINTMENT_STATUS_LABEL} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Clínico */}
                {activeTab === 'clinico' && (
                    <div className="space-y-6">
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/clinical/evaluations/create?patient_id=${patient.id}`}>Nova Avaliação</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href={`/clinical/treatment-plans/create?patient_id=${patient.id}`}>Plano de Tratamento</Link>
                            </Button>
                        </div>

                        {/* Avaliações */}
                        <Card title="Avaliações" icon={<ClipboardIcon className="size-4" />}>
                            {!patient.evaluations?.length ? (
                                <EmptyState message="Nenhuma avaliação registrada" />
                            ) : (
                                <div className="space-y-3">
                                    {patient.evaluations.map((ev) => (
                                        <Link
                                            key={ev.id}
                                            href={`/clinical/evaluations/${ev.id}`}
                                            className="block rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{ev.chief_complaint ?? 'Avaliação'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(ev.evaluated_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            </div>
                                            {ev.professional && (
                                                <p className="mt-1 text-xs text-muted-foreground">{ev.professional.name}</p>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Sessões */}
                        <Card title="Sessões Recentes" icon={<CalendarIcon className="size-4" />}>
                            {!patient.sessions?.length ? (
                                <EmptyState message="Nenhuma sessão registrada" />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/40">
                                            <tr className="text-left text-xs text-muted-foreground">
                                                <th className="px-3 py-2 font-medium">Data</th>
                                                <th className="px-3 py-2 font-medium">Tipo</th>
                                                <th className="px-3 py-2 font-medium">Profissional</th>
                                                <th className="px-3 py-2 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {patient.sessions.map((s) => (
                                                <tr key={s.id} className="hover:bg-muted/30">
                                                    <td className="px-3 py-2">
                                                        {new Date(s.attended_at).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="px-3 py-2">{APPOINTMENT_TYPE_LABEL[s.type] || s.type}</td>
                                                    <td className="px-3 py-2">{s.professional?.name ?? '—'}</td>
                                                    <td className="px-3 py-2">
                                                        <StatusBadge status={s.status} labels={APPOINTMENT_STATUS_LABEL} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* Tab: Financeiro */}
                {activeTab === 'financeiro' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <Button size="sm" asChild>
                                <Link href={`/financial/patient-packages/create?patient_id=${patient.id}`}>
                                    Vincular Pacote
                                </Link>
                            </Button>
                        </div>

                        {!patient.patient_packages?.length ? (
                            <EmptyState message="Nenhum pacote vinculado" />
                        ) : (
                            <div className="space-y-4">
                                {patient.patient_packages.map((pp) => (
                                    <Link
                                        key={pp.id}
                                        href={`/financial/patient-packages/${pp.id}`}
                                        className="block rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{pp.package?.name ?? `Pacote #${pp.id}`}</p>
                                            <StatusBadge
                                                status={pp.status}
                                                labels={{ active: 'Ativo', expired: 'Expirado', cancelled: 'Cancelado', completed: 'Concluído' }}
                                            />
                                        </div>
                                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{pp.sessions_used}/{pp.sessions_total} sessões</span>
                                            {pp.expires_at && (
                                                <span>Vence {new Date(pp.expires_at).toLocaleDateString('pt-BR')}</span>
                                            )}
                                        </div>
                                        {pp.payments && pp.payments.length > 0 && (
                                            <div className="mt-2 flex gap-2 flex-wrap">
                                                {pp.payments.map((pay) => (
                                                    <span key={pay.id} className="text-xs text-muted-foreground">
                                                        R$ {Number(pay.amount).toFixed(2)} · {pay.status}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Documentos */}
                {activeTab === 'documentos' && (
                    <div>
                        <div className="mb-4 flex justify-end">
                            <Button size="sm" asChild>
                                <Link href={`/patients/${patient.id}/documents/create`}>
                                    Novo Documento
                                </Link>
                            </Button>
                        </div>

                        {!patient.documents?.length ? (
                            <EmptyState message="Nenhum documento cadastrado" />
                        ) : (
                            <div className="space-y-2 rounded-lg border border-border">
                                {patient.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/30"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{doc.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {DOCUMENT_TYPE_LABEL[doc.type] || doc.type} ·{' '}
                                                {(doc.file_size / 1024).toFixed(0)} KB ·{' '}
                                                {doc.uploadedBy?.name} ·{' '}
                                                {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <a
                                            href={`/patients/documents/${doc.id}/download`}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                {icon}
                <h2 className="text-base font-medium text-foreground">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
    const statusColors: Record<string, string> = {
        confirmed: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
        active: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
        completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
        missed: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
        expired: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status] ?? 'bg-muted text-muted-foreground'}`}>
            {labels[status] ?? status}
        </span>
    );
}

ShowPatient.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pacientes', href: '/patients' },
        { title: 'Paciente', href: '#' },
    ],
};

