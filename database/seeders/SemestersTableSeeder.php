<?php

namespace Database\Seeders;

use App\Models\Semester;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SemestersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create semesters for the current and next academic year
        $currentYear = Carbon::now()->year;

        // Semester 1 of current academic year
        Semester::create([
            'name' => "Semester Ganjil $currentYear/$currentYear+1",
            'start_date' => Carbon::createFromDate($currentYear, 7, 15),
            'end_date' => Carbon::createFromDate($currentYear, 12, 15),
        ]);

        // Semester 2 of current academic year
        Semester::create([
            'name' => "Semester Genap $currentYear/$currentYear+1",
            'start_date' => Carbon::createFromDate($currentYear, 12, 16),
            'end_date' => Carbon::createFromDate($currentYear + 1, 6, 15),
        ]);

        // Semester 1 of next academic year
        Semester::create([
            'name' => "Semester Ganjil " . ($currentYear + 1) . "/" . ($currentYear + 2),
            'start_date' => Carbon::createFromDate($currentYear + 1, 7, 15),
            'end_date' => Carbon::createFromDate($currentYear + 1, 12, 15),
        ]);
    }
}
