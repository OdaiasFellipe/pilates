export type PatientAddress = {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
};

export type PatientEmergencyContact = {
    name?: string;
    phone?: string;
    relationship?: string;
};

export type Patient = {
    id: number;
    name: string;
    cpf: string | null;
    rg: string | null;
    birth_date: string | null;
    phone: string | null;
    email: string | null;
    address: PatientAddress | null;
    health_insurance: string | null;
    health_insurance_number: string | null;
    emergency_contact: PatientEmergencyContact | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type PatientFormData = {
    name: string;
    cpf: string;
    rg: string;
    birth_date: string;
    phone: string;
    email: string;
    address: PatientAddress;
    health_insurance: string;
    health_insurance_number: string;
    emergency_contact: PatientEmergencyContact;
    notes: string;
    is_active: boolean;
};
