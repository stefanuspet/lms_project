<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Seeder;

class AcademicYearsTableSeeder extends Seeder
{
    public function run(): void
    {
        AcademicYear::create([
            'name'       => '2024/2025',
            'start_date' => '2024-07-15',
            'end_date'   => '2025-06-14',
            'is_active'  => false,
        ]);

        AcademicYear::create([
            'name'       => '2025/2026',
            'start_date' => '2025-07-14',
            'end_date'   => '2026-06-13',
            'is_active'  => true,
        ]);
    }
}
