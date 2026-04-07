import { Document } from '@/types/index';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { Trash2, Download, Plus, ArrowLeft } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface Props {
  patient: {
    id: number;
    name: string;
    email: string;
  };
  documents: Document[];
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  evaluation_form: 'Ficha de Avaliação',
  treatment_plan: 'Plano de Tratamento',
  signed_consent: 'Consentimento Assinado',
  progress_photo: 'Foto de Progresso',
  exercise_guide: 'Guia de Exercícios',
  medical_report: 'Relatório Médico',
  other: 'Outro',
};

export default function DocumentsIndex({ patient, documents }: Props) {
  const { auth } = usePage().props;
  const canCreate = auth.user && ['admin', 'receptionist', 'professional'].includes(auth.user.role);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-10">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/patients/${patient.id}`} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
                <p className="mt-1 text-gray-600">{patient.name}</p>
              </div>
            </div>
            {canCreate && (
              <Link href={`/patients/${patient.id}/documents/create`} className="flex items-center">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Documento
                </Button>
              </Link>
            )}
          </div>

          {/* Documents List */}
          {documents.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">Nenhum documento encontrado</p>
              {canCreate && (
                <Link href={`/patients/${patient.id}/documents/create`}>
                  <Button variant="outline" size="sm" className="mt-4">
                    Adicionar Documento
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-white">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border-b border-gray-100 px-6 py-4 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{doc.uploadedBy?.name}</span>
                      <span>{new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {doc.description && (
                      <p className="mt-2 text-sm text-gray-600">{doc.description}</p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <a
                      href={`/patients/documents/${doc.id}/download`}
                      className="rounded p-2 hover:bg-blue-50"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-blue-600" />
                    </a>
                    {canCreate && (
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover este documento?')) {
                            document.location.href = `/patients/documents/${doc.id}`;
                          }
                        }}
                        className="rounded p-2 hover:bg-red-50"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
