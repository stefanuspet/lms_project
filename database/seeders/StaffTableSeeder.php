<?php

namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;

class StaffTableSeeder extends Seeder
{
    public function run(): void
    {
        $positionMap = [
            'Kepala Sekolah' => ['position' => 'Kepala Sekolah', 'category' => 'staff'],
            'Tata Usaha'     => ['position' => 'Staf Tata Usaha', 'category' => 'staff'],
            'Bendahara'      => ['position' => 'Bendahara', 'category' => 'staff'],
        ];

        $csvPath = base_path('docs/Guru-clean.csv');
        $handle  = fopen($csvPath, 'r');
        fgetcsv($handle); // skip header

        $index = 1;
        while (($row = fgetcsv($handle)) !== false) {
            [$timestamp, $name, $subject, $divisi, $jamMasuk, $jamKeluar, $phone, $email, $password] = $row;

            if ($divisi === 'Guru') continue;

            $email = strtolower(trim($email));
            $user  = User::where('email', $email)->first();
            if (!$user) continue;

            $meta = $positionMap[trim($divisi)] ?? ['position' => trim($divisi), 'category' => 'staff'];

            Staff::create([
                'user_id'   => $user->id,
                'name'      => trim($name),
                'nip'       => null,
                'phone'     => trim($phone),
                'address'   => 'Banjar, Jawa Barat',
                'position'  => $meta['position'],
                'category'  => $meta['category'],
                'join_date' => null,
                'is_active' => true,
            ]);

            $index++;
        }
        fclose($handle);
    }
}
