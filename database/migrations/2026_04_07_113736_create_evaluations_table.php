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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('professional_id')->constrained('users')->cascadeOnDelete();
            $table->text('chief_complaint');
            $table->text('medical_history')->nullable();
            $table->json('physical_exam')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('goals')->nullable();
            $table->dateTime('evaluated_at');
            $table->timestamps();

            $table->index(['patient_id', 'evaluated_at']);
            $table->index(['professional_id', 'evaluated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
