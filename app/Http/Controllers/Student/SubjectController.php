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
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Builder;
use Throwable;

class SubjectController extends Controller
{
    /**
     * Display a listing of the subjects.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function index(Request $request)
    {
        try {
            // Get current student
            $student = $this->getCurrentStudent();

            // Validate and prepare search parameters
            $params = $this->validateAndPrepareParams($request);

            // Get current semester enrollment
            $currentEnrollment = $this->getCurrentEnrollment($student);

            // If no enrollment found, return empty result
            if (!$currentEnrollment) {
                return $this->renderEmptyResults($params);
            }

            // Get subjects with pagination and formatting
            $result = $this->getFormattedSubjects(
                $student,
                $currentEnrollment->class_id,
                $params['search'],
                $params['sortBy'],
                $params['sortOrder'],
                $params['perPage']
            );

            // Return data to view
            return Inertia::render('Student/Subject/Index', [
                'subjects' => $result['subjects'],
                'pagination' => $result['pagination'],
                'filters' => [
                    'search' => $params['search'],
                    'sort_by' => $params['sortBy'],
                    'sort_order' => $params['sortOrder'],
                ],
            ]);
        } catch (Throwable $e) {
            return $this->handleException($e, 'Error loading subjects');
        }
    }

    /**
     * Display the specified subject.
     *
     * @param  \App\Models\Subject  $subject
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Subject $subject)
    {
        try {
            // Get current student
            $student = $this->getCurrentStudent();

            // Verify student has access to this subject
            if (!$this->hasAccessToSubject($student, $subject)) {
                return redirect()->route('student.subjects.index')
                    ->with('error', 'You do not have access to this subject.');
            }

            try {
                // Load related data
                $subject->load(['classroom', 'teacher']);

                // Log data for debugging if needed
                // Log::debug('Subject data: ' . json_encode($subject->toArray()));

                // Gather all required data
                $subjectData = $this->gatherSubjectData($subject, $student);

                // Return view with data
                return Inertia::render('Student/Subject/Show', [
                    'subject' => $subjectData
                ]);
            } catch (Throwable $innerException) {
                Log::error('Error preparing subject data: ' . $innerException->getMessage());
                Log::error($innerException->getTraceAsString());

                return redirect()->route('student.subjects.index')
                    ->with('error', 'Error preparing subject data. Please try again later.');
            }
        } catch (Throwable $e) {
            return $this->handleException($e, 'Error displaying subject details');
        }
    }

    /**
     * Get and format subjects with pagination.
     *
     * @param  \App\Models\Student  $student
     * @param  int  $classId
     * @param  string  $search
     * @param  string  $sortBy
     * @param  string  $sortOrder
     * @param  int  $perPage
     * @return array
     */
    private function getFormattedSubjects(Student $student, $classId, $search, $sortBy, $sortOrder, $perPage)
    {
        // Get subjects with pagination
        $subjects = $this->getSubjectsForClass($classId, $search, $sortBy, $sortOrder, $perPage);

        // Extract pagination info
        $pagination = [
            'total' => $subjects->total(),
            'per_page' => $subjects->perPage(),
            'current_page' => $subjects->currentPage(),
            'last_page' => $subjects->lastPage(),
            'from' => $subjects->firstItem(),
            'to' => $subjects->lastItem(),
        ];

        // Format subjects data
        $formattedSubjects = $this->formatSubjectsData($subjects, $student);

        return [
            'subjects' => $formattedSubjects,
            'pagination' => $pagination,
        ];
    }

    /**
     * Get the current authenticated student.
     *
     * @return \App\Models\Student
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    private function getCurrentStudent()
    {
        $user = Auth::user();
        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        return Student::where('user_id', $user->id)->firstOrFail();
    }

    /**
     * Validate and prepare request parameters.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    private function validateAndPrepareParams(Request $request)
    {
        // Validate input
        $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:name,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        // Set default values if not provided
        return [
            'search' => $request->input('search', ''),
            'perPage' => $request->input('per_page', 10),
            'sortBy' => $request->input('sort_by', 'name'),
            'sortOrder' => $request->input('sort_order', 'asc'),
            'page' => $request->input('page', 1),
        ];
    }

    /**
     * Get current semester enrollment for student.
     *
     * @param  \App\Models\Student  $student
     * @return object|null
     */
    private function getCurrentEnrollment(Student $student)
    {
        return DB::table('semesters_students')
            ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
            ->where('semesters_students.students_id', $student->id)
            ->orderBy('semesters.end_date', 'desc')
            ->select(
                'semesters_students.*',
                'semesters.name as semester_name',
                'semesters.start_date',
                'semesters.end_date'
            )
            ->first();
    }

    /**
     * Render empty results when no enrollment is found.
     *
     * @param  array  $params
     * @return \Inertia\Response
     */
    private function renderEmptyResults($params)
    {
        return Inertia::render('Student/Subject/Index', [
            'subjects' => [],
            'pagination' => [
                'total' => 0,
                'per_page' => $params['perPage'],
                'current_page' => 1,
                'last_page' => 1,
                'from' => null,
                'to' => null,
            ],
            'filters' => [
                'search' => $params['search'],
                'sort_by' => $params['sortBy'],
                'sort_order' => $params['sortOrder'],
            ]
        ]);
    }

    /**
     * Get subjects for a specific class with search and sort.
     *
     * @param  int  $classId
     * @param  string  $search
     * @param  string  $sortBy
     * @param  string  $sortOrder
     * @param  int  $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    private function getSubjectsForClass($classId, $search, $sortBy, $sortOrder, $perPage)
    {
        $query = Subject::query()
            ->where('class_id', $classId)
            ->with(['classroom', 'teacher']);

        // Apply search filters
        if (!empty($search)) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        // Execute paginated query
        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Format subjects data for frontend.
     *
     * @param  \Illuminate\Pagination\LengthAwarePaginator  $subjects
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Support\Collection
     */
    private function formatSubjectsData($subjects, Student $student)
    {
        return collect($subjects->items())->map(function ($subject) use ($student) {
            // Get data for subject
            $counts = $this->getSubjectCounts($subject->id, $student->id);

            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                'teacher_name' => $subject->teacher ? $subject->teacher->name : '-',
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
                'materials_count' => $counts['materials'],
                'assignments_count' => $counts['assignments'],
                'completed_assignments' => $counts['completed'],
                'pending_assignments' => $counts['pending'],
                'created_at' => $subject->created_at->format('d-m-Y'),
            ];
        });
    }

    /**
     * Get counts for materials and assignments for a subject.
     *
     * @param  int  $subjectId
     * @param  int  $studentId
     * @return array
     */
    private function getSubjectCounts($subjectId, $studentId)
    {
        try {
            // Get material count
            $materialCount = Material::where('subject_id', $subjectId)->count();

            // Get assignment count
            $assignmentCount = Assignment::where('subject_id', $subjectId)->count();

            // Get completed assignments
            $completedAssignments = AssignmentSubmission::where('student_id', $studentId)
                ->whereHas('assignment', function (Builder $query) use ($subjectId) {
                    $query->where('subject_id', $subjectId);
                })
                ->count();

            // Get pending assignments
            $pendingAssignments = Assignment::where('subject_id', $subjectId)
                ->where('deadline', '>', now())
                ->whereDoesntHave('submissions', function (Builder $query) use ($studentId) {
                    $query->where('student_id', $studentId);
                })
                ->count();

            return [
                'materials' => $materialCount,
                'assignments' => $assignmentCount,
                'completed' => $completedAssignments,
                'pending' => $pendingAssignments,
            ];
        } catch (Throwable $e) {
            Log::error('Error getting subject counts: ' . $e->getMessage());

            // Return default values on error
            return [
                'materials' => 0,
                'assignments' => 0,
                'completed' => 0,
                'pending' => 0,
            ];
        }
    }

    /**
     * Check if student has access to the subject.
     *
     * @param  \App\Models\Student  $student
     * @param  \App\Models\Subject  $subject
     * @return bool
     */
    private function hasAccessToSubject(Student $student, Subject $subject)
    {
        $currentEnrollment = $this->getCurrentEnrollment($student);

        if (!$currentEnrollment) {
            return false;
        }

        return $subject->class_id == $currentEnrollment->class_id;
    }

    /**
     * Gather all data needed for subject detail view.
     *
     * @param  \App\Models\Subject  $subject
     * @param  \App\Models\Student  $student
     * @return array
     */
    private function gatherSubjectData(Subject $subject, Student $student)
    {
        // Get all data in parallel
        $counts = $this->getSubjectCounts($subject->id, $student->id);
        $attendanceRate = $this->getAttendanceRate($subject->id, $student->id);

        // Get recent materials, upcoming assignments, and completed assignments
        $recentMaterials = $this->getRecentMaterials($subject->id);
        $upcomingAssignments = $this->getUpcomingAssignments($subject->id, $student->id);
        $completedAssignments = $this->getCompletedAssignments($subject->id, $student->id);

        // Return formatted data with null checks
        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'description' => $subject->description,
            'teacher_name' => $subject->teacher ? $subject->teacher->name : '-',
            'class_name' => $subject->classroom ? $subject->classroom->name : '-', // Added null check here
            'materials_count' => $counts['materials'],
            'assignments_count' => $counts['assignments'],
            'completed_assignments' => $counts['completed'],
            'attendance_rate' => $attendanceRate,
            'recent_materials' => $recentMaterials,
            'upcoming_assignments' => $upcomingAssignments,
            'completed_assignments_list' => $completedAssignments,
            'created_at' => $subject->created_at->format('d-m-Y'),
        ];
    }

    /**
     * Get recent materials for a subject.
     *
     * @param  int  $subjectId
     * @return \Illuminate\Support\Collection
     */
    private function getRecentMaterials($subjectId)
    {
        try {
            return Material::where('subject_id', $subjectId)
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
        } catch (Throwable $e) {
            Log::error('Error getting recent materials: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get upcoming assignments for a subject.
     *
     * @param  int  $subjectId
     * @param  int  $studentId
     * @return \Illuminate\Support\Collection
     */
    private function getUpcomingAssignments($subjectId, $studentId)
    {
        try {
            return Assignment::where('subject_id', $subjectId)
                ->where('deadline', '>', now())
                ->orderBy('deadline')
                ->limit(5)
                ->get()
                ->map(function ($assignment) use ($studentId) {
                    try {
                        // Check if student has submitted
                        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                            ->where('student_id', $studentId)
                            ->first();

                        return [
                            'id' => $assignment->id,
                            'title' => $assignment->title,
                            'deadline' => $assignment->deadline->format('d M Y, H:i'),
                            'days_remaining' => now()->diffInDays($assignment->deadline, false),
                            'is_submitted' => $submission ? true : false,
                            'grade' => $submission && $submission->grade ? $submission->grade : null,
                        ];
                    } catch (Throwable $e) {
                        Log::error('Error processing assignment ' . $assignment->id . ': ' . $e->getMessage());
                        return null;
                    }
                })
                ->filter(); // Remove null values
        } catch (Throwable $e) {
            Log::error('Error getting upcoming assignments: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get completed assignments for a subject.
     *
     * @param  int  $subjectId
     * @param  int  $studentId
     * @return \Illuminate\Support\Collection
     */
    private function getCompletedAssignments($subjectId, $studentId)
    {
        try {
            return AssignmentSubmission::where('student_id', $studentId)
                ->whereHas('assignment', function (Builder $query) use ($subjectId) {
                    $query->where('subject_id', $subjectId);
                })
                ->with('assignment')
                ->orderBy('submitted_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($submission) {
                    try {
                        return [
                            'id' => $submission->id,
                            'assignment_id' => $submission->assignment->id,
                            'title' => $submission->assignment->title,
                            'submitted_at' => $submission->submitted_at->format('d M Y, H:i'),
                            'grade' => $submission->grade,
                            'message_eval' => $submission->message_eval,
                        ];
                    } catch (Throwable $e) {
                        Log::error('Error processing submission ' . $submission->id . ': ' . $e->getMessage());
                        return null;
                    }
                })
                ->filter(); // Remove null values
        } catch (Throwable $e) {
            Log::error('Error getting completed assignments: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get attendance rate for a subject.
     *
     * @param  int  $subjectId
     * @param  int  $studentId
     * @return string
     */
    private function getAttendanceRate($subjectId, $studentId)
    {
        try {
            $attendanceSessions = DB::table('attendance_sessions')
                ->where('subject_id', $subjectId)
                ->count();

            if ($attendanceSessions == 0) {
                return 'N/A';
            }

            $studentAttendances = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->where('attendance_sessions.subject_id', $subjectId)
                ->where('attendances.student_id', $studentId)
                ->where('attendances.status', 'hadir')
                ->count();

            return round(($studentAttendances / $attendanceSessions) * 100) . '%';
        } catch (Throwable $e) {
            Log::error('Error calculating attendance rate: ' . $e->getMessage());
            return 'N/A';
        }
    }

    /**
     * Handle exceptions and log errors.
     *
     * @param \Throwable $e
     * @param string $message
     * @return \Illuminate\Http\RedirectResponse
     */
    private function handleException(Throwable $e, $message)
    {
        Log::error($message . ': ' . $e->getMessage());
        Log::error($e->getTraceAsString());

        // Provide a user-friendly error message
        $userMessage = app()->environment('production')
            ? 'An error occurred. Please try again later.'
            : $e->getMessage();

        return redirect()->route('student.subjects.index')
            ->with('error', $message . '. ' . $userMessage);
    }
}
