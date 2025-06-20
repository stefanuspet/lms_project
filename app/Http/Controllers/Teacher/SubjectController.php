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
                ->with(['classroom', 'teacher']);

            // Apply search filters
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply additional filters
            if ($filterClass) {
                $query->where('class_id', $filterClass);
            }

            // Apply sorting
            $query->orderBy($sortBy, $sortOrder);

            // Execute paginated query
            $subjects = $query->paginate($perPage)->withQueryString();

            // Format data for frontend
            $formattedSubjects = $subjects->map(function ($subject) {
                // Get student count for this subject's class
                $studentCount = DB::table('semesters_students')
                    ->where('class_id', $subject->class_id)
                    ->distinct('students_id')
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
                    'class_name' => $subject->classroom ? $subject->classroom->name : '-',
                    'semester_name' => 'Current Semester', // You can enhance this with actual semester data
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

            // Load relations
            $subject->load(['classroom', 'teacher']);

            // Get student count and list for this subject's class
            $students = Student::whereHas('classes', function ($query) use ($subject) {
                $query->where('class_id', $subject->class_id);
            })->get();

            // Get counts for materials, assignments, and attendance
            $materialsCount = Material::where('subject_id', $subject->id)->count();
            $assignmentsCount = Assignment::where('subject_id', $subject->id)->count();
            $attendanceCount = DB::table('attendance_sessions')
                ->where('subject_id', $subject->id)
                ->count();

            // Get pending submissions count
            $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($query) use ($subject) {
                $query->where('subject_id', $subject->id);
            })->whereNull('grade')->count();

            // Format student data with completion statistics
            $formattedStudents = $students->map(function ($student) use ($subject, $assignmentsCount) {
                // Calculate completed assignments
                $completedAssignments = AssignmentSubmission::whereHas('assignment', function ($query) use ($subject) {
                    $query->where('subject_id', $subject->id);
                })->where('student_id', $student->id)->count();

                // Calculate attendance rate
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
                'class_name' => $subject->classroom->name,
                'semester_name' => 'Current Semester', // You can enhance this with actual semester data
                'student_count' => $students->count(),
                'materials_count' => $materialsCount,
                'assignments_count' => $assignmentsCount,
                'attendance_count' => $attendanceCount,
                'pending_submissions_count' => $pendingSubmissions,
                'students' => $formattedStudents,
                'created_at' => $subject->created_at->format('d-m-Y'),
            ];

            return Inertia::render('Teacher/Subject/Show', [
                'subject' => $formattedSubject
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher subject show: ' . $e->getMessage());
            return redirect()->route('teacher.subjects.index')
                ->with('error', 'Error displaying subject details: ' . $e->getMessage());
        }
    }

    // Function to log activity
    private function logActivity($userId, $action, $description)
    {
        DB::table('activity_logs')->insert([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}