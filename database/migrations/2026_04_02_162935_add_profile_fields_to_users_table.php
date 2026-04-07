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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('receptionist')->after('email');
            $table->string('cpf', 14)->nullable()->unique()->after('role');
            $table->string('phone', 20)->nullable()->after('cpf');
            $table->string('specialty')->nullable()->after('phone');
            $table->json('working_hours')->nullable()->after('specialty');
            $table->boolean('is_active')->default(true)->after('working_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'cpf', 'phone', 'specialty', 'working_hours', 'is_active']);
        });
    }
};
