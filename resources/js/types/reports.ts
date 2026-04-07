export type FinancialPackage = {
    id: number;
    name: string;
    description: string | null;
    session_count: number;
    price: string | number;
    validity_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type FinancialPatientPackage = {
    id: number;
    patient_id: number;
    package_id: number;
    professional_id: number;
    sessions_used: number;
    sessions_total: number;
    starts_at: string;
    expires_at: string;
    status: PatientPackageStatus;
    paid_at: string | null;
    patient?: { id: number; name: string };
    package?: { id: number; name: string };
    professional?: { id: number; name: string };
    created_at: string;
    updated_at: string;
};

export type FinancialPayment = {
    id: number;
    patient_id: number;
    patient_package_id: number | null;
    amount: string | number;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    paid_at: string | null;
    notes: string | null;
    receipt_path: string | null;
    patient?: { id: number; name: string };
    patientPackage?: FinancialPatientPackage;
    created_at: string;
    updated_at: string;
};

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PatientPackageStatus = 'active' | 'completed' | 'expired' | 'cancelled';

export type ClinicalEvaluation = {
    id: number;
    patient_id: number;
    professional_id: number;
    chief_complaint: string;
    medical_history: string | null;
    physical_exam: Record<string, any>;
    diagnosis: string;
    goals: string;
    evaluated_at: string;
    created_at: string;
    updated_at: string;
};

export type ClinicalSession = {
    id: number;
    appointment_id: number;
    patient_id: number;
    professional_id: number;
    treatment_plan_id: number | null;
    evolution_notes: string;
    soap_note: Record<string, any>;
    exercises: Record<string, any>;
    pain_scale: number;
    attended_at: string;
    professional?: { id: number; name: string };
    created_at: string;
    updated_at: string;
};

export type PatientProgressReport = {
    patient: { id: number; name: string; email: string };
    evaluations: ClinicalEvaluation[];
    sessions: ClinicalSession[];
    attendanceRate: number;
};

export type RevenueByProfessional = {
    id: number;
    name: string;
    total: string | number;
    count: number;
};

export type AttendanceStats = {
    total: number;
    attended: number;
    cancelled: number;
    noShow: number;
    attendanceRate: number;
};

export type AppointmentsTrend = {
    date: string;
    count: number;
};

export type PerformanceReport = {
    revenueByProfessional: RevenueByProfessional[];
    attendanceStats: AttendanceStats;
    appointmentsTrend: AppointmentsTrend[];
    period: { from: string; to: string };
};
