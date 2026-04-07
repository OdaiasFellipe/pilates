import { Head, useForm } from '@inertiajs/react';
import PaymentsController from '@/actions/App/Http/Controllers/PaymentsController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    patients: { id: number; name: string }[];
    patientPackages: { id: number; patient_id: number; patient?: { id: number; name: string } }[];
};

export default function PaymentsCreate({ patients, patientPackages }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        patient_package_id: '',
        amount: '',
        payment_method: 'pix',
        paid_at: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(PaymentsController.store.url());
    };

    return (
        <>
            <Head title="Novo Pagamento" />

            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">Novo Pagamento</h1>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="patient_id">Paciente *</Label>
                        <select id="patient_id" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.patient_id} onChange={(e) => setData('patient_id', e.target.value)}>
                            <option value="">Selecione</option>
                            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <InputError message={errors.patient_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="patient_package_id">Pacote do paciente</Label>
                        <select id="patient_package_id" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.patient_package_id} onChange={(e) => setData('patient_package_id', e.target.value)}>
                            <option value="">Nenhum</option>
                            {patientPackages.map((pp) => <option key={pp.id} value={pp.id}>#{pp.id} - {pp.patient?.name}</option>)}
                        </select>
                        <InputError message={errors.patient_package_id} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Valor *</Label>
                            <Input id="amount" type="number" min={0} step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                            <InputError message={errors.amount} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="payment_method">Método *</Label>
                            <select id="payment_method" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)}>
                                <option value="cash">Dinheiro</option>
                                <option value="credit_card">Cartão de Crédito</option>
                                <option value="debit_card">Cartão de Débito</option>
                                <option value="bank_transfer">Transferência</option>
                                <option value="pix">Pix</option>
                            </select>
                            <InputError message={errors.payment_method} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="paid_at">Pago em</Label>
                            <input id="paid_at" type="datetime-local" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.paid_at} onChange={(e) => setData('paid_at', e.target.value)} />
                            <InputError message={errors.paid_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                            <InputError message={errors.notes} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Salvando...' : 'Salvar pagamento'}</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
