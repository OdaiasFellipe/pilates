import { Head, Link } from '@inertiajs/react';
import { edit, index } from '@/actions/App/Http/Controllers/PackagesController';
import { Button } from '@/components/ui/button';
import type { FinancialPackage } from '@/types';

type Props = {
    package: FinancialPackage & {
        patient_packages?: { id: number; patient?: { name: string } }[];
    };
};

export default function PackagesShow({ package: pkg }: Props) {
    return (
        <>
            <Head title={pkg.name} />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{pkg.name}</h1>
                        <p className="text-sm text-muted-foreground">{pkg.session_count} sessões • validade {pkg.validity_days} dias</p>
                    </div>
                    <Button asChild><Link href={edit.url(pkg.id)}>Editar</Link></Button>
                </div>

                <div className="rounded-lg border p-5 space-y-2 text-sm">
                    <p><span className="font-medium">Preço:</span> R$ {Number(pkg.price).toFixed(2)}</p>
                    <p><span className="font-medium">Status:</span> {pkg.is_active ? 'Ativo' : 'Inativo'}</p>
                    <p><span className="font-medium">Descrição:</span> {pkg.description || '—'}</p>
                </div>

                <div className="rounded-lg border p-5">
                    <h2 className="mb-3 font-medium">Pacientes vinculados</h2>
                    {(pkg.patient_packages ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum vínculo ainda.</p>
                    ) : (
                        <ul className="list-disc space-y-1 pl-5 text-sm">
                            {pkg.patient_packages?.map((pp) => <li key={pp.id}>{pp.patient?.name ?? `Vínculo #${pp.id}`}</li>)}
                        </ul>
                    )}
                </div>

                <Button variant="outline" asChild><Link href={index.url()}>Voltar</Link></Button>
            </div>
        </>
    );
}
