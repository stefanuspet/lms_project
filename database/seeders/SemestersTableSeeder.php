<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemestersTableSeeder extends Seeder
{
    public function run(): void
    {
        $ay2425 = AcademicYear::where('name', '2024/2025')->first();
        $ay2526 = AcademicYear::where('name', '2025/2026')->first();

        Semester::create([
            'academic_year_id' => $ay2425->id,
            'name'             => 'Semester Ganjil 2024/2025',
            'start_date'       => '2024-07-15',
            'end_date'         => '2024-12-14',
        ]);

        Semester::create([
            'academic_year_id' => $ay2425->id,
            'name'             => 'Semester Genap 2024/2025',
            'start_date'       => '2025-01-06',
            'end_date'         => '2025-06-14',
        ]);

        Semester::create([
            'academic_year_id' => $ay2526->id,
            'name'             => 'Semester Ganjil 2025/2026',
            'start_date'       => '2025-07-14',
            'end_date'         => '2025-12-13',
        ]);

        // Semester aktif saat ini (April 2026)
        Semester::create([
            'academic_year_id' => $ay2526->id,
            'name'             => 'Semester Genap 2025/2026',
            'start_date'       => '2026-01-05',
            'end_date'         => '2026-06-13',
        ]);
    }
}
