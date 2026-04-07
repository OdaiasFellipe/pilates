<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentsController extends Controller
{
    public function index(Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        $documents = Document::query()
            ->where('patient_id', $patient->id)
            ->with(['uploadedBy:id,name'])
            ->latest()
            ->get(['id', 'title', 'description', 'type', 'file_size', 'original_filename', 'uploaded_by_id', 'uploaded_at']);

        return Inertia::render('Documents/Index', [
            'patient' => $patient,
            'documents' => $documents,
        ]);
    }

    public function store(Request $request, Patient $patient): RedirectResponse
    {
        Gate::authorize('create', Document::class);
        Gate::authorize('view', $patient);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|string|in:evaluation_form,treatment_plan,signed_consent,progress_photo,exercise_guide,medical_report,other',
            'file' => 'required|file|max:51200',
        ]);

        $file = $request->file('file');
        $path = $file->storeAs(
            "patients/{$patient->id}",
            time().'_'.$file->getClientOriginalName(),
            'private'
        );

        Document::create([
            'patient_id' => $patient->id,
            'uploaded_by_id' => Auth::id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return to_route('patients.documents.index', $patient)
            ->with('success', 'Documento enviado com sucesso.');
    }

    public function download(Document $document)
    {
        Gate::authorize('view', $document);

        if (!Storage::disk('private')->exists($document->file_path)) {
            abort(404, 'Arquivo não encontrado.');
        }

        return Storage::disk('private')->download($document->file_path, $document->original_filename);
    }

    public function destroy(Document $document): RedirectResponse
    {
        Gate::authorize('delete', $document);

        $patientId = $document->patient_id;
        $document->delete();

        return to_route('patients.documents.index', $patientId)
            ->with('success', 'Documento removido com sucesso.');
    }
}
