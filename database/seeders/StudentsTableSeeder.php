<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentsTableSeeder extends Seeder
{
    public function run(): void
    {
        $csvPath = base_path('docs/data-siswa-clean.csv');
        $handle  = fopen($csvPath, 'r');
        fgetcsv($handle); // skip header

        while (($row = fgetcsv($handle)) !== false) {
            [$timestamp, $name, $nisn, $email, $parentPhone, $gender, $kelas, $jurusan] = $row;

            $email = strtolower(trim($email));
            $user  = User::where('email', $email)->first();
            if (!$user) continue;

            $genderValue = match (true) {
                str_contains(strtolower($gender), 'laki') => 'male',
                default                                   => 'female',
            };

            Student::create([
                'user_id'      => $user->id,
                'name'         => trim($name),
                'nisn'         => trim($nisn),
                'gender'       => $genderValue,
                'birth_date'   => null,
                'birth_place'  => null,
                'parent_name'  => null,
                'parent_phone' => !empty(trim($parentPhone)) ? trim($parentPhone) : null,
            ]);
        }
        fclose($handle);
    }
}
