import type { User, WorkingHourSlot } from './auth';

export type Professional = User & {
    role: 'professional';
};

export type ProfessionalFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    cpf: string;
    phone: string;
    specialty: string;
    working_hours: WorkingHourSlot[];
    is_active: boolean;
};
