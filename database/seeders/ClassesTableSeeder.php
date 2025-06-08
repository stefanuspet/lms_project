<?php

namespace Database\Seeders;

use App\Models\Classroom;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Daftar kelas SMK berdasarkan jurusan dan tingkat
        $classNames = [
            'X RPL 1',
            'X RPL 2',
            'X TKJ 1',
            'X TKJ 2',
            'X AKL 1',
            'X OTKP 1',
            'XI RPL 1',
            'XI RPL 2',
            'XI TKJ 1',
            'XI TKJ 2',
            'XI AKL 1',
            'XI OTKP 1',
            'XII RPL 1',
            'XII RPL 2',
            'XII TKJ 1',
            'XII TKJ 2',
            'XII AKL 1',
            'XII OTKP 1',
        ];

        // Membuat data kelas
        foreach ($classNames as $className) {
            Classroom::create([
                'name' => $className,
                'description' => "Kelas $className untuk tahun ajaran " . date('Y') . "/" . (date('Y') + 1),
            ]);
        }
    }
}
