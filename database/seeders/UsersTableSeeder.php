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

        // 15 Teacher accounts
        $teacherEmails = [
            'budi.santoso@smkn1.sch.id',
            'siti.rahayu@smkn1.sch.id',
            'ahmad.fauzi@smkn1.sch.id',
            'dewi.kurniawati@smkn1.sch.id',
            'hendra.wijaya@smkn1.sch.id',
            'rina.susanti@smkn1.sch.id',
            'dian.pratama@smkn1.sch.id',
            'arief.nugroho@smkn1.sch.id',
            'yuliana.safitri@smkn1.sch.id',
            'bambang.suryadi@smkn1.sch.id',
            'eko.prasetyo@smkn1.sch.id',
            'sri.wahyuni@smkn1.sch.id',
            'muhammad.ridwan@smkn1.sch.id',
            'fitria.handayani@smkn1.sch.id',
            'agus.hermawan@smkn1.sch.id',
        ];

        foreach ($teacherEmails as $email) {
            User::create([
                'email'    => $email,
                'password' => Hash::make('password'),
                'role'     => 'guru',
            ]);
        }

        // 90 Student accounts (5 per class × 18 classes)
        for ($i = 1; $i <= 90; $i++) {
            User::create([
                'email'    => 'siswa.' . str_pad($i, 3, '0', STR_PAD_LEFT) . '@smkn1.sch.id',
                'password' => Hash::make('password'),
                'role'     => 'siswa',
            ]);
        }

        // 5 Staff accounts (3 TU + 2 security)
        $staffEmails = [
            'tu.01@smkn1.sch.id',
            'tu.02@smkn1.sch.id',
            'tu.03@smkn1.sch.id',
            'satpam.01@smkn1.sch.id',
            'satpam.02@smkn1.sch.id',
        ];

        foreach ($staffEmails as $email) {
            User::create([
                'email'    => $email,
                'password' => Hash::make('password'),
                'role'     => 'staff',
            ]);
        }
    }
}
