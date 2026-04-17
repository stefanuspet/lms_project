<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Semester;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssignmentsTableSeeder extends Seeder
{
    public function run(): void
    {
        // Semester aktif: Genap 2025/2026 (5 Jan - 13 Jun 2026)
        $currentSemester = Semester::latest('start_date')->first();
        $semStart = Carbon::parse($currentSemester->start_date);

        // Deadline per tipe tugas (relatif dari awal semester)
        $assignmentDeadlines = [
            'Tugas Harian'          => $semStart->copy()->addWeeks(3),   // ~26 Jan 2026 (sudah lewat)
            'Proyek Kelompok'       => $semStart->copy()->addWeeks(7),   // ~23 Feb 2026 (sudah lewat)
            'Ujian Tengah Semester' => $semStart->copy()->addWeeks(11),  // ~23 Mar 2026 (sudah lewat)
            'Ujian Akhir Semester'  => $semStart->copy()->addWeeks(20),  // ~25 Mei 2026 (belum lewat)
        ];

        $evalMessages = [
            'Sangat baik! Pertahankan prestasi ini.',
            'Bagus, teruskan belajarnya.',
            'Cukup baik, perlu sedikit peningkatan.',
            'Perlu lebih teliti dalam pengerjaan.',
            'Kerja keras kamu sudah terlihat, terus berlatih.',
        ];

        $subjects = Subject::all();

        foreach ($subjects as $subject) {
            // Ambil siswa yang terdaftar di kelas ini pada semester aktif
            $studentIds = DB::table('semesters_students')
                ->where('semesters_id', $currentSemester->id)
                ->where('class_id', $subject->class_id)
                ->pluck('students_id')
                ->toArray();

            if (empty($studentIds)) continue;

            foreach ($assignmentDeadlines as $type => $deadline) {
                $assignment = Assignment::create([
                    'subject_id'  => $subject->id,
                    'title'       => "{$type}: {$subject->name}",
                    'description' => $this->getDescription($type, $subject->name),
                    'file_path'   => null,
                    'deadline'    => $deadline,
                ]);

                $isPast = $deadline->isPast();

                // Untuk tugas yang sudah lewat, buat submission dari sebagian besar siswa
                if ($isPast && !empty($studentIds)) {
                    // 70-90% siswa mengumpulkan
                    $submitCount = (int) ceil(count($studentIds) * (rand(70, 90) / 100));
                    $submittingStudents = array_slice($studentIds, 0, $submitCount);

                    foreach ($submittingStudents as $studentId) {
                        // Waktu submit: 1-3 hari sebelum deadline
                        $submittedAt = $deadline->copy()->subDays(rand(1, 3))->subHours(rand(1, 8));

                        AssignmentSubmission::create([
                            'assignment_id'  => $assignment->id,
                            'student_id'     => $studentId,
                            'submission_text' => "Berikut adalah jawaban tugas {$subject->name} - {$type}.",
                            'file_path'      => null,
                            'grade'          => rand(65, 100),
                            'message_eval'   => $evalMessages[array_rand($evalMessages)],
                            'submitted_at'   => $submittedAt,
                        ]);
                    }
                }
            }
        }
    }

    private function getDescription(string $type, string $subjectName): string
    {
        return match ($type) {
            'Tugas Harian'          => "Kerjakan soal-soal latihan {$subjectName} untuk memperdalam pemahaman materi yang telah dipelajari.",
            'Proyek Kelompok'       => "Buat proyek kelompok (3-4 orang) yang menerapkan konsep {$subjectName} dalam kehidupan nyata.",
            'Ujian Tengah Semester' => "Ujian Tengah Semester mata pelajaran {$subjectName}. Kerjakan secara individu dan jujur.",
            'Ujian Akhir Semester'  => "Ujian Akhir Semester mata pelajaran {$subjectName}. Mencakup seluruh materi semester ini.",
            default                 => "Tugas {$subjectName}.",
        };
    }
}
