import { Head, Link, router } from '@inertiajs/react';
import { create, show } from '@/actions/App/Http/Controllers/PaymentsController';
import { Button } from '@/components/ui/button';
import type { FinancialPayment } from '@/types';

type Props = {
    payments: {
        data: FinancialPayment[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

export default function PaymentsIndex({ payments }: Props) {
    return (
        <>
            <Head title="Pagamentos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Pagamentos</h1>
                        <p className="text-sm text-muted-foreground">{payments.total} pagamento(s)</p>
                    </div>
                    <Button asChild><Link href={create.url()}>Novo Pagamento</Link></Button>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Paciente</th>
                                <th className="px-4 py-3 text-left font-medium">Valor</th>
                                <th className="px-4 py-3 text-left font-medium">Método</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum pagamento encontrado.</td>
                                </tr>
                            ) : (
                                payments.data.map((payment) => (
                                    <tr key={payment.id} className="border-b last:border-0">
                                        <td className="px-4 py-3">{payment.patient?.name}</td>
                                        <td className="px-4 py-3">R$ {Number(payment.amount).toFixed(2)}</td>
                                        <td className="px-4 py-3">{payment.payment_method}</td>
                                        <td className="px-4 py-3">{payment.status}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={show.url(payment.id)}>Ver</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {payments.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Página {payments.current_page} de {payments.last_page}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={!payments.prev_page_url} onClick={() => payments.prev_page_url && router.get(payments.prev_page_url)}>Anterior</Button>
                            <Button variant="outline" size="sm" disabled={!payments.next_page_url} onClick={() => payments.next_page_url && router.get(payments.next_page_url)}>Próxima</Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
