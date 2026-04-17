<?php

namespace Database\Seeders;

use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class SchedulesTableSeeder extends Seeder
{
    public function run(): void
    {
        $currentSemester = Semester::latest('start_date')->first();

        // Slot waktu (sesi 90 menit)
        $timeSlots = [
            ['07:00', '08:30'],
            ['08:30', '10:00'],
            ['10:15', '11:45'],
            ['12:30', '14:00'],
            ['14:00', '15:30'],
        ];

        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        // Ruangan per jurusan/kelas
        $roomMap = [
            'RPL'  => ['Lab Komputer 1', 'Lab Komputer 2'],
            'TKJ'  => ['Lab TKJ', 'Lab Komputer 2'],
            'AKL'  => ['Lab Akuntansi', 'R. 201'],
            'OTKP' => ['R. 202', 'R. 203'],
        ];

        $practicalSubjects = [
            'Pemrograman Dasar', 'Pemrograman Web', 'Pemrograman Berbasis Objek',
            'Basis Data', 'Rekayasa Perangkat Lunak',
            'Komputer dan Jaringan Dasar', 'Administrasi Infrastruktur Jaringan',
            'Teknologi Layanan Jaringan', 'Sistem Operasi Jaringan',
            'Praktikum Akuntansi Keuangan', 'Aplikasi Pengolah Angka',
        ];

        $classes = Classroom::all();

        foreach ($classes as $classIndex => $class) {
            // Tentukan jurusan dan nomor kelas (untuk offset hari agar tidak bentrok)
            preg_match('/^(X{1,3})\s+(\w+)\s+(\d+)$/', $class->name, $matches);
            $tingkat = $matches[1] ?? 'X';
            $jurusan = $matches[2] ?? '';
            $nomorKelas = (int)($matches[3] ?? 1);

            // Offset awal slot untuk tiap kelas agar jadwal tersebar
            $dayOffset  = ($classIndex * 2) % count($days);
            $slotOffset = ($nomorKelas - 1) * 2 % count($timeSlots);

            $subjects = Subject::where('class_id', $class->id)->get();

            $slotIdx = $slotOffset;
            $dayIdx  = $dayOffset;

            foreach ($subjects as $subject) {
                $day  = $days[$dayIdx % count($days)];
                $slot = $timeSlots[$slotIdx % count($timeSlots)];

                // Tentukan ruangan
                if ($subject->name === 'PJOK') {
                    $room = 'Lapangan Olahraga';
                } elseif (in_array($subject->name, $practicalSubjects)) {
                    $labRooms = $roomMap[$jurusan] ?? ['Lab Komputer 1'];
                    $room = $labRooms[0];
                } else {
                    // Ruang teori berdasarkan tingkat + nomor kelas
                    $floorMap = ['X' => '1', 'XI' => '2', 'XII' => '3'];
                    $floor = $floorMap[$tingkat] ?? '1';
                    $room  = 'R. ' . $floor . '0' . $nomorKelas;
                }

                Schedule::create([
                    'class_id'    => $class->id,
                    'subject_id'  => $subject->id,
                    'teacher_id'  => $subject->teacher_id,
                    'semester_id' => $currentSemester->id,
                    'day_of_week' => $day,
                    'start_time'  => $slot[0],
                    'end_time'    => $slot[1],
                    'room'        => $room,
                ]);

                // Maju ke slot berikutnya
                $slotIdx++;
                if ($slotIdx % count($timeSlots) === 0) {
                    $dayIdx++;
                }
            }
        }
    }
}
