<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->with('user')->firstOrFail();

            // Get teacher's subjects
            $subjects = Subject::where('teacher_id', $teacher->id)
                ->with('classroom')
                ->get();

            // Calculate total classes (unique classes)
            $totalClasses = $subjects->pluck('class_id')->unique()->count();

            // Calculate total students (unique students across all classes)
            $totalStudents = DB::table('semesters_students')
                ->whereIn('class_id', $subjects->pluck('class_id'))
                ->distinct('students_id')
                ->count('students_id');

            // Active assignments (deadlines in the future)
            $activeAssignments = Assignment::whereIn('subject_id', $subjects->pluck('id'))
                ->where('deadline', '>', now())
                ->count();

            // Pending submissions (submitted but not graded)
            $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($query) use ($subjects) {
                $query->whereIn('subject_id', $subjects->pluck('id'));
            })->whereNull('grade')->count();

            // Compile stats
            $stats = [
                'total_subjects' => $subjects->count(),
                'total_classes' => $totalClasses,
                'total_students' => $totalStudents,
                'active_assignments' => $activeAssignments,
                'pending_submissions' => $pendingSubmissions,
            ];

            // Get upcoming assignments with deadlines
            $upcomingAssignments = Assignment::whereIn('subject_id', $subjects->pluck('id'))
                ->where('deadline', '>', now())
                ->orderBy('deadline', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($assignment) {
                    // Count submissions
                    $submissionCount = AssignmentSubmission::where('assignment_id', $assignment->id)->count();

                    // Count students in the class
                    $studentCount = DB::table('semesters_students')
                        ->where('class_id', $assignment->subject->class_id)
                        ->distinct('students_id')
                        ->count('students_id');

                    // Calculate days remaining
                    $daysRemaining = now()->diffInDays($assignment->deadline);

                    return [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'subject_name' => $assignment->subject->name,
                        'class_name' => $assignment->subject->classroom ? $assignment->subject->classroom->name : '-',
                        'deadline' => $assignment->deadline->format('d M Y, H:i'),
                        'days_remaining' => $daysRemaining,
                        'submission_count' => $submissionCount,
                        'student_count' => $studentCount,
                    ];
                });

            // Get recent submissions
            $recentSubmissions = AssignmentSubmission::whereHas('assignment', function ($query) use ($subjects) {
                $query->whereIn('subject_id', $subjects->pluck('id'));
            })
                ->with(['student', 'assignment'])
                ->orderBy('submitted_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'student_name' => $submission->student->name,
                        'assignment_title' => $submission->assignment->title,
                        'submitted_at' => $submission->submitted_at->format('d M Y, H:i'),
                        'is_graded' => $submission->grade !== null,
                    ];
                });

            // Get notifications
            $notifications = DB::table('notifications')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'title' => $notification->title,
                        'content' => $notification->content,
                        'type' => $notification->type,
                        'is_read' => (bool)$notification->is_read,
                        'created_at' => date('d M Y, H:i', strtotime($notification->created_at)),
                    ];
                });

            // Format current classes (subjects)
            $currentClasses = $subjects->map(function ($subject) {
                // Count materials
                $materialsCount = Material::where('subject_id', $subject->id)->count();

                // Count assignments
                $assignmentsCount = Assignment::where('subject_id', $subject->id)->count();

                // Count students
                $studentCount = DB::table('semesters_students')
                    ->where('class_id', $subject->class_id)
                    ->distinct('students_id')
                    ->count('students_id');

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'class_name' => $subject->classroom ? $subject->classroom->name : '-',
                    'materials_count' => $materialsCount,
                    'assignments_count' => $assignmentsCount,
                    'student_count' => $studentCount,
                ];
            })->take(6);

            // Format teacher data
            $teacherData = [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'nip' => $teacher->nip,
                'email' => $teacher->user->email,
                'phone' => $teacher->phone,
                'address' => $teacher->address,
            ];

            return Inertia::render('Teacher/Dashboard', [
                'teacher' => $teacherData,
                'stats' => $stats,
                'upcoming_assignments' => $upcomingAssignments,
                'recent_submissions' => $recentSubmissions,
                'notifications' => $notifications,
                'current_classes' => $currentClasses,
            ]);
        } catch (\Exception $e) {
            // Log error
            // \log::error('Error in teacher dashboard: ' . $e->getMessage());

            // Return a basic view with error message
            return Inertia::render('Teacher/Dashboard', [
                'error' => 'An error occurred while loading the dashboard: ' . $e->getMessage(),
                'teacher' => [
                    'name' => Auth::user()->name ?? 'Teacher',
                ],
                'stats' => [
                    'total_subjects' => 0,
                    'total_classes' => 0,
                    'total_students' => 0,
                    'active_assignments' => 0,
                    'pending_submissions' => 0,
                ],
                'upcoming_assignments' => [],
                'recent_submissions' => [],
                'notifications' => [],
                'current_classes' => [],
            ]);
        }
    }
}
