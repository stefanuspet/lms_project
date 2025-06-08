<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TeachersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get teacher users
        $teacherUsers = User::where('role', 'guru')->get();

        // Create teacher profiles
        foreach ($teacherUsers as $index => $user) {
            $teacherNumber = $index + 1;
            Teacher::create([
                'user_id' => $user->id,
                'name' => "Guru $teacherNumber",
                'nip' => "1234567890$teacherNumber",
                'phone' => "0812345678$teacherNumber", // contoh nomor telepon
                'address' => "Alamat Guru $teacherNumber", // contoh alamat
            ]);
        }
    }
}
