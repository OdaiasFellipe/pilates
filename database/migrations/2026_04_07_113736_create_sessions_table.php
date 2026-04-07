<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clinical_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('professional_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('treatment_plan_id')->nullable();
            $table->text('evolution_notes');
            $table->json('soap_note')->nullable();
            $table->json('exercises')->nullable();
            $table->unsignedTinyInteger('pain_scale')->nullable();
            $table->dateTime('attended_at');
            $table->timestamps();

            $table->index(['patient_id', 'attended_at']);
            $table->index(['professional_id', 'attended_at']);
            $table->index('treatment_plan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinical_sessions');
    }
};
