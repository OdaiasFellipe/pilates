import { Head, Link, router } from '@inertiajs/react';
import { index, create } from '@/actions/App/Http/Controllers/ProfessionalsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Professional } from '@/types';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

type PaginatedProfessionals = {
    data: Professional[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    professionals: PaginatedProfessionals;
    filters: {
        search?: string;
        status?: string;
    };
};

export default function ProfessionalsIndex({ professionals, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            router.get(index.url(), { search, status: filters.status }, { preserveState: true, replace: true });
        },
        [search, filters.status],
    );

    const handleStatusFilter = (status: string | undefined) => {
        router.get(index.url(), { search, status }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Profissionais" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Profissionais</h1>
                        <p className="text-sm text-muted-foreground">
                            {professionals.total} profissional{professionals.total !== 1 ? 'is' : ''} cadastrado{professionals.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <PlusIcon />
                            Novo Profissional
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, CPF ou especialidade..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="outline">
                            Buscar
                        </Button>
                    </form>

                    <div className="flex gap-2">
                        {[
                            { label: 'Todos', value: undefined },
                            { label: 'Ativos', value: 'active' },
                            { label: 'Inativos', value: 'inactive' },
                        ].map(({ label, value }) => (
                            <Button
                                key={label}
                                variant={filters.status === value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter(value)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Nome</th>
                                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Especialidade</th>
                                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">E-mail</th>
                                <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">Telefone</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {professionals.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Nenhum profissional encontrado.
                                    </td>
                                </tr>
                            ) : (
                                professionals.data.map((professional) => (
                                    <tr key={professional.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{professional.name}</td>
                                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                                            {professional.specialty ?? '—'}
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                            {professional.email}
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                                            {professional.phone ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={professional.is_active ? 'default' : 'secondary'}>
                                                {professional.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/professionals/${professional.id}`}>Ver</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {professionals.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Página {professionals.current_page} de {professionals.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!professionals.prev_page_url}
                                onClick={() => professionals.prev_page_url && router.get(professionals.prev_page_url)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!professionals.next_page_url}
                                onClick={() => professionals.next_page_url && router.get(professionals.next_page_url)}
                            >
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
