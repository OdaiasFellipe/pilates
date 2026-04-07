export type Evaluation = {
    id: number;
    patient_id: number;
    professional_id: number;
    chief_complaint: string;
    medical_history: string | null;
    physical_exam: {
        posture?: string;
        mobility?: string;
        observations?: string;
    } | null;
    diagnosis: string | null;
    goals: string | null;
    evaluated_at: string;
    patient?: { id: number; name: string };
    professional?: { id: number; name: string; specialty?: string | null };
};

export type TreatmentPlanStatus = 'active' | 'completed' | 'cancelled';

export type TreatmentPlan = {
    id: number;
    patient_id: number;
    professional_id: number;
    diagnosis: string;
    goals: string;
    observations: string | null;
    started_at: string;
    expires_at: string | null;
    status: TreatmentPlanStatus;
    patient?: { id: number; name: string };
    professional?: { id: number; name: string; specialty?: string | null };
    sessions?: Array<{
        id: number;
        treatment_plan_id: number;
        attended_at: string;
        pain_scale: number | null;
        evolution_notes: string;
    }>;
};

export type ClinicalSession = {
    id: number;
    appointment_id: number;
    patient_id: number;
    professional_id: number;
    treatment_plan_id: number | null;
    evolution_notes: string;
    soap_note: {
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
    } | null;
    exercises: string[] | null;
    pain_scale: number | null;
    attended_at: string;
    patient?: { id: number; name: string };
    professional?: { id: number; name: string; specialty?: string | null };
    appointment?: {
        id: number;
        starts_at: string;
        ends_at: string;
        type: string;
        status: string;
    };
    treatmentPlan?: { id: number; diagnosis: string; status: TreatmentPlanStatus } | null;
};

export type EvaluationFormData = {
    patient_id: number | '';
    professional_id: number | '';
    chief_complaint: string;
    medical_history: string;
    physical_exam: {
        posture: string;
        mobility: string;
        observations: string;
    };
    diagnosis: string;
    goals: string;
    evaluated_at: string;
};

export type TreatmentPlanFormData = {
    patient_id: number | '';
    professional_id: number | '';
    diagnosis: string;
    goals: string;
    observations: string;
    started_at: string;
    expires_at: string;
    status: TreatmentPlanStatus;
};

export type SessionFormData = {
    appointment_id: number | '';
    treatment_plan_id: number | '';
    evolution_notes: string;
    soap_note: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    };
    exercises: string[];
    pain_scale: number | '';
    attended_at: string;
};
