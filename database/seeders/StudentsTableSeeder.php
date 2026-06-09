<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentsTableSeeder extends Seeder
{
    public function run(): void
    {
        // 90 realistic Indonesian student names (45 male, 45 female)
        $maleNames = [
            'Rizky Pratama', 'Fajar Ramadhan', 'Aldi Kurniawan', 'Dimas Saputra', 'Reza Mahendra',
            'Kevin Ardiansyah', 'Bagas Setiawan', 'Gilang Nugroho', 'Wahyu Firdaus', 'Rendy Hidayat',
            'Hafiz Maulana', 'Akbar Pangestu', 'Irfan Wijaya', 'Faqih Santoso', 'Zhafran Permana',
            'Andika Purnama', 'Bima Adiputra', 'Cahya Gunawan', 'Danang Wibowo', 'Endra Iskandar',
            'Fadli Hartono', 'Galih Yanuar', 'Hilmi Ramdani', 'Ivan Jaya', 'Jaka Lestari',
            'Kresna Kusuma', 'Luthfi Rinaldi', 'Mulia Tanjung', 'Naufal Utama', 'Omar Komala',
            'Putra Widianto', 'Raihan Purnama', 'Satria Kusumah', 'Taufiq Mahmud', 'Umar Haryanti',
            'Vino Saputra', 'Wira Nugroho', 'Yoga Setiawan', 'Zaki Ramadhan', 'Andi Pratama',
            'Bondan Santoso', 'Candra Wijaya', 'Dion Kurniawan', 'Eko Ramdani', 'Farhan Hidayat',
        ];

        $femaleNames = [
            'Ayu Rahayu', 'Bunga Puspita', 'Citra Lestari', 'Dina Oktaviani', 'Eva Nuraini',
            'Fina Kusuma', 'Gita Permata', 'Hani Sari', 'Indah Dewi', 'Julia Susanto',
            'Karina Wulandari', 'Linda Setiati', 'Mia Hartini', 'Nadia Valentina', 'Okta Ratnasari',
            'Putri Qomariyah', 'Qori Saputri', 'Rini Fauziah', 'Sari Rahayu', 'Tika Apriani',
            'Ulfa Zafira', 'Vina Lestari', 'Wulan Sari', 'Yuni Permata', 'Zahra Nurfaizi',
            'Anisa Kurniawati', 'Bella Purnama', 'Clara Kusumah', 'Desi Andriani', 'Elsa Maulida',
            'Fani Nurhayati', 'Gloria Anggraeni', 'Hesty Puspasari', 'Intan Melati', 'Jasmine Cahyani',
            'Kiran Dewi', 'Lara Pertiwi', 'Maya Anggraini', 'Nova Septiana', 'Pita Wulandari',
            'Qila Ramadhani', 'Riska Amalia', 'Sinta Pratiwi', 'Tiara Maharani', 'Ulya Fitriana',
        ];

        $birthPlaces = [
            'Banjar', 'Ciamis', 'Tasikmalaya', 'Bandung', 'Garut',
            'Majalengka', 'Kuningan', 'Cirebon', 'Pangandaran', 'Sumedang',
        ];

        $parentMaleNames = [
            'Asep Kurniawan', 'Dedi Santoso', 'Ujang Suryadi', 'Hendra Permana',
            'Agus Setiawan', 'Budi Rahayu', 'Eko Purnama', 'Rudi Hartono',
            'Wahyu Gunawan', 'Iwan Saputra', 'Cecep Hidayat', 'Dadang Wibowo',
            'Tatang Iskandar', 'Encep Maulana', 'Yayan Firdaus',
        ];

        $parentFemaleNames = [
            'Siti Nurhaliza', 'Euis Rahayu', 'Yati Suryani', 'Neneng Kurniasih',
            'Tuti Alawiyah', 'Imas Solihat', 'Wati Setiawati', 'Cicih Sumiati',
            'Ade Fitriani', 'Neng Sumarni', 'Eneng Nurjanah', 'Ai Rohaeni',
            'Lilis Susilawati', 'Elin Herlina', 'Nani Suparti',
        ];

        $allNames = array_merge($maleNames, $femaleNames);
        shuffle($allNames);

        $studentUsers = User::where('role', 'siswa')->orderBy('id')->get();

        foreach ($studentUsers as $index => $user) {
            $name       = $allNames[$index] ?? "Siswa " . ($index + 1);
            $isMale     = in_array($name, $maleNames);
            $gender     = $isMale ? 'male' : 'female';
            $nisn       = '007' . str_pad(14000 + $index + 1, 7, '0', STR_PAD_LEFT);
            $birthYear  = rand(2007, 2010);
            $birthMonth = rand(1, 12);
            $birthDay   = rand(1, 28);

            $parentName  = $isMale
                ? $parentMaleNames[array_rand($parentMaleNames)]
                : $parentFemaleNames[array_rand($parentFemaleNames)];
            // Format nomor WA orang tua: 628xxxxxxxx (10-11 digit setelah 62)
            $parentPhone = '628' . rand(10, 99) . rand(10000000, 99999999);

            Student::create([
                'user_id'      => $user->id,
                'name'         => $name,
                'nisn'         => $nisn,
                'gender'       => $gender,
                'birth_date'   => sprintf('%04d-%02d-%02d', $birthYear, $birthMonth, $birthDay),
                'birth_place'  => $birthPlaces[array_rand($birthPlaces)],
                'parent_name'  => $parentName,
                'parent_phone' => $parentPhone,
            ]);
        }
    }
}
