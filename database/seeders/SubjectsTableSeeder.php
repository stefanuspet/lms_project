<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubjectsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = Classroom::all();
        $teachers = Teacher::all();

        // Mata pelajaran umum SMK
        $commonSubjects = [
            'Matematika' => 'Mata pelajaran matematika dasar untuk SMK',
            'Bahasa Indonesia' => 'Mata pelajaran bahasa dan sastra Indonesia',
            'Bahasa Inggris' => 'Mata pelajaran bahasa Inggris',
            'Pendidikan Agama' => 'Mata pelajaran pendidikan agama',
            'PPKN' => 'Pendidikan Pancasila dan Kewarganegaraan',
            'Sejarah Indonesia' => 'Mata pelajaran sejarah nasional Indonesia',
            'PJOK' => 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
        ];

        // Mata pelajaran produktif/jurusan
        $productiveSubjects = [
            'RPL' => [
                'Pemrograman Dasar',
                'Pemrograman Web',
                'Pemrograman Berbasis Objek',
                'Basis Data',
                'Rekayasa Perangkat Lunak',
            ],
            'TKJ' => [
                'Komputer dan Jaringan Dasar',
                'Administrasi Infrastruktur Jaringan',
                'Teknologi Layanan Jaringan',
                'Sistem Operasi Jaringan',
            ],
            'AKL' => [
                'Akuntansi Dasar',
                'Praktikum Akuntansi Keuangan',
                'Perpajakan',
                'Aplikasi Pengolah Angka',
            ],
            'OTKP' => [
                'Korespondensi',
                'Manajemen Informasi',
                'Kearsipan',
                'Pengelolaan Kas Kecil',
            ],
        ];

        foreach ($classes as $class) {
            // Tentukan jurusan dari nama kelas (misalnya "X RPL 1")
            $jurusan = collect(array_keys($productiveSubjects))->first(fn($key) => str_contains($class->name, $key));

            // Jika jurusan ditemukan, gabungkan mapel umum dan produktif
            $subjects = $commonSubjects;

            if ($jurusan) {
                foreach ($productiveSubjects[$jurusan] as $mapel) {
                    $subjects[$mapel] = "Mata pelajaran produktif jurusan $jurusan: $mapel";
                }
            }

            // Insert ke database
            foreach ($subjects as $subjectName => $description) {
                $teacher = $teachers->random();

                Subject::create([
                    'class_id' => $class->id,
                    'teacher_id' => $teacher->id,
                    'name' => $subjectName,
                    'description' => $description,
                ]);
            }
        }
    }
}
