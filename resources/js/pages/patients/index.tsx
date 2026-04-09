import { Head, Link, router } from '@inertiajs/react';
import { index, create } from '@/actions/App/Http/Controllers/PatientsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Patient } from '@/types';
import { PlusIcon, SearchIcon, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <Users className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight md:text-2xl">Pacientes</h1>
                            <p className="text-sm text-muted-foreground">
                                {patients.total} paciente{patients.total !== 1 ? 's' : ''} cadastrado{patients.total !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <Button asChild size="default" className="shrink-0">
                        <Link href={create.url()}>
                            <PlusIcon className="size-4" />
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

                    <div className="flex gap-1.5">
                        {[
                            { label: 'Todos', value: undefined },
                            { label: 'Ativos', value: 'active' },
                            { label: 'Inativos', value: 'inactive' },
                        ].map((opt) => (
                            <Button
                                key={opt.label}
                                variant={filters.status === opt.value ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleStatusFilter(opt.value)}
                                className="rounded-full"
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/40">
                            <tr>
                                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome</th>
                                <th className="hidden px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Telefone</th>
                                <th className="hidden px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">E-mail</th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-5 py-3.5" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {patients.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center">
                                        <Users className="mx-auto mb-2 size-10 text-muted-foreground/30" />
                                        <p className="text-sm text-muted-foreground">Nenhum paciente encontrado.</p>
                                    </td>
                                </tr>
                            ) : (
                                patients.data.map((patient) => (
                                    <tr key={patient.id} className="group transition-colors hover:bg-muted/30">
                                        <td className="px-5 py-3.5">
                                            <Link href={`/patients/${patient.id}`} className="block">
                                                <div className="font-medium group-hover:text-primary">{patient.name}</div>
                                                {patient.cpf && (
                                                    <div className="mt-0.5 text-xs text-muted-foreground">{patient.cpf}</div>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="hidden px-5 py-3.5 text-muted-foreground md:table-cell">
                                            {patient.phone ?? '—'}
                                        </td>
                                        <td className="hidden px-5 py-3.5 text-muted-foreground lg:table-cell">
                                            {patient.email ?? '—'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Badge variant={patient.is_active ? 'default' : 'secondary'} className="rounded-full">
                                                {patient.is_active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                                <ChevronLeft className="size-4" />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!patients.next_page_url}
                                onClick={() => patients.next_page_url && router.get(patients.next_page_url)}
                            >
                                Próxima
                                <ChevronRight className="size-4" />
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
