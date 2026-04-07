import { Head, Link, useForm } from '@inertiajs/react';
import { update, index } from '@/actions/App/Http/Controllers/PackagesController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FinancialPackage } from '@/types';

type Props = {
    package: FinancialPackage;
};

export default function PackagesEdit({ package: pkg }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: pkg.name,
        description: pkg.description ?? '',
        session_count: pkg.session_count,
        price: pkg.price,
        validity_days: pkg.validity_days,
        is_active: pkg.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url(pkg.id));
    };

    return (
        <>
            <Head title={`Editar ${pkg.name}`} />

            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-6 text-2xl font-semibold">Editar Pacote</h1>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <textarea id="description" className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="session_count">Sessões *</Label>
                            <Input id="session_count" type="number" min={1} value={data.session_count} onChange={(e) => setData('session_count', Number(e.target.value))} />
                            <InputError message={errors.session_count} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Preço *</Label>
                            <Input id="price" type="number" min={0} step="0.01" value={data.price} onChange={(e) => setData('price', e.target.value)} />
                            <InputError message={errors.price} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="validity_days">Validade (dias) *</Label>
                            <Input id="validity_days" type="number" min={1} value={data.validity_days} onChange={(e) => setData('validity_days', Number(e.target.value))} />
                            <InputError message={errors.validity_days} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input id="is_active" type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                        <Label htmlFor="is_active">Pacote ativo</Label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Salvando...' : 'Salvar'}</Button>
                        <Button variant="outline" asChild><Link href={index.url()}>Cancelar</Link></Button>
                    </div>
                </form>
            </div>
        </>
    );
}
