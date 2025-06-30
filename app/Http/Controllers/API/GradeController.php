<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    /**
     * Mendapatkan semua nilai siswa yang sedang login
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Ambil user yang sedang login
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        // Ambil nilai tugas siswa
        $submissions = AssignmentSubmission::with(['assignment.subject'])
            ->where('student_id', $student->id)
            ->whereNotNull('grade')
            ->orderBy('created_at', 'desc')
            ->get();

        // Kelompokkan nilai berdasarkan mata pelajaran
        $subjectGrades = [];
        foreach ($submissions as $submission) {
            $subjectId = $submission->assignment->subject_id;
            $subjectName = $submission->assignment->subject->name;

            if (!isset($subjectGrades[$subjectId])) {
                $subjectGrades[$subjectId] = [
                    'subject_id' => $subjectId,
                    'subject_name' => $subjectName,
                    'assignments' => [],
                    'average_grade' => 0,
                    'total_graded' => 0
                ];
            }

            $subjectGrades[$subjectId]['assignments'][] = [
                'assignment_id' => $submission->assignment_id,
                'title' => $submission->assignment->title,
                'grade' => $submission->grade,
                'message_eval' => $submission->message_eval,
                'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i:s') : null,
                'is_late' => $submission->isLate()
            ];

            $subjectGrades[$subjectId]['total_graded']++;
            // Recalculate average for this subject
            $totalGrade = array_sum(array_column($subjectGrades[$subjectId]['assignments'], 'grade'));
            $subjectGrades[$subjectId]['average_grade'] = round($totalGrade / $subjectGrades[$subjectId]['total_graded'], 2);
        }

        // Hitung statistik nilai keseluruhan
        $overallStats = [
            'total_assignments' => count($submissions),
            'average_grade' => $submissions->avg('grade') ?? 0,
            'highest_grade' => $submissions->max('grade') ?? 0,
            'lowest_grade' => $submissions->min('grade') ?? 0
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'overall_stats' => [
                    'total_assignments' => $overallStats['total_assignments'],
                    'average_grade' => round($overallStats['average_grade'], 2),
                    'highest_grade' => $overallStats['highest_grade'],
                    'lowest_grade' => $overallStats['lowest_grade']
                ],
                'subjects' => array_values($subjectGrades)
            ]
        ]);
    }

    /**
     * Mendapatkan nilai siswa berdasarkan mata pelajaran
     *
     * @param Request $request
     * @param int $subjectId
     * @return \Illuminate\Http\JsonResponse
     */
    public function bySubject(Request $request, $subjectId)
    {
        // Validasi subject ID
        $subject = Subject::find($subjectId);
        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Mata pelajaran tidak ditemukan'
            ], 404);
        }

        // Ambil user yang sedang login
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        // Cek apakah siswa memiliki akses ke mata pelajaran ini
        $hasAccess = $student->isEnrolledIn($subject->class_id);
        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar untuk mata pelajaran ini'
            ], 403);
        }

        // Ambil semua tugas untuk mata pelajaran ini
        $assignments = Assignment::where('subject_id', $subjectId)->get();
        $assignmentIds = $assignments->pluck('id')->toArray();

        // Ambil nilai tugas siswa untuk mata pelajaran ini
        $submissions = AssignmentSubmission::with('assignment')
            ->where('student_id', $student->id)
            ->whereIn('assignment_id', $assignmentIds)
            ->whereNotNull('grade')
            ->get();

        // Siapkan data nilai
        $gradedAssignments = [];
        foreach ($submissions as $submission) {
            $gradedAssignments[] = [
                'assignment_id' => $submission->assignment_id,
                'title' => $submission->assignment->title,
                'description' => $submission->assignment->description,
                'deadline' => $submission->assignment->deadline->format('Y-m-d H:i:s'),
                'grade' => $submission->grade,
                'message_eval' => $submission->message_eval,
                'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i:s') : null,
                'is_late' => $submission->isLate()
            ];
        }

        // Ambil tugas yang belum dinilai
        $submittedButNotGraded = AssignmentSubmission::with('assignment')
            ->where('student_id', $student->id)
            ->whereIn('assignment_id', $assignmentIds)
            ->whereNull('grade')
            ->whereNotNull('submitted_at')
            ->get()
            ->map(function ($submission) {
                return [
                    'assignment_id' => $submission->assignment_id,
                    'title' => $submission->assignment->title,
                    'description' => $submission->assignment->description,
                    'deadline' => $submission->assignment->deadline->format('Y-m-d H:i:s'),
                    'submitted_at' => $submission->submitted_at->format('Y-m-d H:i:s'),
                    'is_late' => $submission->isLate()
                ];
            });

        // Ambil tugas yang belum dikumpulkan
        $notSubmitted = Assignment::where('subject_id', $subjectId)
            ->whereNotIn('id', $submissions->pluck('assignment_id')->merge($submittedButNotGraded->pluck('assignment_id')))
            ->get()
            ->map(function ($assignment) {
                return [
                    'assignment_id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
                    'is_overdue' => $assignment->isOverdue()
                ];
            });

        // Statistik nilai
        $stats = [
            'total_assignments' => count($assignments),
            'graded' => count($gradedAssignments),
            'submitted_not_graded' => count($submittedButNotGraded),
            'not_submitted' => count($notSubmitted),
            'average_grade' => $submissions->avg('grade') ?? 0,
            'highest_grade' => $submissions->max('grade') ?? 0,
            'lowest_grade' => $submissions->min('grade') ?? 0
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'subject' => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'description' => $subject->description,
                    'teacher' => [
                        'id' => $subject->teacher->id,
                        'name' => $subject->teacher->name
                    ]
                ],
                'stats' => [
                    'total_assignments' => $stats['total_assignments'],
                    'graded' => $stats['graded'],
                    'submitted_not_graded' => $stats['submitted_not_graded'],
                    'not_submitted' => $stats['not_submitted'],
                    'average_grade' => round($stats['average_grade'], 2),
                    'highest_grade' => $stats['highest_grade'],
                    'lowest_grade' => $stats['lowest_grade']
                ],
                'assignments' => [
                    'graded' => $gradedAssignments,
                    'submitted_not_graded' => $submittedButNotGraded,
                    'not_submitted' => $notSubmitted
                ]
            ]
        ]);
    }

    /**
     * Mendapatkan detail nilai tugas tertentu
     *
     * @param Request $request
     * @param int $assignmentId
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignmentDetail(Request $request, $assignmentId)
    {
        // Validasi assignment ID
        $assignment = Assignment::with('subject')->find($assignmentId);
        if (!$assignment) {
            return response()->json([
                'success' => false,
                'message' => 'Tugas tidak ditemukan'
            ], 404);
        }

        // Ambil user yang sedang login
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        // Cek apakah siswa memiliki akses ke mata pelajaran ini
        $hasAccess = $student->isEnrolledIn($assignment->subject->class_id);
        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar untuk mata pelajaran ini'
            ], 403);
        }

        // Ambil pengumpulan tugas siswa
        $submission = AssignmentSubmission::where('assignment_id', $assignmentId)
            ->where('student_id', $student->id)
            ->first();

        // Siapkan data assignment
        $assignmentData = [
            'id' => $assignment->id,
            'title' => $assignment->title,
            'description' => $assignment->description,
            'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
            'file_path' => $assignment->file_path,
            'has_file' => $assignment->hasFile(),
            'is_overdue' => $assignment->isOverdue(),
            'subject' => [
                'id' => $assignment->subject->id,
                'name' => $assignment->subject->name
            ]
        ];

        // Siapkan data submission jika ada
        $submissionData = null;
        if ($submission) {
            $submissionData = [
                'id' => $submission->id,
                'submission_text' => $submission->submission_text,
                'file_path' => $submission->file_path,
                'has_file' => $submission->hasFile(),
                'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i:s') : null,
                'is_late' => $submission->isLate(),
                'grade' => $submission->grade,
                'message_eval' => $submission->message_eval,
                'is_graded' => $submission->isGraded()
            ];
        }

        // Statistik kelas jika tugas sudah dinilai
        $classStats = null;
        if ($submission && $submission->isGraded()) {
            // Ambil nilai rata-rata kelas untuk tugas ini
            $classAverage = AssignmentSubmission::where('assignment_id', $assignmentId)
                ->whereNotNull('grade')
                ->avg('grade') ?? 0;

            // Ambil nilai tertinggi dan terendah untuk tugas ini
            $highestGrade = AssignmentSubmission::where('assignment_id', $assignmentId)
                ->whereNotNull('grade')
                ->max('grade') ?? 0;

            $lowestGrade = AssignmentSubmission::where('assignment_id', $assignmentId)
                ->whereNotNull('grade')
                ->min('grade') ?? 0;

            // Hitung peringkat siswa untuk tugas ini
            $higherGrades = AssignmentSubmission::where('assignment_id', $assignmentId)
                ->whereNotNull('grade')
                ->where('grade', '>', $submission->grade)
                ->count();

            $rank = $higherGrades + 1;

            // Hitung total siswa yang sudah dinilai
            $totalGraded = AssignmentSubmission::where('assignment_id', $assignmentId)
                ->whereNotNull('grade')
                ->count();

            $classStats = [
                'average_grade' => round($classAverage, 2),
                'highest_grade' => $highestGrade,
                'lowest_grade' => $lowestGrade,
                'your_rank' => $rank,
                'total_students_graded' => $totalGraded
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'assignment' => $assignmentData,
                'submission' => $submissionData,
                'class_stats' => $classStats
            ]
        ]);
    }
}
