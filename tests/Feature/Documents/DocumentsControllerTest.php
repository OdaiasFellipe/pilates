<?php

namespace Tests\Feature\Documents;

use App\Models\Document;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $receptionist;
    protected User $professional;
    protected Patient $patient;

    public function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');

        $this->admin = User::factory()->admin()->create();
        $this->receptionist = User::factory()->create();
        $this->professional = User::factory()->professional()->create();
        $this->patient = Patient::factory()->create();
    }

    public function test_authenticated_user_can_view_documents_list(): void
    {
        Document::factory()
            ->count(3)
            ->for($this->patient)
            ->create();

        $response = $this->actingAs($this->admin)
            ->get("/patients/{$this->patient->id}/documents");

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Documents/Index')
                ->has('patient')
                ->has('documents', 3)
        );
    }

    public function test_guest_cannot_view_documents_list(): void
    {
        $response = $this->get("/patients/{$this->patient->id}/documents");

        $response->assertRedirect('/login');
    }

    public function test_receptionist_can_create_document(): void
    {
        Storage::fake('private');

        $file = UploadedFile::fake()->image('test.png', 100, 100);

        $response = $this->actingAs($this->receptionist)
            ->post("/patients/{$this->patient->id}/documents", [
                'title' => 'Test Document',
                'description' => 'A test document',
                'type' => 'progress_photo',
                'file' => $file,
            ]);

        $response->assertRedirect("/patients/{$this->patient->id}/documents");

        $this->assertDatabaseHas('documents', [
            'patient_id' => $this->patient->id,
            'uploaded_by_id' => $this->receptionist->id,
            'title' => 'Test Document',
            'type' => 'progress_photo',
        ]);

        Storage::disk('private')->assertExists('patients/'.$this->patient->id);
    }

    public function test_professional_can_create_document(): void
    {
        Storage::fake('private');

        $file = UploadedFile::fake()->create('exercise.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->professional)
            ->post("/patients/{$this->patient->id}/documents", [
                'title' => 'Exercise Guide',
                'description' => null,
                'type' => 'exercise_guide',
                'file' => $file,
            ]);

        $response->assertRedirect("/patients/{$this->patient->id}/documents");

        $this->assertDatabaseHas('documents', [
            'type' => 'exercise_guide',
            'uploaded_by_id' => $this->professional->id,
        ]);
    }

    public function test_guest_cannot_create_document(): void
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);

        $response = $this->post("/patients/{$this->patient->id}/documents", [
            'title' => 'Test Document',
            'type' => 'treatment_plan',
            'file' => $file,
        ]);

        $response->assertRedirect('/login');
    }

    public function test_document_requires_valid_type(): void
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);

        $response = $this->actingAs($this->receptionist)
            ->post("/patients/{$this->patient->id}/documents", [
                'title' => 'Test Document',
                'type' => 'invalid_type',
                'file' => $file,
            ]);

        $response->assertSessionHasErrors('type');
    }

    public function test_document_requires_file(): void
    {
        $response = $this->actingAs($this->receptionist)
            ->post("/patients/{$this->patient->id}/documents", [
                'title' => 'Test Document',
                'type' => 'treatment_plan',
            ]);

        $response->assertSessionHasErrors('file');
    }

    public function test_document_requires_title(): void
    {
        $file = UploadedFile::fake()->create('test.pdf', 100);

        $response = $this->actingAs($this->receptionist)
            ->post("/patients/{$this->patient->id}/documents", [
                'type' => 'treatment_plan',
                'file' => $file,
            ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_admin_can_delete_document(): void
    {
        $document = Document::factory()
            ->for($this->patient)
            ->create();

        $response = $this->actingAs($this->admin)
            ->delete("/patients/documents/{$document->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('documents', [
            'id' => $document->id,
        ]);
    }

    public function test_uploader_can_delete_own_document(): void
    {
        $document = Document::factory()
            ->for($this->patient)
            ->create(['uploaded_by_id' => $this->receptionist->id]);

        $response = $this->actingAs($this->receptionist)
            ->delete("/patients/documents/{$document->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('documents', [
            'id' => $document->id,
        ]);
    }

    public function test_professional_cannot_delete_other_professionals_document(): void
    {
        $document = Document::factory()
            ->for($this->patient)
            ->create(['uploaded_by_id' => $this->professional->id]);

        $anotherProfessional = User::factory()->professional()->create();

        $response = $this->actingAs($anotherProfessional)
            ->delete("/patients/documents/{$document->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
        ]);
    }

    public function test_guest_cannot_delete_document(): void
    {
        $document = Document::factory()
            ->for($this->patient)
            ->create();

        $response = $this->delete("/patients/documents/{$document->id}");

        $response->assertRedirect('/login');
    }
}
