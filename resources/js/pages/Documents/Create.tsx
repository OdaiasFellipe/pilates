import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
  patient: {
    id: number;
    name: string;
    email: string;
  };
}

const DOCUMENT_TYPES = [
  { value: 'evaluation_form', label: 'Ficha de Avaliação' },
  { value: 'treatment_plan', label: 'Plano de Tratamento' },
  { value: 'signed_consent', label: 'Consentimento Assinado' },
  { value: 'progress_photo', label: 'Foto de Progresso' },
  { value: 'exercise_guide', label: 'Guia de Exercícios' },
  { value: 'medical_report', label: 'Relatório Médico' },
  { value: 'other', label: 'Outro' },
];

export default function DocumentsCreate({ patient }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    type: 'evaluation_form',
    file: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('type', data.type);
    if (data.file) {
      formData.append('file', data.file);
    }

    post(`/patients/${patient.id}/documents`, {
      data: formData,
      forceFormData: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="py-10">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Link href={`/patients/${patient.id}/documents`} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Documento</h1>
              <p className="mt-1 text-gray-600">{patient.name}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="Ex: Avaliação Inicial"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Type */}
              <div>
                <Label htmlFor="type">Tipo de Documento *</Label>
                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Adicione anotações ou observações sobre o documento"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="file">Arquivo *</Label>
                <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10">
                  <div className="text-center">
                    <input
                      id="file"
                      type="file"
                      onChange={(e) => setData('file', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="file"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 underline"
                    >
                      Clique para selecionar um arquivo
                    </label>
                    <p className="mt-2 text-sm text-gray-500">ou arraste aqui</p>
                    <p className="mt-1 text-xs text-gray-400">Máximo 50MB</p>
                  </div>
                </div>
                {data.file && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {data.file.name} ({(data.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <Link href={`/patients/${patient.id}/documents`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Enviando...' : 'Enviar Documento'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
