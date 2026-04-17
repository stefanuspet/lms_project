<?php

namespace Database\Seeders;

use App\Models\Semester;
use App\Models\Subject;
use App\Models\TeacherSubject;
use Illuminate\Database\Seeder;

class TeacherSubjectsTableSeeder extends Seeder
{
    public function run(): void
    {
        // Semester aktif saat ini
        $currentSemester = Semester::latest('start_date')->first();

        $subjects = Subject::all();

        foreach ($subjects as $subject) {
            TeacherSubject::firstOrCreate([
                'teacher_id' => $subject->teacher_id,
                'subject_id' => $subject->id,
                'semester_id' => $currentSemester->id,
            ]);
        }
    }
}
