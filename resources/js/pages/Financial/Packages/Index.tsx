import { Head, Link } from '@inertiajs/react';
import { create, show, edit } from '@/actions/App/Http/Controllers/PackagesController';
import { Button } from '@/components/ui/button';
import type { FinancialPackage } from '@/types';

type Props = {
    packages: FinancialPackage[];
};

export default function PackagesIndex({ packages }: Props) {
    return (
        <>
            <Head title="Pacotes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Pacotes</h1>
                        <p className="text-sm text-muted-foreground">{packages.length} pacote(s) cadastrado(s)</p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>Novo Pacote</Link>
                    </Button>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Nome</th>
                                <th className="px-4 py-3 text-left font-medium">Sessões</th>
                                <th className="px-4 py-3 text-left font-medium">Preço</th>
                                <th className="px-4 py-3 text-left font-medium">Validade</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {packages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum pacote encontrado.</td>
                                </tr>
                            ) : (
                                packages.map((pkg) => (
                                    <tr key={pkg.id} className="border-b last:border-0">
                                        <td className="px-4 py-3 font-medium">{pkg.name}</td>
                                        <td className="px-4 py-3">{pkg.session_count}</td>
                                        <td className="px-4 py-3">R$ {Number(pkg.price).toFixed(2)}</td>
                                        <td className="px-4 py-3">{pkg.validity_days} dias</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={show.url(pkg.id)}>Ver</Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={edit.url(pkg.id)}>Editar</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
