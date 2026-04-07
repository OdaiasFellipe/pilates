import { Head } from '@inertiajs/react';
import type { FinancialPayment } from '@/types';

type Props = {
    payment: FinancialPayment;
};

export default function PaymentsShow({ payment }: Props) {
    return (
        <>
            <Head title={`Pagamento #${payment.id}`} />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold">Pagamento #{payment.id}</h1>

                <div className="rounded-lg border p-5 space-y-2 text-sm">
                    <p><span className="font-medium">Paciente:</span> {payment.patient?.name}</p>
                    <p><span className="font-medium">Valor:</span> R$ {Number(payment.amount).toFixed(2)}</p>
                    <p><span className="font-medium">Método:</span> {payment.payment_method}</p>
                    <p><span className="font-medium">Status:</span> {payment.status}</p>
                    <p><span className="font-medium">Pago em:</span> {payment.paid_at ?? 'Não pago'}</p>
                    <p><span className="font-medium">Observações:</span> {payment.notes || '—'}</p>
                </div>
            </div>
        </>
    );
}
