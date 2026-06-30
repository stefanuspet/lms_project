<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubjectsTableSeeder extends Seeder
{
    public function run(): void
    {
        // Map email guru → Teacher instance
        $teacherByEmail = [];
        $emailList = [
            'hasbiallah671@gmail.com',
            'umi.cahaya89@gmail.com',
            'annisatritari@gmail.com',
            'rimayanti.kartiwa@gmail.com',
            'iyan.apriyanti@gmail.com',
            'sarihartini25@gmail.com',
            'murtini15@guru.smk.belajar.id',
            'rasyananik639@gmail.com',
            'nasrudinnasir72@gmail.com',
            'endahmaryati42@guru.smk.belajar.id',
            'mayga06ptg@gmail.com',
            'bahari.irul@gmail.com',
            'ryoryu2020@gmail.com',
            'siti71171@guru.smk.belajar.id',
            'bambangkarisma@gmail.com',
            'feri.ailaniarka@gmail.com',
            'indahwerdiasih@gmail.com',
        ];
        foreach ($emailList as $email) {
            $user = User::where('email', $email)->first();
            $teacherByEmail[$email] = $user ? Teacher::where('user_id', $user->id)->first() : null;
        }

        $fallback = Teacher::first();
        $t = fn(string $email) => $teacherByEmail[$email] ?? $fallback;

        // Mata pelajaran umum (semua jurusan)
        $commonSubjects = [
            ['name' => 'Matematika',               'teacher' => $t('rasyananik639@gmail.com')],
            ['name' => 'Bahasa Indonesia',          'teacher' => $t('murtini15@guru.smk.belajar.id')],
            ['name' => 'Bahasa Inggris',            'teacher' => $t('umi.cahaya89@gmail.com')],
            ['name' => 'Pendidikan Agama Islam',    'teacher' => $t('nasrudinnasir72@gmail.com')],
            ['name' => 'Pendidikan Pancasila',      'teacher' => $t('bambangkarisma@gmail.com')],
            ['name' => 'PJOK',                      'teacher' => $t('hasbiallah671@gmail.com')],
            ['name' => 'Sejarah',                   'teacher' => $t('bambangkarisma@gmail.com')],
            ['name' => 'Informatika',               'teacher' => $t('bahari.irul@gmail.com')],
            ['name' => 'Proyek IPAS',               'teacher' => $t('siti71171@guru.smk.belajar.id')],
            ['name' => 'Bahasa Jepang',             'teacher' => $t('ryoryu2020@gmail.com')],
        ];

        // Mata pelajaran produktif per jurusan
        $productiveSubjects = [
            'KP' => [
                ['name' => 'Dasar-dasar Layanan Kesehatan', 'teacher' => $t('sarihartini25@gmail.com')],
                ['name' => 'Keperawatan Dasar',             'teacher' => $t('endahmaryati42@guru.smk.belajar.id')],
                ['name' => 'PKK Keperawatan',               'teacher' => $t('annisatritari@gmail.com')],
            ],
            'AKL' => [
                ['name' => 'Akuntansi Dasar',       'teacher' => $t('rimayanti.kartiwa@gmail.com')],
                ['name' => 'Praktikum Akuntansi',   'teacher' => $t('iyan.apriyanti@gmail.com')],
                ['name' => 'PKK Akuntansi',         'teacher' => $t('rimayanti.kartiwa@gmail.com')],
            ],
            'BDP' => [
                ['name' => 'Pemasaran',             'teacher' => $t('feri.ailaniarka@gmail.com')],
                ['name' => 'Ekonomi Bisnis',        'teacher' => $t('bahari.irul@gmail.com')],
                ['name' => 'PKK Pemasaran',         'teacher' => $t('feri.ailaniarka@gmail.com')],
            ],
        ];

        $classes = Classroom::all();

        foreach ($classes as $class) {
            // Tentukan jurusan dari nama kelas (X KP 1 → KP)
            $jurusan = null;
            foreach (array_keys($productiveSubjects) as $key) {
                if (str_contains($class->name, $key)) {
                    $jurusan = $key;
                    break;
                }
            }

            $subjects = $commonSubjects;
            if ($jurusan) {
                $subjects = array_merge($subjects, $productiveSubjects[$jurusan]);
            }

            foreach ($subjects as $s) {
                Subject::create([
                    'class_id'    => $class->id,
                    'teacher_id'  => $s['teacher']?->id ?? $fallback->id,
                    'name'        => $s['name'],
                    'description' => null,
                ]);
            }
        }
    }
}
