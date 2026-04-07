import { Head } from '@inertiajs/react';
import type { FinancialPatientPackage } from '@/types';

type Props = {
    patientPackage: FinancialPatientPackage & {
        payments?: { id: number; amount: string; status: string; paid_at: string | null }[];
    };
};

export default function PatientPackagesShow({ patientPackage }: Props) {
    return (
        <>
            <Head title={`Pacote do paciente #${patientPackage.id}`} />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold">Pacote do Paciente</h1>

                <div className="rounded-lg border p-5 space-y-2 text-sm">
                    <p><span className="font-medium">Paciente:</span> {patientPackage.patient?.name}</p>
                    <p><span className="font-medium">Pacote:</span> {patientPackage.package?.name}</p>
                    <p><span className="font-medium">Profissional:</span> {patientPackage.professional?.name}</p>
                    <p><span className="font-medium">Sessões:</span> {patientPackage.sessions_used}/{patientPackage.sessions_total}</p>
                    <p><span className="font-medium">Período:</span> {patientPackage.starts_at} até {patientPackage.expires_at}</p>
                    <p><span className="font-medium">Status:</span> {patientPackage.status}</p>
                </div>

                <div className="rounded-lg border p-5">
                    <h2 className="mb-3 font-medium">Pagamentos</h2>
                    {(patientPackage.payments ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {patientPackage.payments?.map((payment) => (
                                <li key={payment.id} className="rounded border p-2">
                                    R$ {Number(payment.amount).toFixed(2)} • {payment.status} • {payment.paid_at ?? 'pendente'}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}
