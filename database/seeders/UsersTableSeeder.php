<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'email'    => 'admin@smkn1.sch.id',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // Teachers & Staff from Guru-clean.csv
        $csvPath = base_path('docs/Guru-clean.csv');
        $handle  = fopen($csvPath, 'r');
        fgetcsv($handle); // skip header

        while (($row = fgetcsv($handle)) !== false) {
            [$timestamp, $name, $subject, $divisi, $jamMasuk, $jamKeluar, $phone, $email, $password] = $row;
            $email = strtolower(trim($email));
            if (empty($email)) continue;

            $role = $divisi === 'Guru' ? 'guru' : 'staff';

            User::create([
                'email'    => $email,
                'password' => Hash::make('password'),
                'role'     => $role,
            ]);
        }
        fclose($handle);

        // Students from data-siswa-clean.csv
        $csvPath = base_path('docs/data-siswa-clean.csv');
        $handle  = fopen($csvPath, 'r');
        fgetcsv($handle); // skip header

        while (($row = fgetcsv($handle)) !== false) {
            [$timestamp, $name, $nisn, $email, $parentPhone, $gender, $kelas, $jurusan] = $row;
            $email = strtolower(trim($email));
            if (empty($email)) continue;

            User::create([
                'email'    => $email,
                'password' => Hash::make('password'),
                'role'     => 'siswa',
            ]);
        }
        fclose($handle);
    }
}
