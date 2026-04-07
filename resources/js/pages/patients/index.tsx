import { Head, Link, router } from '@inertiajs/react';
import { index, create } from '@/actions/App/Http/Controllers/PatientsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Patient } from '@/types';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

type PaginatedPatients = {
    data: Patient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    patients: PaginatedPatients;
    filters: {
        search?: string;
        status?: string;
    };
};

export default function PatientsIndex({ patients, filters }: Props) {
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
            <Head title="Pacientes" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Pacientes</h1>
                        <p className="text-sm text-muted-foreground">
                            {patients.total} paciente{patients.total !== 1 ? 's' : ''} cadastrado{patients.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <PlusIcon />
                            Novo Paciente
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, CPF ou telefone..."
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
                        <Button
                            variant={!filters.status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusFilter(undefined)}
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filters.status === 'active' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusFilter('active')}
                        >
                            Ativos
                        </Button>
                        <Button
                            variant={filters.status === 'inactive' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusFilter('inactive')}
                        >
                            Inativos
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Telefone</th>
                                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">E-mail</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {patients.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                                        Nenhum paciente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                patients.data.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{patient.name}</div>
                                            {patient.cpf && (
                                                <div className="text-xs text-muted-foreground">{patient.cpf}</div>
                                            )}
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                            {patient.phone ?? '—'}
                                        </td>
                                        <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                                            {patient.email ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={patient.is_active ? 'default' : 'secondary'}>
                                                {patient.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/patients/${patient.id}`}>Ver</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {patients.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Página {patients.current_page} de {patients.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!patients.prev_page_url}
                                onClick={() => patients.prev_page_url && router.get(patients.prev_page_url)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!patients.next_page_url}
                                onClick={() => patients.next_page_url && router.get(patients.next_page_url)}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

PatientsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pacientes', href: '/patients' },
    ],
};
