import { Head, useForm } from '@inertiajs/react';
import PatientsController from '@/actions/App/Http/Controllers/PatientsController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Patient, PatientFormData } from '@/types';

type Props = {
    patient: Patient;
};

export default function EditPatient({ patient }: Props) {
    const { data, setData, put, processing, errors } = useForm<PatientFormData>({
        name: patient.name,
        cpf: patient.cpf ?? '',
        rg: patient.rg ?? '',
        birth_date: patient.birth_date ?? '',
        phone: patient.phone ?? '',
        email: patient.email ?? '',
        address: patient.address ?? {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zip: '',
        },
        health_insurance: patient.health_insurance ?? '',
        health_insurance_number: patient.health_insurance_number ?? '',
        emergency_contact: patient.emergency_contact ?? {
            name: '',
            phone: '',
            relationship: '',
        },
        notes: patient.notes ?? '',
        is_active: patient.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(PatientsController.update.url(patient.id));
    };

    return (
        <>
            <Head title={`Editar — ${patient.name}`} />

            <div className="mx-auto max-w-3xl p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Editar Paciente</h1>
                    <p className="text-sm text-muted-foreground">{patient.name}</p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Dados Pessoais */}
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Dados Pessoais</h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2 grid gap-2">
                                <Label htmlFor="name">Nome completo *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input
                                    id="cpf"
                                    placeholder="000.000.000-00"
                                    value={data.cpf}
                                    onChange={(e) => setData('cpf', e.target.value)}
                                />
                                <InputError message={errors.cpf} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="rg">RG</Label>
                                <Input
                                    id="rg"
                                    value={data.rg}
                                    onChange={(e) => setData('rg', e.target.value)}
                                />
                                <InputError message={errors.rg} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birth_date">Data de nascimento</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                />
                                <InputError message={errors.birth_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="sm:col-span-2 grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} />
                            </div>
                        </div>
                    </section>

                    {/* Endereço */}
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Endereço</h2>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2 grid gap-2">
                                <Label htmlFor="street">Rua</Label>
                                <Input
                                    id="street"
                                    value={data.address.street ?? ''}
                                    onChange={(e) => setData('address', { ...data.address, street: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="number">Número</Label>
                                <Input
                                    id="number"
                                    value={data.address.number ?? ''}
                                    onChange={(e) => setData('address', { ...data.address, number: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="neighborhood">Bairro</Label>
                                <Input
                                    id="neighborhood"
                                    value={data.address.neighborhood ?? ''}
                                    onChange={(e) => setData('address', { ...data.address, neighborhood: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={data.address.city ?? ''}
                                    onChange={(e) => setData('address', { ...data.address, city: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="state">Estado (UF)</Label>
                                <Input
                                    id="state"
                                    maxLength={2}
                                    className="uppercase"
                                    value={data.address.state ?? ''}
                                    onChange={(e) => setData('address', { ...data.address, state: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="zip">CEP</Label>
                                <Input
                                    id="zip"
                                    placeholder="00000-000"
                                    value={data.address.zip ?? ''}
                                    onChange={(e) => setData('address', { ...data.address, zip: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Convênio */}
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Convênio</h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="health_insurance">Convênio</Label>
                                <Input
                                    id="health_insurance"
                                    value={data.health_insurance}
                                    onChange={(e) => setData('health_insurance', e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="health_insurance_number">Número do convênio</Label>
                                <Input
                                    id="health_insurance_number"
                                    value={data.health_insurance_number}
                                    onChange={(e) => setData('health_insurance_number', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Contato de Emergência */}
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Contato de Emergência</h2>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2 grid gap-2">
                                <Label htmlFor="ec_name">Nome</Label>
                                <Input
                                    id="ec_name"
                                    value={data.emergency_contact.name ?? ''}
                                    onChange={(e) => setData('emergency_contact', { ...data.emergency_contact, name: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ec_phone">Telefone</Label>
                                <Input
                                    id="ec_phone"
                                    value={data.emergency_contact.phone ?? ''}
                                    onChange={(e) => setData('emergency_contact', { ...data.emergency_contact, phone: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="ec_relationship">Parentesco</Label>
                                <Input
                                    id="ec_relationship"
                                    value={data.emergency_contact.relationship ?? ''}
                                    onChange={(e) => setData('emergency_contact', { ...data.emergency_contact, relationship: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Observações */}
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Observações</h2>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas clínicas / Histórico</Label>
                            <textarea
                                id="notes"
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </section>

                    {/* Status */}
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Status</h2>
                        <div className="flex items-center gap-3">
                            <input
                                id="is_active"
                                type="checkbox"
                                className="size-4 rounded border-input"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <Label htmlFor="is_active">Paciente ativo</Label>
                        </div>
                    </section>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

EditPatient.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pacientes', href: '/patients' },
        { title: 'Editar', href: '#' },
    ],
};
