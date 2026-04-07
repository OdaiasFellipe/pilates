import { Head, useForm } from '@inertiajs/react';
import PatientPackagesController from '@/actions/App/Http/Controllers/PatientPackagesController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Props = {
    patients: { id: number; name: string }[];
    packages: { id: number; name: string; session_count: number; validity_days: number; price: string }[];
    professionals: { id: number; name: string }[];
};

export default function PatientPackagesCreate({ patients, packages, professionals }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: '',
        package_id: '',
        professional_id: '',
        starts_at: new Date().toISOString().slice(0, 10),
        paid_at: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(PatientPackagesController.store.url());
    };

    return (
        <>
            <Head title="Associar Pacote" />

            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">Associar Pacote ao Paciente</h1>

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
                        <Label htmlFor="package_id">Pacote *</Label>
                        <select id="package_id" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.package_id} onChange={(e) => setData('package_id', e.target.value)}>
                            <option value="">Selecione</option>
                            {packages.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.session_count} sessões)</option>)}
                        </select>
                        <InputError message={errors.package_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="professional_id">Profissional *</Label>
                        <select id="professional_id" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.professional_id} onChange={(e) => setData('professional_id', e.target.value)}>
                            <option value="">Selecione</option>
                            {professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <InputError message={errors.professional_id} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="starts_at">Início *</Label>
                            <input id="starts_at" type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.starts_at} onChange={(e) => setData('starts_at', e.target.value)} />
                            <InputError message={errors.starts_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paid_at">Pago em</Label>
                            <input id="paid_at" type="date" className="h-9 rounded-md border bg-background px-3 text-sm" value={data.paid_at} onChange={(e) => setData('paid_at', e.target.value)} />
                            <InputError message={errors.paid_at} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Salvando...' : 'Salvar vínculo'}</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
