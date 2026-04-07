import { Head, Link, useForm } from '@inertiajs/react';
import ProfessionalsController from '@/actions/App/Http/Controllers/ProfessionalsController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Professional, ProfessionalFormData, WorkingHourSlot } from '@/types';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

type Props = {
    professional: Professional;
};

export default function EditProfessional({ professional }: Props) {
    const { data, setData, put, processing, errors } = useForm<ProfessionalFormData>({
        name: professional.name,
        email: professional.email,
        password: '',
        password_confirmation: '',
        cpf: professional.cpf ?? '',
        phone: professional.phone ?? '',
        specialty: professional.specialty ?? '',
        working_hours: professional.working_hours ?? [],
        is_active: professional.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(ProfessionalsController.update.url({ professional: professional.id }));
    };

    const toggleDay = (day: WorkingHourSlot['day']) => {
        const existing = data.working_hours.find((wh) => wh.day === day);
        if (existing) {
            setData('working_hours', data.working_hours.filter((wh) => wh.day !== day));
        } else {
            const updated = [...data.working_hours, { day, slots: [{ start: '08:00', end: '17:00' }] }];
            updated.sort((a, b) => a.day - b.day);
            setData('working_hours', updated);
        }
    };

    const addSlot = (day: WorkingHourSlot['day']) => {
        setData(
            'working_hours',
            data.working_hours.map((wh) =>
                wh.day === day ? { ...wh, slots: [...wh.slots, { start: '08:00', end: '12:00' }] } : wh,
            ),
        );
    };

    const removeSlot = (day: WorkingHourSlot['day'], slotIndex: number) => {
        setData(
            'working_hours',
            data.working_hours.map((wh) =>
                wh.day === day ? { ...wh, slots: wh.slots.filter((_, i) => i !== slotIndex) } : wh,
            ),
        );
    };

    const updateSlot = (day: WorkingHourSlot['day'], slotIndex: number, field: 'start' | 'end', value: string) => {
        setData(
            'working_hours',
            data.working_hours.map((wh) =>
                wh.day === day
                    ? {
                          ...wh,
                          slots: wh.slots.map((slot, i) => (i === slotIndex ? { ...slot, [field]: value } : slot)),
                      }
                    : wh,
            ),
        );
    };

    return (
        <>
            <Head title={`Editar — ${professional.name}`} />

            <div className="mx-auto max-w-3xl p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Editar Profissional</h1>
                    <p className="text-sm text-muted-foreground">{professional.name}</p>
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
                                <Label htmlFor="specialty">Especialidade</Label>
                                <Input
                                    id="specialty"
                                    placeholder="Ex: Fisioterapia, Pilates..."
                                    value={data.specialty}
                                    onChange={(e) => setData('specialty', e.target.value)}
                                />
                                <InputError message={errors.specialty} />
                            </div>

                            <div className="sm:col-span-2 flex items-center gap-3">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="size-4"
                                />
                                <Label htmlFor="is_active">Profissional ativo</Label>
                            </div>
                        </div>
                    </section>

                    {/* Acesso */}
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Acesso ao Sistema</h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2 grid gap-2">
                                <Label htmlFor="email">E-mail *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Nova senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Deixe em branco para manter"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="Deixe em branco para manter"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>
                    </section>

                    {/* Horários */}
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Horários de Trabalho</h2>
                        <p className="text-sm text-muted-foreground">Selecione os dias e configure os horários de atendimento.</p>

                        <div className="flex flex-wrap gap-2">
                            {([0, 1, 2, 3, 4, 5, 6] as WorkingHourSlot['day'][]).map((day) => {
                                const isActive = data.working_hours.some((wh) => wh.day === day);
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        {DAYS[day]}
                                    </button>
                                );
                            })}
                        </div>

                        {data.working_hours.length > 0 && (
                            <div className="space-y-3">
                                {data.working_hours.map((wh) => (
                                    <div key={wh.day} className="rounded-lg border p-4 space-y-3">
                                        <p className="text-sm font-medium">{DAYS[wh.day]}</p>
                                        {wh.slots.map((slot, slotIndex) => (
                                            <div key={slotIndex} className="flex items-center gap-3">
                                                <div className="grid gap-1">
                                                    <Label className="text-xs">Início</Label>
                                                    <Input
                                                        type="time"
                                                        value={slot.start}
                                                        onChange={(e) => updateSlot(wh.day, slotIndex, 'start', e.target.value)}
                                                        className="w-32"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`working_hours.${data.working_hours.indexOf(wh)}.slots.${slotIndex}.start`]} />
                                                </div>
                                                <div className="grid gap-1">
                                                    <Label className="text-xs">Fim</Label>
                                                    <Input
                                                        type="time"
                                                        value={slot.end}
                                                        onChange={(e) => updateSlot(wh.day, slotIndex, 'end', e.target.value)}
                                                        className="w-32"
                                                    />
                                                    <InputError message={(errors as Record<string, string>)[`working_hours.${data.working_hours.indexOf(wh)}.slots.${slotIndex}.end`]} />
                                                </div>
                                                {wh.slots.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="mt-5"
                                                        onClick={() => removeSlot(wh.day, slotIndex)}
                                                    >
                                                        Remover
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addSlot(wh.day)}
                                        >
                                            + Adicionar horário
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/professionals/${professional.id}`}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
