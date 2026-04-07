export type FinancialPackage = {
    id: number;
    name: string;
    description: string | null;
    session_count: number;
    price: string;
    validity_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type PatientPackageStatus = 'active' | 'completed' | 'expired' | 'cancelled';

export type FinancialPatientPackage = {
    id: number;
    patient_id: number;
    package_id: number;
    professional_id: number;
    starts_at: string;
    expires_at: string;
    sessions_used: number;
    sessions_total: number;
    status: PatientPackageStatus;
    paid_at: string | null;
    patient?: { id: number; name: string };
    package?: { id: number; name: string; session_count: number; price: string };
    professional?: { id: number; name: string; specialty?: string | null };
};

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export type FinancialPayment = {
    id: number;
    patient_id: number;
    patient_package_id: number | null;
    amount: string;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    paid_at: string | null;
    notes: string | null;
    receipt_path: string | null;
    patient?: { id: number; name: string };
    patient_package?: { id: number; patient_id: number; package_id?: number | null };
};
