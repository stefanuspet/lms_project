<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Material;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Validate input
            $validated = $request->validate([
                'search' => 'nullable|string|max:50',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'sort_by' => 'nullable|string|in:name,created_at',
                'sort_order' => 'nullable|string|in:asc,desc',
            ]);

            // Set default values if not provided
            $search = $request->input('search', '');
            $perPage = $request->input('per_page', 10);
            $sortBy = $request->input('sort_by', 'name');
            $sortOrder = $request->input('sort_order', 'asc');
            $page = $request->input('page', 1);

            // Get current semester and class
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return Inertia::render('Student/Subject/Index', [
                    'subjects' => [],
                    'pagination' => [
                        'total' => 0,
                        'per_page' => $perPage,
                        'current_page' => 1,
                        'last_page' => 1,
                    ],
                    'filters' => [
                        'search' => $search,
                        'sort_by' => $sortBy,
                        'sort_order' => $sortOrder,
                    ]
                ]);
            }

            $currentClassId = $currentSemesterStudent->class_id;

            // Query subjects for this student's class
            $query = Subject::query()
                ->where('class_id', $currentClassId)
                ->with(['classroom', 'teacher']);

            // Apply search filters
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $query->orderBy($sortBy, $sortOrder);

            // Execute paginated query
            $subjects = $query->paginate($perPage)->withQueryString();

            // Format data for frontend
            $formattedSubjects = $subjects->map(function ($subject) use ($student) {
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

                // Get pending assignments
                $pendingAssignments = Assignment::where('subject_id', $subject->id)
                    ->where('deadline', '>', now())
                    ->whereDoesntHave('submissions', function ($query) use ($student) {
                        $query->where('student_id', $student->id);
                    })
                    ->count();

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'description' => $subject->description,
                    'teacher_name' => $subject->teacher ? $subject->teacher->name : '-',
                    'class_name' => $subject->classroom ? $subject->classroom->name : '-',
                    'materials_count' => $materialCount,
                    'assignments_count' => $assignmentCount,
                    'completed_assignments' => $completedAssignments,
                    'pending_assignments' => $pendingAssignments,
                    'created_at' => $subject->created_at->format('d-m-Y'),
                ];
            });

            // Return data to view
            return Inertia::render('Student/Subject/Index', [
                'subjects' => $formattedSubjects,
                'pagination' => [
                    'total' => $subjects->total(),
                    'per_page' => $subjects->perPage(),
                    'current_page' => $subjects->currentPage(),
                    'last_page' => $subjects->lastPage(),
                    'from' => $subjects->firstItem(),
                    'to' => $subjects->lastItem(),
                ],
                'filters' => [
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student subjects index: ' . $e->getMessage());

            // Return error response
            return redirect()->back()->withErrors([
                'error' => 'Failed to load subjects: ' . $e->getMessage()
            ]);
        }
    }

    public function show(Subject $subject)
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

            if (!$currentSemesterStudent || $subject->class_id != $currentSemesterStudent->class_id) {
                return redirect()->route('student.subjects.index')
                    ->with('error', 'You do not have access to this subject.');
            }

            // Load relations
            $subject->load(['classroom', 'teacher']);

            // Get recent materials
            $recentMaterials = Material::where('subject_id', $subject->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($material) {
                    return [
                        'id' => $material->id,
                        'title' => $material->title,
                        'file_type' => $material->file_type,
                        'created_at' => $material->created_at->format('d M Y'),
                    ];
                });

            // Get upcoming assignments
            $upcomingAssignments = Assignment::where('subject_id', $subject->id)
                ->where('deadline', '>', now())
                ->orderBy('deadline')
                ->limit(5)
                ->get()
                ->map(function ($assignment) use ($student) {
                    // Check if student has submitted
                    $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                        ->where('student_id', $student->id)
                        ->first();

                    return [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'deadline' => $assignment->deadline->format('d M Y, H:i'),
                        'days_remaining' => now()->diffInDays($assignment->deadline, false),
                        'is_submitted' => $submission ? true : false,
                        'grade' => $submission && $submission->grade ? $submission->grade : null,
                    ];
                });

            // Get completed assignments with grades
            $completedAssignments = AssignmentSubmission::where('student_id', $student->id)
                ->whereHas('assignment', function ($query) use ($subject) {
                    $query->where('subject_id', $subject->id);
                })
                ->with('assignment')
                ->orderBy('submitted_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'assignment_id' => $submission->assignment->id,
                        'title' => $submission->assignment->title,
                        'submitted_at' => $submission->submitted_at->format('d M Y, H:i'),
                        'grade' => $submission->grade,
                        'message_eval' => $submission->message_eval,
                    ];
                });

            // Get material count
            $materialCount = Material::where('subject_id', $subject->id)->count();

            // Get assignment count
            $assignmentCount = Assignment::where('subject_id', $subject->id)->count();

            // Get completed assignments count
            $completedAssignmentsCount = AssignmentSubmission::where('student_id', $student->id)
                ->whereHas('assignment', function ($query) use ($subject) {
                    $query->where('subject_id', $subject->id);
                })
                ->count();

            // Get attendance rate
            $attendanceSessions = DB::table('attendance_sessions')
                ->where('subject_id', $subject->id)
                ->count();

            $studentAttendances = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->where('attendance_sessions.subject_id', $subject->id)
                ->where('attendances.student_id', $student->id)
                ->where('attendances.status', 'hadir')
                ->count();

            $attendanceRate = $attendanceSessions > 0
                ? round(($studentAttendances / $attendanceSessions) * 100) . '%'
                : 'N/A';

            // Format data for view
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                'teacher_name' => $subject->teacher ? $subject->teacher->name : '-',
                'class_name' => $subject->classroom->name,
                'materials_count' => $materialCount,
                'assignments_count' => $assignmentCount,
                'completed_assignments' => $completedAssignmentsCount,
                'attendance_rate' => $attendanceRate,
                'recent_materials' => $recentMaterials,
                'upcoming_assignments' => $upcomingAssignments,
                'completed_assignments_list' => $completedAssignments,
                'created_at' => $subject->created_at->format('d-m-Y'),
            ];

            return Inertia::render('Student/Subject/Show', [
                'subject' => $formattedSubject
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student subject show: ' . $e->getMessage());
            return redirect()->route('student.subjects.index')
                ->with('error', 'Error displaying subject details: ' . $e->getMessage());
        }
    }
}
