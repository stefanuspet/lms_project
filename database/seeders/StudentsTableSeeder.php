<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class StudentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get student users
        $studentUsers = User::where('role', 'siswa')->get();

        $faker = Faker::create('id_ID');

        // Create student profiles
        foreach ($studentUsers as $index => $user) {
            $studentNumber = $index + 1;

            $gender = $index % 100 < 47 ? 'male' : 'female';

            Student::create([
                'user_id' => $user->id,
                'name' => "Siswa $studentNumber",
                'nisn' => "2023" . str_pad($studentNumber, 6, '0', STR_PAD_LEFT),
                'gender' => $gender,
                'birth_date' => $faker->dateTimeBetween('-18 years', '-12 years'),
                'birth_place' => $faker->city,
            ]);
        }
    }
}
