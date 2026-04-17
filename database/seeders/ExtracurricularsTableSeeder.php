<?php

namespace Database\Seeders;

use App\Models\Extracurricular;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExtracurricularsTableSeeder extends Seeder
{
    public function run(): void
    {
        $currentSemester = Semester::latest('start_date')->first();

        // Cari guru berdasarkan email
        $getTeacher = function (string $email) {
            $user = User::where('email', $email)->first();
            return $user ? Teacher::where('user_id', $user->id)->first() : null;
        };

        $extracurriculars = [
            [
                'name'        => 'Pramuka',
                'description' => 'Kegiatan kepramukaan untuk membentuk karakter, disiplin, dan jiwa kepemimpinan siswa.',
                'teacher_email' => 'hendra.wijaya@smkn1.sch.id',
                'day'         => 'friday',
                'start_time'  => '14:00',
                'end_time'    => '16:00',
                'room'        => 'Lapangan Utama',
            ],
            [
                'name'        => 'Futsal',
                'description' => 'Olahraga futsal untuk mengembangkan kemampuan fisik dan kerja sama tim.',
                'teacher_email' => 'dian.pratama@smkn1.sch.id',
                'day'         => 'wednesday',
                'start_time'  => '14:30',
                'end_time'    => '16:30',
                'room'        => 'Lapangan Olahraga',
            ],
            [
                'name'        => 'Basket',
                'description' => 'Ekstrakurikuler basket untuk mengembangkan bakat olahraga dan sportivitas.',
                'teacher_email' => 'dian.pratama@smkn1.sch.id',
                'day'         => 'thursday',
                'start_time'  => '14:30',
                'end_time'    => '16:30',
                'room'        => 'Lapangan Basket',
            ],
            [
                'name'        => 'Paskibra',
                'description' => 'Pasukan Pengibar Bendera sekolah untuk upacara bendera dan lomba baris-berbaris.',
                'teacher_email' => 'rina.susanti@smkn1.sch.id',
                'day'         => 'saturday',
                'start_time'  => '07:00',
                'end_time'    => '10:00',
                'room'        => 'Lapangan Utama',
            ],
            [
                'name'        => 'English Club',
                'description' => 'Klub bahasa Inggris untuk meningkatkan kemampuan komunikasi dan debat dalam Bahasa Inggris.',
                'teacher_email' => 'ahmad.fauzi@smkn1.sch.id',
                'day'         => 'tuesday',
                'start_time'  => '14:00',
                'end_time'    => '16:00',
                'room'        => 'R. Bahasa',
            ],
            [
                'name'        => 'Robotika',
                'description' => 'Klub robotika dan IoT untuk mengembangkan kreativitas di bidang teknologi dan programming.',
                'teacher_email' => 'arief.nugroho@smkn1.sch.id',
                'day'         => 'saturday',
                'start_time'  => '07:00',
                'end_time'    => '10:00',
                'room'        => 'Lab Komputer 1',
            ],
        ];

        $students = Student::all();

        foreach ($extracurriculars as $data) {
            $teacher = $getTeacher($data['teacher_email']);
            if (!$teacher) continue;

            $ekskul = Extracurricular::create([
                'name'        => $data['name'],
                'description' => $data['description'],
                'teacher_id'  => $teacher->id,
                'semester_id' => $currentSemester->id,
                'day_of_week' => $data['day'],
                'start_time'  => $data['start_time'],
                'end_time'    => $data['end_time'],
                'room'        => $data['room'],
                'is_active'   => true,
            ]);

            // Daftarkan 8-15 siswa secara acak ke setiap ekstrakurikuler
            $memberCount = rand(8, min(15, $students->count()));
            $members = $students->random($memberCount);

            foreach ($members as $i => $student) {
                DB::table('extracurricular_student')->insertOrIgnore([
                    'extracurricular_id' => $ekskul->id,
                    'student_id'         => $student->id,
                    'joined_at'          => Carbon::parse($currentSemester->start_date)->addDays(rand(1, 14)),
                    'role'               => $i === 0 ? 'ketua' : 'anggota',
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);
            }
        }
    }
}
