<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeachersTableSeeder extends Seeder
{
    public function run(): void
    {
        $csvPath = base_path('docs/Guru-clean.csv');
        $handle  = fopen($csvPath, 'r');
        fgetcsv($handle); // skip header

        $index = 1;
        while (($row = fgetcsv($handle)) !== false) {
            [$timestamp, $name, $subject, $divisi, $jamMasuk, $jamKeluar, $phone, $email, $password] = $row;

            if ($divisi !== 'Guru') continue;

            $email = strtolower(trim($email));
            $user  = User::where('email', $email)->first();
            if (!$user) continue;

            // Generate NIP: format 18 digit (birth~appt~gender~seq)
            $nip = '19' . str_pad(70 + $index, 2, '0', STR_PAD_LEFT)
                . str_pad($index, 4, '0', STR_PAD_LEFT)
                . '200' . str_pad($index % 9 + 1, 1)
                . '01' . str_pad($index % 2 + 1, 1)
                . str_pad($index, 3, '0', STR_PAD_LEFT);

            Teacher::create([
                'user_id' => $user->id,
                'name'    => trim($name),
                'nip'     => $nip,
                'phone'   => trim($phone),
                'address' => 'Banjar, Jawa Barat',
            ]);

            $index++;
        }
        fclose($handle);
    }
}
