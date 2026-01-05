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
        Schema::table('extracurriculars', function (Blueprint $table) {
            $table->foreignId('semester_id')
                ->nullable()
                ->after('teacher_id')
                ->constrained()
                ->nullOnDelete();

            $table->string('room')
                ->nullable()
                ->after('end_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('extracurriculars', function (Blueprint $table) {
            $table->dropConstrainedForeignId('semester_id');
            $table->dropColumn('room');
        });
    }
};

