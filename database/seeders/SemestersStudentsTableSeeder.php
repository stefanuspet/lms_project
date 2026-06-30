<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SemestersStudentsTableSeeder extends Seeder
{
    public function run(): void
    {
        $currentSemester = Semester::latest('start_date')->first();

        // Map jurusan CSV → nama kelas
        $jurusanToClass = [
            'a. layanan penunjang keperawatan dan caregiving' => 'X KP 1',
            'b. akuntansi dan keuangan lembaga'              => 'X AKL 1',
            'c. bisnis daring dan pemasaran'                 => 'X BDP 1',
        ];

        // Preload classes
        $classMap = [];
        foreach ($jurusanToClass as $jurusan => $className) {
            $classMap[$jurusan] = Classroom::where('name', $className)->first();
        }

        $csvPath = base_path('docs/data-siswa-clean.csv');
        $handle  = fopen($csvPath, 'r');
        fgetcsv($handle); // skip header

        while (($row = fgetcsv($handle)) !== false) {
            [$timestamp, $name, $nisn, $email, $parentPhone, $gender, $kelas, $jurusan] = $row;

            $email    = strtolower(trim($email));
            $jurusan  = strtolower(trim($jurusan));
            $class    = $classMap[$jurusan] ?? null;

            if (!$class) continue;

            $user    = User::where('email', $email)->first();
            if (!$user) continue;

            $student = Student::where('user_id', $user->id)->first();
            if (!$student) continue;

            DB::table('semesters_students')->insert([
                'semesters_id' => $currentSemester->id,
                'students_id'  => $student->id,
                'class_id'     => $class->id,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }
        fclose($handle);
    }
}
