<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SemestersStudentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get current semester
        $currentSemester = Semester::latest('start_date')->first();

        // Get all students
        $students = Student::all();

        // Get all classes
        $classes = Classroom::all();

        // Distribute students evenly across classes
        $studentsPerClass = ceil($students->count() / $classes->count());

        $studentIndex = 0;

        foreach ($classes as $class) {
            // Calculate how many students to assign to this class
            $classStudentCount = min($studentsPerClass, $students->count() - $studentIndex);

            // Assign students to this class
            for ($i = 0; $i < $classStudentCount; $i++) {
                if ($studentIndex < $students->count()) {
                    $student = $students[$studentIndex];

                    DB::table('semesters_students')->insert([
                        'semesters_id' => $currentSemester->id,
                        'students_id' => $student->id,
                        'class_id' => $class->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $studentIndex++;
                }
            }
        }
    }
}
