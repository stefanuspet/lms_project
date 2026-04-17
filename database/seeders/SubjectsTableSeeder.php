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
        // Map setiap mata pelajaran ke email guru yang tepat
        $subjectTeacherEmail = [
            // Umum
            'Matematika'                          => 'budi.santoso@smkn1.sch.id',
            'Bahasa Indonesia'                    => 'siti.rahayu@smkn1.sch.id',
            'Bahasa Inggris'                      => 'ahmad.fauzi@smkn1.sch.id',
            'Pendidikan Agama'                    => 'dewi.kurniawati@smkn1.sch.id',
            'PPKN'                                => 'hendra.wijaya@smkn1.sch.id',
            'Sejarah Indonesia'                   => 'rina.susanti@smkn1.sch.id',
            'PJOK'                                => 'dian.pratama@smkn1.sch.id',
            // RPL
            'Pemrograman Dasar'                   => 'arief.nugroho@smkn1.sch.id',
            'Pemrograman Web'                     => 'arief.nugroho@smkn1.sch.id',
            'Pemrograman Berbasis Objek'           => 'arief.nugroho@smkn1.sch.id',
            'Basis Data'                          => 'yuliana.safitri@smkn1.sch.id',
            'Rekayasa Perangkat Lunak'            => 'yuliana.safitri@smkn1.sch.id',
            // TKJ
            'Komputer dan Jaringan Dasar'         => 'bambang.suryadi@smkn1.sch.id',
            'Administrasi Infrastruktur Jaringan' => 'bambang.suryadi@smkn1.sch.id',
            'Teknologi Layanan Jaringan'          => 'eko.prasetyo@smkn1.sch.id',
            'Sistem Operasi Jaringan'             => 'eko.prasetyo@smkn1.sch.id',
            // AKL
            'Akuntansi Dasar'                     => 'sri.wahyuni@smkn1.sch.id',
            'Praktikum Akuntansi Keuangan'        => 'sri.wahyuni@smkn1.sch.id',
            'Perpajakan'                          => 'muhammad.ridwan@smkn1.sch.id',
            'Aplikasi Pengolah Angka'             => 'muhammad.ridwan@smkn1.sch.id',
            // OTKP
            'Korespondensi'                       => 'fitria.handayani@smkn1.sch.id',
            'Manajemen Informasi'                 => 'fitria.handayani@smkn1.sch.id',
            'Kearsipan'                           => 'agus.hermawan@smkn1.sch.id',
            'Pengelolaan Kas Kecil'               => 'agus.hermawan@smkn1.sch.id',
        ];

        // Preload teacher by email untuk menghindari N+1
        $teacherByEmail = [];
        foreach ($subjectTeacherEmail as $subjectName => $email) {
            if (!isset($teacherByEmail[$email])) {
                $user = User::where('email', $email)->first();
                $teacherByEmail[$email] = $user
                    ? Teacher::where('user_id', $user->id)->first()
                    : null;
            }
        }

        // Fallback: guru pertama jika mapping tidak ditemukan
        $fallbackTeacher = Teacher::first();

        $commonSubjects = [
            'Matematika'       => 'Mata pelajaran matematika dasar untuk SMK',
            'Bahasa Indonesia' => 'Mata pelajaran bahasa dan sastra Indonesia',
            'Bahasa Inggris'   => 'Mata pelajaran bahasa Inggris untuk komunikasi global',
            'Pendidikan Agama' => 'Mata pelajaran pendidikan agama dan budi pekerti',
            'PPKN'             => 'Pendidikan Pancasila dan Kewarganegaraan',
            'Sejarah Indonesia' => 'Mata pelajaran sejarah nasional Indonesia',
            'PJOK'             => 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
        ];

        $productiveSubjects = [
            'RPL' => [
                'Pemrograman Dasar'         => 'Dasar-dasar logika dan pemrograman komputer',
                'Pemrograman Web'           => 'Pengembangan aplikasi berbasis web (HTML, CSS, JS, PHP)',
                'Pemrograman Berbasis Objek' => 'Konsep OOP dengan Java/Python',
                'Basis Data'               => 'Perancangan dan pengelolaan basis data relasional',
                'Rekayasa Perangkat Lunak' => 'Metodologi pengembangan perangkat lunak',
            ],
            'TKJ' => [
                'Komputer dan Jaringan Dasar'         => 'Dasar-dasar komputer dan jaringan komputer',
                'Administrasi Infrastruktur Jaringan' => 'Konfigurasi dan administrasi infrastruktur jaringan',
                'Teknologi Layanan Jaringan'          => 'Layanan-layanan jaringan seperti DNS, DHCP, Web Server',
                'Sistem Operasi Jaringan'             => 'Administrasi sistem operasi Linux dan Windows Server',
            ],
            'AKL' => [
                'Akuntansi Dasar'              => 'Prinsip dan siklus akuntansi dasar',
                'Praktikum Akuntansi Keuangan' => 'Praktik penyusunan laporan keuangan perusahaan',
                'Perpajakan'                   => 'Peraturan perpajakan Indonesia dan SPT',
                'Aplikasi Pengolah Angka'      => 'Microsoft Excel dan aplikasi akuntansi',
            ],
            'OTKP' => [
                'Korespondensi'        => 'Tata tulis surat bisnis dalam Bahasa Indonesia dan Inggris',
                'Manajemen Informasi'  => 'Pengelolaan informasi dan dokumen perkantoran',
                'Kearsipan'            => 'Sistem pengarsipan manual dan elektronik',
                'Pengelolaan Kas Kecil' => 'Administrasi keuangan dan pengelolaan petty cash',
            ],
        ];

        $classes = Classroom::all();

        foreach ($classes as $class) {
            $jurusan = collect(array_keys($productiveSubjects))
                ->first(fn($key) => str_contains($class->name, $key));

            $subjects = $commonSubjects;

            if ($jurusan) {
                foreach ($productiveSubjects[$jurusan] as $mapel => $desc) {
                    $subjects[$mapel] = $desc;
                }
            }

            foreach ($subjects as $subjectName => $description) {
                $email   = $subjectTeacherEmail[$subjectName] ?? null;
                $teacher = $email ? ($teacherByEmail[$email] ?? $fallbackTeacher) : $fallbackTeacher;

                Subject::create([
                    'class_id'    => $class->id,
                    'teacher_id'  => $teacher->id,
                    'name'        => $subjectName,
                    'description' => $description,
                ]);
            }
        }
    }
}
