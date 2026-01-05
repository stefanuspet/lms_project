<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create teacher users
        // for ($i = 1; $i <= 10; $i++) {
        // User::create([
        //     'email' => "guru@example.com",
        //     'password' => Hash::make('password'),
        //     'role' => 'guru',
        // ]);
        // }

        // // Create student users
        // for ($i = 1; $i <= 100; $i++) {
        // User::create([
        //     'email' => "siswa@example.com",
        //     'password' => Hash::make('password'),
        //     'role' => 'siswa',
        // ]);
        // }
    }
}
