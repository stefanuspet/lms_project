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
        Schema::table('attendance_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('attendance_sessions', 'pin')) {
                $table->dropColumn('pin');
            }

            if (!Schema::hasColumn('attendance_sessions', 'qr_token')) {
                $table->string('qr_token', 64)->unique()->nullable()->after('id');
            }

            if (!Schema::hasColumn('attendance_sessions', 'session_type')) {
                $table->enum('session_type', ['arrival', 'departure'])->default('arrival')->after('qr_token');
            }

            if (!Schema::hasColumn('attendance_sessions', 'start_time')) {
                $table->time('start_time')->nullable()->after('date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('attendance_sessions', 'qr_token')) {
                $table->dropColumn('qr_token');
            }

            if (Schema::hasColumn('attendance_sessions', 'session_type')) {
                $table->dropColumn('session_type');
            }

            if (Schema::hasColumn('attendance_sessions', 'start_time')) {
                $table->dropColumn('start_time');
            }

            if (!Schema::hasColumn('attendance_sessions', 'pin')) {
                $table->string('pin', 6)->nullable();
            }
        });
    }
};
