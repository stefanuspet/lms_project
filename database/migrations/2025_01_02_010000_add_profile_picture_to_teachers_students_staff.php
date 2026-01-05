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
        if (Schema::hasTable('teachers') && !Schema::hasColumn('teachers', 'profile_picture')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->string('profile_picture')
                    ->default('/assets/images/default-avatar.png')
                    ->after('address');
            });
        }

        if (Schema::hasTable('students') && !Schema::hasColumn('students', 'profile_picture')) {
            Schema::table('students', function (Blueprint $table) {
                $table->string('profile_picture')
                    ->default('/assets/images/default-avatar.png')
                    ->after('birth_place');
            });
        }

        if (Schema::hasTable('staff') && !Schema::hasColumn('staff', 'profile_picture')) {
            Schema::table('staff', function (Blueprint $table) {
                $table->string('profile_picture')
                    ->default('/assets/images/default-avatar.png')
                    ->after('address');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('teachers') && Schema::hasColumn('teachers', 'profile_picture')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->dropColumn('profile_picture');
            });
        }

        if (Schema::hasTable('students') && Schema::hasColumn('students', 'profile_picture')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropColumn('profile_picture');
            });
        }

        if (Schema::hasTable('staff') && Schema::hasColumn('staff', 'profile_picture')) {
            Schema::table('staff', function (Blueprint $table) {
                $table->dropColumn('profile_picture');
            });
        }
    }
};
