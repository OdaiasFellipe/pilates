<?php

namespace App\Models;

use App\Enums\DocumentType;
use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable(['patient_id', 'uploaded_by_id', 'title', 'description', 'type', 'file_path', 'original_filename', 'mime_type', 'file_size', 'uploaded_at'])]
class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'type' => DocumentType::class,
            'uploaded_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }

    public function getDownloadUrlAttribute(): string
    {
        return Storage::disk('private')->url($this->file_path);
    }

    public function getPreviewUrlAttribute(): ?string
    {
        if ($this->type->isImage()) {
            return Storage::disk('private')->url($this->file_path);
        }

        return null;
    }

    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function ($document) {
            Storage::disk('private')->delete($document->file_path);
        });
    }
}
