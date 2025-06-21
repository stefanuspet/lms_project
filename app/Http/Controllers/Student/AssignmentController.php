<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentController extends Controller
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
                'filter_status' => 'nullable|string|in:all,pending,submitted,graded',
                'sort_by' => 'nullable|string|in:deadline,title,subject',
                'sort_order' => 'nullable|string|in:asc,desc',
                'subject_id' => 'nullable|integer',
            ]);

            // Set default values
            $search = $request->input('search', '');
            $filterStatus = $request->input('filter_status', 'all');
            $sortBy = $request->input('sort_by', 'deadline');
            $sortOrder = $request->input('sort_order', 'asc');
            $subjectId = $request->input('subject_id');

            // Get current semester and class
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return Inertia::render('Student/Assignment/Index', [
                    'assignments' => [],
                    'filters' => [
                        'search' => $search,
                        'filter_status' => $filterStatus,
                        'sort_by' => $sortBy,
                        'sort_order' => $sortOrder,
                        'subject_id' => $subjectId,
                    ],
                    'subjects' => [],
                ]);
            }

            $currentClassId = $currentSemesterStudent->class_id;

            // Get all subjects for this student's class
            $subjects = Subject::where('class_id', $currentClassId)
                ->get()
                ->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                    ];
                });

            $subjectIds = $subjects->pluck('id')->toArray();

            // Base query for assignments
            $query = Assignment::whereIn('subject_id', $subjectIds);

            // Apply filters
            if (!empty($search)) {
                $query->where('title', 'like', "%{$search}%");
            }

            if ($subjectId) {
                $query->where('subject_id', $subjectId);
            }

            // Get assignments with submission status
            $assignments = $query->with(['subject', 'submissions' => function ($query) use ($student) {
                $query->where('student_id', $student->id);
            }])
                ->get()
                ->map(function ($assignment) use ($student, $filterStatus) {
                    $submission = $assignment->submissions->first();
                    $status = $submission ? ($submission->grade !== null ? 'graded' : 'submitted') : 'pending';

                    // Filter by status if needed
                    if ($filterStatus !== 'all' && $status !== $filterStatus) {
                        return null;
                    }

                    return [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'description' => $assignment->description,
                        'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
                        'formatted_deadline' => $assignment->deadline->format('d M Y, H:i'),
                        'days_remaining' => now()->diffInDays($assignment->deadline, false),
                        'subject_id' => $assignment->subject_id,
                        'subject_name' => $assignment->subject->name,
                        'has_file' => $assignment->file_path ? true : false,
                        'submission' => $submission ? [
                            'id' => $submission->id,
                            'submitted_at' => $submission->submitted_at->format('d M Y, H:i'),
                            'grade' => $submission->grade,
                            'status' => $status,
                        ] : null,
                        'status' => $status,
                        'is_late' => $submission && $submission->submitted_at > $assignment->deadline,
                    ];
                })
                ->filter() // Remove null values from filtering
                ->values(); // Reset array keys

            // Apply sorting
            if ($sortBy === 'deadline') {
                $assignments = $sortOrder === 'asc'
                    ? $assignments->sortBy('deadline')
                    : $assignments->sortByDesc('deadline');
            } else if ($sortBy === 'title') {
                $assignments = $sortOrder === 'asc'
                    ? $assignments->sortBy('title')
                    : $assignments->sortByDesc('title');
            } else if ($sortBy === 'subject') {
                $assignments = $sortOrder === 'asc'
                    ? $assignments->sortBy('subject_name')
                    : $assignments->sortByDesc('subject_name');
            }

            // Group assignments by status
            $pendingCount = $assignments->where('status', 'pending')->count();
            $submittedCount = $assignments->where('status', 'submitted')->count();
            $gradedCount = $assignments->where('status', 'graded')->count();

            // Return response
            return Inertia::render('Student/Assignment/Index', [
                'assignments' => $assignments->values(),
                'filters' => [
                    'search' => $search,
                    'filter_status' => $filterStatus,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                    'subject_id' => $subjectId,
                ],
                'subjects' => $subjects,
                'counts' => [
                    'all' => $assignments->count(),
                    'pending' => $pendingCount,
                    'submitted' => $submittedCount,
                    'graded' => $gradedCount,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student assignments index: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to load assignments: ' . $e->getMessage()
            ]);
        }
    }

    public function show(Assignment $assignment)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Check if this assignment is for the student's class
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return redirect()->route('student.assignments.index')
                    ->with('error', 'You do not have access to this assignment.');
            }

            $subject = Subject::find($assignment->subject_id);

            if (!$subject || $subject->class_id != $currentSemesterStudent->class_id) {
                return redirect()->route('student.assignments.index')
                    ->with('error', 'You do not have access to this assignment.');
            }

            // Get submission if exists
            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('student_id', $student->id)
                ->first();

            // Format data for view
            $formattedAssignment = [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
                'formatted_deadline' => $assignment->deadline->format('d M Y, H:i'),
                'days_remaining' => now()->diffInDays($assignment->deadline, false),
                'is_overdue' => now() > $assignment->deadline,
                'subject_id' => $assignment->subject_id,
                'subject_name' => $subject->name,
                'file_path' => $assignment->file_path,
                'file_name' => $assignment->file_path ? basename($assignment->file_path) : null,
                'created_at' => $assignment->created_at->format('d M Y'),
                'teacher_name' => $subject->teacher ? $subject->teacher->name : 'Unknown',
            ];

            $formattedSubmission = null;

            if ($submission) {
                $formattedSubmission = [
                    'id' => $submission->id,
                    'submission_text' => $submission->submission_text,
                    'file_path' => $submission->file_path,
                    'file_name' => $submission->file_path ? basename($submission->file_path) : null,
                    'grade' => $submission->grade,
                    'message_eval' => $submission->message_eval,
                    'submitted_at' => $submission->submitted_at->format('d M Y, H:i'),
                    'is_late' => $submission->submitted_at > $assignment->deadline,
                    'can_resubmit' => now() < $assignment->deadline,
                ];
            }

            return Inertia::render('Student/Assignment/Show', [
                'assignment' => $formattedAssignment,
                'submission' => $formattedSubmission,
                'can_submit' => now() < $assignment->deadline || !$submission,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student assignment show: ' . $e->getMessage());

            return redirect()->route('student.assignments.index')
                ->with('error', 'Failed to load assignment details: ' . $e->getMessage());
        }
    }
}
