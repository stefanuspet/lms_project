<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\DiscussionThread;
use App\Models\Material;
use App\Models\Quiz;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentSubjectController extends Controller
{
    /**
     * Get detailed subject summary for current student.
     */
    public function show(Request $request, Subject $subject)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan',
            ], 404);
        }

        // Pastikan subject sesuai dengan kelas aktif siswa
        $current = DB::table('semesters_students')
            ->where('students_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$current || (int) $subject->class_id !== (int) $current->class_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke mata pelajaran ini',
            ], 403);
        }

        $subject->load(['classroom', 'teacher']);

        // Assignment stats
        $assignmentIds = Assignment::where('subject_id', $subject->id)->pluck('id');
        $totalAssignments = $assignmentIds->count();
        $completedAssignments = AssignmentSubmission::where('student_id', $student->id)
            ->whereIn('assignment_id', $assignmentIds)
            ->whereNotNull('submitted_at')
            ->count();
        $pendingAssignments = max(0, $totalAssignments - $completedAssignments);

        // Attendance rate for this subject
        $attendanceRate = $this->getAttendanceRate($subject->id, $student->id);

        // Recent materials
        $recentMaterials = Material::where('subject_id', $subject->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function (Material $material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'created_at' => $material->created_at->format('Y-m-d H:i:s'),
                    'file_type' => $material->file_type,
                    'has_file' => (bool) $material->file_path,
                ];
            });

        // Upcoming assignments
        $upcomingAssignments = Assignment::where('subject_id', $subject->id)
            ->where('deadline', '>', now())
            ->orderBy('deadline')
            ->limit(5)
            ->get()
            ->map(function (Assignment $assignment) use ($student) {
                $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                    ->where('student_id', $student->id)
                    ->first();

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
                    'is_submitted' => (bool) $submission,
                    'grade' => $submission?->grade,
                ];
            });

        // Recent quizzes
        $recentQuizzes = Quiz::where('subject_id', $subject->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function (Quiz $quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'created_at' => $quiz->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Recent discussions
        $recentDiscussions = DiscussionThread::where('subject_id', $subject->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function (DiscussionThread $thread) {
                return [
                    'id' => $thread->id,
                    'title' => $thread->title,
                    'created_at' => $thread->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Simple combined recent activities (materials + assignments + quizzes + discussions)
        $activities = [];

        foreach ($recentMaterials as $m) {
            $activities[] = [
                'type' => 'material',
                'id' => $m['id'],
                'title' => $m['title'],
                'date' => $m['created_at'],
            ];
        }

        foreach ($upcomingAssignments as $a) {
            $activities[] = [
                'type' => 'assignment',
                'id' => $a['id'],
                'title' => $a['title'],
                'date' => $a['deadline'],
            ];
        }

        foreach ($recentQuizzes as $q) {
            $activities[] = [
                'type' => 'quiz',
                'id' => $q['id'],
                'title' => $q['title'],
                'date' => $q['created_at'],
            ];
        }

        foreach ($recentDiscussions as $d) {
            $activities[] = [
                'type' => 'discussion',
                'id' => $d['id'],
                'title' => $d['title'],
                'date' => $d['created_at'],
            ];
        }

        usort($activities, function ($a, $b) {
            return strcmp($b['date'], $a['date']);
        });

        $activities = array_slice($activities, 0, 10);

        return response()->json([
            'success' => true,
            'data' => [
                'subject' => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'class_name' => $subject->classroom?->name ?? '-',
                    'teacher_name' => $subject->teacher?->name ?? '-',
                ],
                'stats' => [
                    'total_assignments' => $totalAssignments,
                    'completed_assignments' => $completedAssignments,
                    'pending_assignments' => $pendingAssignments,
                    'attendance_rate' => $attendanceRate,
                ],
                'recent_materials' => $recentMaterials,
                'upcoming_assignments' => $upcomingAssignments,
                'recent_quizzes' => $recentQuizzes,
                'recent_discussions' => $recentDiscussions,
                'recent_activities' => $activities,
            ],
        ]);
    }

    private function getAttendanceRate(int $subjectId, int $studentId): string
    {
        try {
            // Gunakan semester aktif siswa, karena tabel attendance_sessions
            // tidak lagi menyimpan kolom subject_id.
            $current = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $studentId)
                ->orderBy('semesters.end_date', 'desc')
                ->select('semesters.id as semester_id')
                ->first();

            if (!$current) {
                return 'N/A';
            }

            $totalSessions = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->where('attendance_sessions.semester_id', $current->semester_id)
                ->where('attendances.student_id', $studentId)
                ->count();

            if ($totalSessions === 0) {
                return 'N/A';
            }

            $presentCount = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->where('attendance_sessions.semester_id', $current->semester_id)
                ->where('attendances.student_id', $studentId)
                ->where('attendances.status', 'hadir')
                ->count();

            return round(($presentCount / $totalSessions) * 100) . '%';
        } catch (\Exception $e) {
            // Jika terjadi error (misal struktur tabel berubah), jangan jatuhkan API
            return 'N/A';
        }
    }
}
