<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Student;
use App\Models\Material;
use App\Models\Assignment;
use App\Models\Teacher;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Validate input
            $validated = $request->validate([
                'search' => 'nullable|string|max:50',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'sort_by' => 'nullable|string|in:name,class_id,created_at',
                'sort_order' => 'nullable|string|in:asc,desc',
                'filter_class' => 'nullable|integer',
                'filter_semester' => 'nullable|integer',
            ]);

            // Set default values if not provided
            $search = $request->input('search', '');
            $perPage = $request->input('per_page', 10);
            $sortBy = $request->input('sort_by', 'name');
            $sortOrder = $request->input('sort_order', 'asc');
            $page = $request->input('page', 1);
            $filterClass = $request->input('filter_class');
            $filterSemester = $request->input('filter_semester');

            // Query subjects assigned to this teacher
            $query = Subject::query()
                ->where('teacher_id', $teacher->id)
                ->leftJoin('classes', 'subjects.class_id', '=', 'classes.id')
                ->select('subjects.*', 'classes.name as class_name');

            // Apply search filters
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('subjects.name', 'like', "%{$search}%")
                        ->orWhere('subjects.description', 'like', "%{$search}%");
                });
            }

            // Apply additional filters
            if ($filterClass) {
                $query->where('subjects.class_id', $filterClass);
            }

            // Apply sorting
            $query->orderBy("subjects.{$sortBy}", $sortOrder);

            // Execute paginated query
            $subjects = $query->paginate($perPage)->withQueryString();

            // Format data for frontend
            $formattedSubjects = $subjects->map(function ($subject) {
                // Get student count for this subject's class - FIX: Use correct column name
                $studentCount = DB::table('semesters_students')
                    ->where('class_id', $subject->class_id)
                    ->distinct('students_id') // Use whatever column name exists in your DB
                    ->count('students_id');

                // Get material count
                $materialCount = Material::where('subject_id', $subject->id)->count();

                // Get assignment count
                $assignmentCount = Assignment::where('subject_id', $subject->id)->count();

                // Get pending submissions count
                $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($query) use ($subject) {
                    $query->where('subject_id', $subject->id);
                })->whereNull('grade')->count();

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'description' => $subject->description,
                    'class_name' => $subject->class_name ?? '-',
                    'semester_name' => 'Current Semester',
                    'student_count' => $studentCount,
                    'materials_count' => $materialCount,
                    'assignments_count' => $assignmentCount,
                    'pending_submissions_count' => $pendingSubmissions,
                    'class_id' => $subject->class_id,
                    'created_at' => $subject->created_at->format('d-m-Y'),
                ];
            });

            // Log the successful request
            Log::info('Teacher subjects fetched successfully', [
                'teacher_id' => $teacher->id,
                'subjects_count' => $subjects->count()
            ]);

            // Return data to view
            return Inertia::render('Teacher/Subject/Index', [
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
                    'filter_class' => $filterClass,
                    'filter_semester' => $filterSemester,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher subjects index: ' . $e->getMessage());

            // Return error response
            return redirect()->back()->withErrors([
                'error' => 'Failed to load subjects: ' . $e->getMessage()
            ]);
        }
    }

    public function show(Subject $subject)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Make sure this subject belongs to the current teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to view this subject.');
            }

            // Get class information using raw query to avoid relationship issues
            $classInfo = DB::table('classes')
                ->where('id', $subject->class_id)
                ->first();

            // Get students for this subject's class - FIX: Use direct DB query instead of relationship
            $students = DB::table('students')
                ->join('semesters_students', 'students.id', '=', 'semesters_students.students_id')
                ->where('semesters_students.class_id', $subject->class_id)
                ->select('students.*')
                ->get();

            // Get counts for materials, assignments, and attendance
            $materialsCount = Material::where('subject_id', $subject->id)->count();
            $assignmentsCount = Assignment::where('subject_id', $subject->id)->count();

            // Get attendance count with error handling
            $attendanceCount = 0;
            try {
                $attendanceCount = DB::table('attendance_sessions')
                    ->where('subject_id', $subject->id)
                    ->count();
            } catch (\Exception $e) {
                Log::warning('Could not get attendance count: ' . $e->getMessage());
            }

            // Get pending submissions count
            $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($query) use ($subject) {
                $query->where('subject_id', $subject->id);
            })->whereNull('grade')->count();

            // Format student data with completion statistics
            $formattedStudents = $students->map(function ($student) use ($subject, $assignmentsCount) {
                // Calculate completed assignments
                $completedAssignments = 0;
                try {
                    $completedAssignments = AssignmentSubmission::whereHas('assignment', function ($query) use ($subject) {
                        $query->where('subject_id', $subject->id);
                    })->where('student_id', $student->id)->count();
                } catch (\Exception $e) {
                    Log::warning('Could not get completed assignments for student ' . $student->id);
                }

                // Calculate attendance rate with error handling
                $attendanceRate = 'N/A';
                try {
                    $attendanceSessions = DB::table('attendance_sessions')
                        ->where('subject_id', $subject->id)
                        ->count();

                    if ($attendanceSessions > 0) {
                        $studentAttendances = DB::table('attendances')
                            ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                            ->where('attendance_sessions.subject_id', $subject->id)
                            ->where('attendances.student_id', $student->id)
                            ->where('attendances.status', 'hadir')
                            ->count();

                        $attendanceRate = round(($studentAttendances / $attendanceSessions) * 100) . '%';
                    }
                } catch (\Exception $e) {
                    Log::warning('Could not calculate attendance rate for student ' . $student->id);
                }

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'gender' => $student->gender ? ucfirst($student->gender) : '-',
                    'completed_assignments' => $completedAssignments,
                    'attendance_rate' => $attendanceRate
                ];
            });

            // Format data for view
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                'class_name' => $classInfo ? $classInfo->name : 'Unknown Class',
                'semester_name' => 'Current Semester',
                'student_count' => $students->count(),
                'materials_count' => $materialsCount,
                'assignments_count' => $assignmentsCount,
                'attendance_count' => $attendanceCount,
                'pending_submissions_count' => $pendingSubmissions,
                'students' => $formattedStudents,
                'created_at' => $subject->created_at->format('d-m-Y'),
            ];

            // Log successful access
            $this->logActivity($user->id, 'view_subject', "Viewed subject: {$subject->name}");

            return Inertia::render('Teacher/Subject/Show', [
                'subject' => $formattedSubject
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher subject show: ' . $e->getMessage(), [
                'subject_id' => $subject->id ?? 'unknown',
                'user_id' => Auth::id(),
                'stack_trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('teacher.subjects.index')
                ->with('error', 'Error displaying subject details. Please try again.');
        }
    }

    // Function to log activity
    private function logActivity($userId, $action, $description)
    {
        try {
            DB::table('activity_logs')->insert([
                'user_id' => $userId,
                'action' => $action,
                'description' => $description,
                'ip_address' => request()->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::warning('Could not log activity: ' . $e->getMessage());
        }
    }
}
