<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->foreignId('semester_id')->nullable()->after('subject_id')
                ->constrained('semesters')->nullOnDelete();
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->foreignId('semester_id')->nullable()->after('subject_id')
                ->constrained('semesters')->nullOnDelete();
        });

        Schema::table('discussion_threads', function (Blueprint $table) {
            $table->foreignId('semester_id')->nullable()->after('subject_id')
                ->constrained('semesters')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropColumn('semester_id');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropColumn('semester_id');
        });

        Schema::table('discussion_threads', function (Blueprint $table) {
            $table->dropForeign(['semester_id']);
            $table->dropColumn('semester_id');
        });
    }
};
