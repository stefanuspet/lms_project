<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Material;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Get current semester and class
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return Inertia::render('Student/Dashboard', [
                    'student' => $student,
                    'stats' => [
                        'total_subjects' => 0,
                        'pending_assignments' => 0,
                        'completed_assignments' => 0,
                        'attendance_rate' => '0%'
                    ],
                    'upcoming_assignments' => [],
                    'recent_materials' => [],
                    'notifications' => [],
                    'current_subjects' => []
                ]);
            }

            $currentClassId = $currentSemesterStudent->class_id;
            $currentSemesterId = $currentSemesterStudent->semesters_id;

            // Get subjects for this student's class
            $subjects = Subject::where('class_id', $currentClassId)->get();
            $subjectIds = $subjects->pluck('id')->toArray();

            // Get upcoming assignments (due in the next 7 days)
            $upcomingAssignments = Assignment::whereIn('subject_id', $subjectIds)
                ->where('deadline', '>', now())
                ->where('deadline', '<', now()->addDays(7))
                ->orderBy('deadline')
                ->limit(5)
                ->get()
                ->map(function ($assignment) use ($student) {
                    // Check if student has submitted
                    $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                        ->where('student_id', $student->id)
                        ->first();

                    $subject = Subject::find($assignment->subject_id);

                    return [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'subject_name' => $subject ? $subject->name : 'Unknown Subject',
                        'deadline' => $assignment->deadline->format('d M Y, H:i'),
                        'days_remaining' => now()->diffInDays($assignment->deadline, false),
                        'is_submitted' => $submission ? true : false,
                    ];
                });

            // Get recent materials
            $recentMaterials = Material::whereIn('subject_id', $subjectIds)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($material) {
                    $subject = Subject::find($material->subject_id);

                    return [
                        'id' => $material->id,
                        'title' => $material->title,
                        'subject_name' => $subject ? $subject->name : 'Unknown Subject',
                        'file_type' => $material->file_type,
                        'created_at' => $material->created_at->format('d M Y'),
                    ];
                });

            // Get recent notifications
            $notifications = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'title' => $notification->title,
                        'content' => $notification->content,
                        'is_read' => $notification->is_read,
                        'type' => $notification->type,
                        'created_at' => $notification->created_at->diffForHumans(),
                    ];
                });

            // Get statistics
            $totalSubjects = count($subjects);

            $pendingAssignments = Assignment::whereIn('subject_id', $subjectIds)
                ->where('deadline', '>', now())
                ->whereDoesntHave('submissions', function ($query) use ($student) {
                    $query->where('student_id', $student->id);
                })
                ->count();

            $completedAssignments = AssignmentSubmission::where('student_id', $student->id)
                ->whereHas('assignment', function ($query) use ($subjectIds) {
                    $query->whereIn('subject_id', $subjectIds);
                })
                ->count();

            // Calculate attendance rate
            $attendanceSessions = DB::table('attendance_sessions')
                ->whereIn('subject_id', $subjectIds)
                ->count();

            $studentAttendances = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->whereIn('attendance_sessions.subject_id', $subjectIds)
                ->where('attendances.student_id', $student->id)
                ->where('attendances.status', 'hadir')
                ->count();

            $attendanceRate = $attendanceSessions > 0
                ? round(($studentAttendances / $attendanceSessions) * 100) . '%'
                : 'N/A';

            // Format current subjects
            $currentSubjects = $subjects->map(function ($subject) use ($student) {
                // Get material count
                $materialCount = Material::where('subject_id', $subject->id)->count();

                // Get assignment count
                $assignmentCount = Assignment::where('subject_id', $subject->id)->count();

                // Get completed assignments
                $completedAssignments = AssignmentSubmission::where('student_id', $student->id)
                    ->whereHas('assignment', function ($query) use ($subject) {
                        $query->where('subject_id', $subject->id);
                    })
                    ->count();

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'teacher_name' => $subject->teacher ? $subject->teacher->name : 'Unknown Teacher',
                    'materials_count' => $materialCount,
                    'assignments_count' => $assignmentCount,
                    'completed_assignments' => $completedAssignments,
                ];
            });

            // Return data to view
            return Inertia::render('Student/Dashboard', [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'email' => $user->email,
                    'class_name' => DB::table('classes')->where('id', $currentClassId)->value('name') ?? 'Unknown Class',
                ],
                'stats' => [
                    'total_subjects' => $totalSubjects,
                    'pending_assignments' => $pendingAssignments,
                    'completed_assignments' => $completedAssignments,
                    'attendance_rate' => $attendanceRate
                ],
                'upcoming_assignments' => $upcomingAssignments,
                'recent_materials' => $recentMaterials,
                'notifications' => $notifications,
                'current_subjects' => $currentSubjects
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student dashboard: ' . $e->getMessage());

            // Return error response
            return redirect()->back()->withErrors([
                'error' => 'Failed to load dashboard: ' . $e->getMessage()
            ]);
        }
    }
}
