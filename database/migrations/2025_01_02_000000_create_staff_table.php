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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            // Relasi ke users, opsional kalau ada staff/security yang tidak perlu akun login
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');

            $table->string('name');
            $table->string('nip')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('profile_picture')
                ->default('/assets/images/default-avatar.png');

            // Contoh: "Tata Usaha", "Satpam", "Kepala TU", dll.
            $table->string('position')->nullable();

            // staff = pegawai umum (TU, admin sekolah, dll), security = satpam
            $table->enum('category', ['staff', 'security'])->default('staff');

            $table->date('join_date')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
