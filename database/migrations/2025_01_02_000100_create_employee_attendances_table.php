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
        Schema::create('employee_attendances', function (Blueprint $table) {
            $table->id();

            // Menggunakan user_id supaya bisa mencakup guru, staff, dan security
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Tanggal presensi (harian)
            $table->date('date');

            // Waktu check-in & check-out
            $table->timestamp('check_in_at')->nullable();
            $table->timestamp('check_out_at')->nullable();

            // Status akhir hari: hadir, izin, sakit, alpha
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpha'])->default('hadir');

            // Opsi untuk validasi lokasi (jika dibutuhkan seperti siswa)
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Catatan tambahan dari admin/hr
            $table->text('notes')->nullable();

            $table->timestamps();

            // Satu user hanya boleh punya satu record per hari
            $table->unique(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_attendances');
    }
};

