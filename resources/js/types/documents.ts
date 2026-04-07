export type DocumentType = 'evaluation_form' | 'treatment_plan' | 'signed_consent' | 'progress_photo' | 'exercise_guide' | 'medical_report' | 'other';

export interface Document {
  id: number;
  title: string;
  description: string | null;
  type: DocumentType;
  file_size: number;
  original_filename: string;
  uploaded_by_id: number;
  uploaded_at: string;
  uploadedBy?: {
    id: number;
    name: string;
  };
  download_url?: string;
  preview_url?: string;
}

export interface DocumentsListResponse {
  patient: {
    id: number;
    name: string;
    email: string;
  };
  documents: Document[];
}
