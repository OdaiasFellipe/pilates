import type { Professional } from './professional';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
export type AppointmentType = 'pilates' | 'physiotherapy' | 'evaluation';

export type Appointment = {
    id: number;
    patient_id: number;
    professional_id: number;
    starts_at: string;
    ends_at: string;
    type: AppointmentType;
    status: AppointmentStatus;
    notes?: string | null;
    cancellation_reason?: string | null;
    reminder_sent_at?: string | null;
    created_at: string;
    updated_at: string;
    patient?: {
        id: number;
        name: string;
        phone?: string | null;
    };
    professional?: Pick<Professional, 'id' | 'name' | 'specialty'>;
};

export type AppointmentFormData = {
    patient_id: number | '';
    professional_id: number | '';
    starts_at: string;
    ends_at: string;
    type: AppointmentType;
    status: AppointmentStatus;
    notes: string;
    cancellation_reason: string;
};
