import { Head, Link } from '@inertiajs/react';
import { dashboard, index as paymentsIndex, create as paymentsCreate } from '@/actions/App/Http/Controllers/PaymentsController';
import { index as packagesIndex } from '@/actions/App/Http/Controllers/PackagesController';
import { Button } from '@/components/ui/button';

type Props = {
    totalRevenue: string;
    pendingAmount: string;
    activePatientPackages: number;
    activePackages: number;
    recentPayments: Array<{
        id: number;
        patient?: { name: string };
        amount: string;
        status: string;
        created_at: string;
    }>;
};

export default function FinancialDashboard({ totalRevenue, pendingAmount, activePatientPackages, activePackages, recentPayments }: Props) {
    const formatCurrency = (value: string | number): string => {
        return `R$ ${Number(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
            case 'pending':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30';
            case 'overdue':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30';
        }
    };

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            paid: 'Pago',
            pending: 'Pendente',
            overdue: 'Vencido',
            cancelled: 'Cancelado',
        };
        return labels[status.toLowerCase()] || status;
    };

    return (
        <>
            <Head title="Financeiro" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Financeiro</h1>
                        <p className="text-sm text-muted-foreground">Visão geral do módulo financeiro</p>
                    </div>
                    <Button asChild>
                        <Link href={paymentsCreate.url()}>Novo Pagamento</Link>
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Revenue */}
                    <div className="rounded-lg border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Receita Total</p>
                                <p className="mt-2 text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-950">
                                <svg className="size-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Pending Amount */}
                    <div className="rounded-lg border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pendente</p>
                                <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(pendingAmount)}</p>
                            </div>
                            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-950">
                                <svg className="size-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Active Patient Packages */}
                    <div className="rounded-lg border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pacotes Ativos</p>
                                <p className="mt-2 text-2xl font-bold">{activePatientPackages}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950">
                                <svg className="size-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 5v10m8-10v10" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Available Packages */}
                    <div className="rounded-lg border bg-card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pacotes Disponíveis</p>
                                <p className="mt-2 text-2xl font-bold">{activePackages}</p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-950">
                                <svg className="size-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="rounded-lg border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Pagamentos Recentes</h2>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={paymentsIndex.url()}>Ver Todos</Link>
                        </Button>
                    </div>

                    {recentPayments.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">Nenhum pagamento registrado</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">Paciente</th>
                                        <th className="px-4 py-3 text-left font-medium">Valor</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPayments.map((payment) => (
                                        <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3">{payment.patient?.name || '—'}</td>
                                            <td className="px-4 py-3 font-medium">{formatCurrency(payment.amount)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                    {getStatusLabel(payment.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid gap-3 sm:grid-cols-3">
                    <Button className="w-full" asChild>
                        <Link href={packagesIndex.url()}>Gerenciar Pacotes</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={paymentsIndex.url()}>Ver Pagamentos</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
