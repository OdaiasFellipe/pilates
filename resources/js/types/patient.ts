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
    // Eager-loaded relations
    appointments?: PatientAppointment[];
    evaluations?: PatientEvaluation[];
    treatment_plans?: PatientTreatmentPlan[];
    sessions?: PatientSession[];
    patient_packages?: PatientPackage[];
    documents?: PatientDocument[];
};

export type PatientAppointment = {
    id: number;
    starts_at: string;
    ends_at: string;
    type: string;
    status: string;
    professional?: { id: number; name: string };
};

export type PatientEvaluation = {
    id: number;
    chief_complaint: string | null;
    diagnosis: string | null;
    evaluated_at: string;
    professional?: { id: number; name: string };
};

export type PatientTreatmentPlan = {
    id: number;
    diagnosis: string | null;
    goals: string | null;
    created_at: string;
    professional?: { id: number; name: string };
};

export type PatientSession = {
    id: number;
    attended_at: string;
    type: string;
    status: string;
    professional?: { id: number; name: string };
};

export type PatientPackage = {
    id: number;
    sessions_used: number;
    sessions_total: number;
    status: string;
    starts_at: string;
    expires_at: string | null;
    package?: { id: number; name: string };
    payments?: Array<{ id: number; amount: string; status: string }>;
};

export type PatientDocument = {
    id: number;
    title: string;
    type: string;
    file_size: number;
    original_filename: string;
    uploaded_at: string;
    uploadedBy?: { id: number; name: string };
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

