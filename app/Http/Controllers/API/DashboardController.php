<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Attendance;
use App\Models\Material;
use App\Models\Notification;
use App\Models\Student;
use App\Models\Subject;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get dashboard data for student
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Get current user and student data
        $user = $request->user();
        $student = $this->getStudentData($user->id);

        if (!$student) {
            return $this->errorResponse('Student data not found');
        }

        // Get active semester and class for student
        $semesterAndClass = $this->getActiveSemesterAndClass($student);

        if (isset($semesterAndClass['error'])) {
            return $this->errorResponse($semesterAndClass['error']);
        }

        $activeSemester = $semesterAndClass['semester'];
        $currentClass = $semesterAndClass['class'];

        // Get subjects and related data
        $subjectsData = $this->getSubjectsData($currentClass, $student);
        $subjects = $subjectsData['subjects'];
        $subjectIds = $subjectsData['subjectIds'];
        $formattedSubjects = $subjectsData['formattedSubjects'];

        // Calculate dashboard stats
        $stats = $this->calculateStats($student, $subjects, $subjectIds, $activeSemester);

        // Get upcoming assignments
        $upcomingAssignments = $this->getUpcomingAssignments($student, $subjectIds, 5);

        // Get recent materials
        $recentMaterials = $this->getRecentMaterials($subjectIds, 5);

        // Get unread notifications count
        $unreadNotificationsCount = $this->getUnreadNotificationsCount($user->id);

        // Debug logging
        $this->logDebugInfo($student, $activeSemester, $currentClass, $stats);

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'name' => $student->name,
                ],
                'stats' => $stats,
                'upcoming_assignments' => $upcomingAssignments,
                'unread_notifications' => $unreadNotificationsCount,
            ]
        ]);
    }

    /**
     * Get subjects for student
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function subjects(Request $request): JsonResponse
    {
        // Get current user and student data
        $user = $request->user();
        $student = $this->getStudentData($user->id);

        if (!$student) {
            return $this->errorResponse('Student data not found');
        }

        // Get active semester and class for student
        $semesterAndClass = $this->getActiveSemesterAndClass($student);

        if (isset($semesterAndClass['error'])) {
            return $this->errorResponse($semesterAndClass['error']);
        }

        $currentClass = $semesterAndClass['class'];

        // Get subjects data
        $subjectsData = $this->getSubjectsData($currentClass, $student);
        $formattedSubjects = $subjectsData['formattedSubjects'];

        return response()->json([
            'success' => true,
            'data' => $formattedSubjects
        ]);
    }

    /**
     * Get upcoming assignments
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function upcomingAssignments(Request $request): JsonResponse
    {
        // Get current user and student data
        $user = $request->user();
        $student = $this->getStudentData($user->id);

        if (!$student) {
            return $this->errorResponse('Student data not found');
        }

        // Get active semester and class for student
        $semesterAndClass = $this->getActiveSemesterAndClass($student);

        if (isset($semesterAndClass['error'])) {
            return $this->errorResponse($semesterAndClass['error']);
        }

        $currentClass = $semesterAndClass['class'];

        // Get subject IDs
        $subjectIds = $currentClass->subjects()->pluck('id')->toArray();

        // Get limit parameter
        $limit = $request->input('limit', 5);

        // Get upcoming assignments
        $upcomingAssignments = $this->getUpcomingAssignments($student, $subjectIds, $limit);

        return response()->json([
            'success' => true,
            'data' => $upcomingAssignments
        ]);
    }

    /**
     * Get recent materials
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function recentMaterials(Request $request): JsonResponse
    {
        // Get current user and student data
        $user = $request->user();
        $student = $this->getStudentData($user->id);

        if (!$student) {
            return $this->errorResponse('Student data not found');
        }

        // Get active semester and class for student
        $semesterAndClass = $this->getActiveSemesterAndClass($student);

        if (isset($semesterAndClass['error'])) {
            return $this->errorResponse($semesterAndClass['error']);
        }

        $currentClass = $semesterAndClass['class'];

        // Get subject IDs
        $subjectIds = $currentClass->subjects()->pluck('id')->toArray();

        // Get limit parameter
        $limit = $request->input('limit', 5);

        // Get recent materials
        $recentMaterials = $this->getRecentMaterials($subjectIds, $limit);

        return response()->json([
            'success' => true,
            'data' => $recentMaterials
        ]);
    }

    /**
     * Get student data by user ID
     * 
     * @param int $userId
     * @return Student|null
     */
    private function getStudentData(int $userId): ?Student
    {
        return Student::where('user_id', $userId)->first();
    }

    /**
     * Get active semester and class for student
     * 
     * @param Student $student
     * @return array
     */
    private function getActiveSemesterAndClass(Student $student): array
    {
        // Get active semester for student
        $activeSemester = $student->semesters()
            ->orderBy('start_date', 'desc')
            ->get()
            ->first(function ($semester) {
                return $semester->isActive();
            });

        if (!$activeSemester) {
            // If no active semester, get the most recent semester
            $activeSemester = $student->semesters()
                ->orderBy('start_date', 'desc')
                ->first();
        }

        if (!$activeSemester) {
            return ['error' => 'No active semester found'];
        }

        // Get current class for student
        $currentClass = $student->getClassesForSemester($activeSemester->id)->first();

        if (!$currentClass) {
            return ['error' => 'No class assignment found for the current semester'];
        }

        return [
            'semester' => $activeSemester,
            'class' => $currentClass
        ];
    }

    /**
     * Get subjects data for class and student
     * 
     * @param mixed $currentClass
     * @param Student $student
     * @return array
     */
    private function getSubjectsData($currentClass, Student $student): array
    {
        // Get subjects for current class
        $subjects = $currentClass->subjects()->with('teacher')->get();
        $subjectIds = $subjects->pluck('id')->toArray();

        // Format subjects data
        $formattedSubjects = $subjects->map(function ($subject) use ($student) {
            $materialsCount = Material::where('subject_id', $subject->id)->count();

            $assignments = Assignment::where('subject_id', $subject->id)->get();
            $assignmentsCount = $assignments->count();

            $completedAssignments = AssignmentSubmission::where('student_id', $student->id)
                ->whereIn('assignment_id', $assignments->pluck('id')->toArray())
                ->whereNotNull('submitted_at')
                ->count();

            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'teacher_name' => $subject->teacher ? $subject->teacher->name : 'Not Assigned',
                'materials_count' => $materialsCount,
                'assignments_count' => $assignmentsCount,
                'completed_assignments' => $completedAssignments,
            ];
        });

        return [
            'subjects' => $subjects,
            'subjectIds' => $subjectIds,
            'formattedSubjects' => $formattedSubjects
        ];
    }

    /**
     * Calculate dashboard stats
     * 
     * @param Student $student
     * @param mixed $subjects
     * @param array $subjectIds
     * @param mixed $activeSemester
     * @return array
     */
    private function calculateStats(Student $student, $subjects, array $subjectIds, $activeSemester): array
    {
        // Calculate total subjects
        $totalSubjects = count($subjects);

        // Get assignments data
        $assignmentsQuery = Assignment::whereIn('subject_id', $subjectIds);
        $totalAssignments = $assignmentsQuery->count();

        // Get completed assignments
        $completedAssignments = AssignmentSubmission::where('student_id', $student->id)
            ->whereIn('assignment_id', $assignmentsQuery->pluck('id')->toArray())
            ->whereNotNull('submitted_at')
            ->count();

        // Get pending assignments (not submitted yet)
        $pendingAssignments = $totalAssignments - $completedAssignments;

        // Calculate attendance rate
        $attendanceSessions = Attendance::where('student_id', $student->id)
            ->whereHas('session', function ($query) use ($activeSemester) {
                $query->where('semester_id', $activeSemester->id);
            })
            ->count();

        $presentCount = Attendance::where('student_id', $student->id)
            ->whereHas('session', function ($query) use ($activeSemester) {
                $query->where('semester_id', $activeSemester->id);
            })
            ->where('status', 'hadir')
            ->count();

        $attendanceRate = $attendanceSessions > 0
            ? round(($presentCount / $attendanceSessions) * 100, 2) . '%'
            : '0%';

        return [
            'total_subjects' => $totalSubjects,
            'pending_assignments' => $pendingAssignments,
            'completed_assignments' => $completedAssignments,
            'attendance_rate' => $attendanceRate,
        ];
    }

    /**
     * Get upcoming assignments
     * 
     * @param Student $student
     * @param array $subjectIds
     * @param int $limit
     * @return array
     */
    private function getUpcomingAssignments(Student $student, array $subjectIds, int $limit): array
    {
        return Assignment::whereIn('subject_id', $subjectIds)
            ->where('deadline', '>', Carbon::now())
            ->whereDoesntHave('submissions', function ($query) use ($student) {
                $query->where('student_id', $student->id)
                    ->whereNotNull('submitted_at');
            })
            ->orderBy('deadline')
            ->limit($limit)
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'subject_name' => $assignment->subject->name,
                    'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
                ];
            })
            ->toArray();
    }

    /**
     * Get recent materials
     * 
     * @param array $subjectIds
     * @param int $limit
     * @return array
     */
    private function getRecentMaterials(array $subjectIds, int $limit): array
    {
        return Material::whereIn('subject_id', $subjectIds)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'subject_name' => $material->subject->name,
                    'uploaded_at' => $material->created_at->format('Y-m-d H:i:s'),
                ];
            })
            ->toArray();
    }

    /**
     * Get unread notifications count
     * 
     * @param int $userId
     * @return int
     */
    private function getUnreadNotificationsCount(int $userId): int
    {
        // Fix untuk masalah notifiable_type dan notifiable_id
        // Menggunakan direct query ke tabel notifikasi dengan user_id
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Log debug information
     * 
     * @param Student $student
     * @param mixed $activeSemester
     * @param mixed $currentClass
     * @param array $stats
     * @return void
     */
    private function logDebugInfo(Student $student, $activeSemester, $currentClass, array $stats): void
    {
        Log::debug('Dashboard Stats', [
            'studentId' => $student->id,
            'activeSemesterId' => $activeSemester->id,
            'currentClassId' => $currentClass->id,
            'stats' => $stats
        ]);
    }

    /**
     * Return error response
     * 
     * @param string $message
     * @param int $statusCode
     * @return JsonResponse
     */
    private function errorResponse(string $message, int $statusCode = 404): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $statusCode);
    }
}
