import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Patient } from '@/types';

type PatientWithCount = Patient & {
    appointments_count: number;
};

type Props = {
    topPatients: PatientWithCount[];
};

export default function ClinicalReportsIndex({ topPatients }: Props) {
    return (
        <>
            <Head title="Relatórios Clínicos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Relatórios Clínicos</h1>
                        <p className="text-sm text-muted-foreground">Análise de progresso e evolução dos pacientes</p>
                    </div>
                </div>

                <div className="rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Paciente</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">Agendamentos</th>
                                <th className="px-4 py-3 text-left font-medium">Telefone</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {topPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        Nenhum paciente com agendamentos encontrado.
                                    </td>
                                </tr>
                            ) : (
                                topPatients.map((patient) => (
                                    <tr key={patient.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium">{patient.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{patient.email}</td>
                                        <td className="px-4 py-3">{patient.appointments_count}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{patient.phone}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/reports/clinical/patients/${patient.id}/progress`}>Ver Progresso</Link>
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
