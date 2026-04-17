<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AcademicYearsTableSeeder::class,   // academic_years
            UsersTableSeeder::class,            // users
            SemestersTableSeeder::class,        // semesters (→ academic_years)
            ClassesTableSeeder::class,          // classes
            TeachersTableSeeder::class,         // teachers (→ users)
            StudentsTableSeeder::class,         // students (→ users)
            StaffTableSeeder::class,            // staff (→ users)
            SubjectsTableSeeder::class,         // subjects (→ classes, teachers)
            TeacherSubjectsTableSeeder::class,  // teachers_subjects (→ teachers, subjects, semesters)
            SemestersStudentsTableSeeder::class,// semesters_students (→ semesters, students, classes)
            MaterialsTableSeeder::class,        // materials (→ subjects)
            AssignmentsTableSeeder::class,      // assignments + submissions (→ subjects, students)
            SchedulesTableSeeder::class,        // schedules (→ classes, subjects, teachers, semesters)
            ExtracurricularsTableSeeder::class, // extracurriculars + members (→ teachers, semesters, students)
        ]);
    }
}
