<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UsersTableSeeder::class,
            SemestersTableSeeder::class,
            ClassesTableSeeder::class,
            TeachersTableSeeder::class,
            StudentsTableSeeder::class,
            SubjectsTableSeeder::class,
            TeacherSubjectsTableSeeder::class,
            SemestersStudentsTableSeeder::class,
            MaterialsTableSeeder::class,
            AssignmentsTableSeeder::class,
        ]);
    }
}
