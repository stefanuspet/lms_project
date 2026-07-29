<?php

namespace Database\Seeders;

use App\Models\Classroom;
use Illuminate\Database\Seeder;

class ClassesTableSeeder extends Seeder
{
    public function run(): void
    {
        $jurusan = [
            ['code' => 'KP',  'name' => 'Layanan Penunjang Keperawatan dan Caregiving'],
            ['code' => 'AKL', 'name' => 'Akuntansi dan Keuangan Lembaga'],
            ['code' => 'BDP', 'name' => 'Bisnis Daring dan Pemasaran'],
        ];

        foreach (['X', 'XI', 'XII'] as $grade) {
            foreach ($jurusan as $j) {
                Classroom::firstOrCreate(
                    ['name' => "$grade {$j['code']} 1"],
                    ['description' => "Kelas $grade {$j['name']}"]
                );
            }
        }
    }
}
