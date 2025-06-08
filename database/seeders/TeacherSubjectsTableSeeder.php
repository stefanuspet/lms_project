<?php

namespace Database\Seeders;

use App\Models\Semester;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TeacherSubjectsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all subjects
        $subjects = Subject::all();

        // Get all teachers
        $teachers = Teacher::all();

        // Get current semester
        $currentSemester = Semester::latest('start_date')->first();

        // For each subject, assign the subject's teacher and one additional teacher if available
        foreach ($subjects as $subject) {
            // Assign the primary teacher
            TeacherSubject::create([
                'teacher_id' => $subject->teacher_id,
                'subject_id' => $subject->id,
                'semester_id' => $currentSemester->id,
            ]);

            // Assign one additional teacher (if there are at least 2 teachers)
            if ($teachers->count() > 1) {
                // Get a random teacher that's not the primary teacher
                $additionalTeacher = $teachers->where('id', '!=', $subject->teacher_id)->random();

                TeacherSubject::create([
                    'teacher_id' => $additionalTeacher->id,
                    'subject_id' => $subject->id,
                    'semester_id' => $currentSemester->id,
                ]);
            }
        }
    }
}
