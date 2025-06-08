<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AssignmentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all subjects
        $subjects = Subject::all();

        // Define assignment types
        $assignmentTypes = [
            'Tugas Harian' => 'Tugas harian untuk memperdalam pemahaman materi yang sudah dipelajari di kelas.',
            'Proyek Kelompok' => 'Proyek kelompok untuk melatih kemampuan bekerja sama dan menerapkan konsep yang sudah dipelajari.',
            'Ujian Tengah Semester' => 'Ujian tengah semester untuk mengevaluasi pemahaman siswa terhadap materi yang sudah dipelajari.',
            'Ujian Akhir Semester' => 'Ujian akhir semester untuk mengevaluasi pemahaman siswa terhadap seluruh materi yang sudah dipelajari.',
        ];

        // Create assignments for each subject
        foreach ($subjects as $subject) {
            foreach ($assignmentTypes as $type => $description) {
                // Create deadline (random days in the future)
                $deadline = Carbon::now()->addDays(rand(7, 30));

                // Create assignment
                $assignment = Assignment::create([
                    'subject_id' => $subject->id,
                    'title' => "$type: {$subject->name}",
                    'description' => $description,
                    'file_path' => null, // Dummy file path could be added here
                    'deadline' => $deadline,
                ]);

                // Create submissions for some students (random)
                $students = Student::inRandomOrder()->take(rand(5, 10))->get();

                foreach ($students as $student) {
                    // Determine if submission is on time or late
                    $submittedAt = Carbon::now()->subDays(rand(1, 10));
                    $isLate = $submittedAt->gt($deadline);

                    // Create submission
                    AssignmentSubmission::create([
                        'assignment_id' => $assignment->id,
                        'student_id' => $student->id,
                        'submission_text' => "Jawaban untuk tugas {$assignment->title} oleh {$student->name}",
                        'file_path' => null, // Dummy file path could be added here
                        'grade' => rand(60, 100), // Random grade between 60-100
                        'message_eval' => rand(0, 1) ? "Bagus, teruskan!" : "Perlu ditingkatkan lagi.",
                        'submitted_at' => $submittedAt,
                    ]);
                }
            }
        }
    }
}
