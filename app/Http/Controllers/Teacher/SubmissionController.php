<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    /**
     * Display a listing of the submissions for an assignment.
     */
    public function index(Request $request, Assignment $assignment)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load subject
            $assignment->load('subject');
            $subject = $assignment->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to view submissions for this assignment.');
            }

            // Validate request
            $validated = $request->validate([
                'search' => 'nullable|string|max:50',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'sort_by' => 'nullable|string|in:student_name,submitted_at,grade',
                'sort_order' => 'nullable|string|in:asc,desc',
                'filter_status' => 'nullable|string|in:all,submitted,graded,not_submitted',
            ]);

            // Set default values
            $search = $request->input('search', '');
            $perPage = $request->input('per_page', 10);
            $sortBy = $request->input('sort_by', 'submitted_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $page = $request->input('page', 1);
            $filterStatus = $request->input('filter_status', 'all');

            // Get all students in the class
            $students = Student::whereHas('classes', function ($query) use ($subject) {
                $query->where('class_id', $subject->class_id);
            })->get();

            // Get all submissions for this assignment
            $submissionsQuery = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->with('student');

            // Apply status filter
            if ($filterStatus == 'graded') {
                $submissionsQuery->whereNotNull('grade');
            } elseif ($filterStatus == 'submitted') {
                $submissionsQuery->whereNull('grade');
            }

            // Apply search if provided
            if (!empty($search)) {
                $submissionsQuery->whereHas('student', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('nisn', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            if ($sortBy == 'student_name') {
                $submissionsQuery->join('students', 'assignment_submissions.student_id', '=', 'students.id')
                    ->orderBy('students.name', $sortOrder)
                    ->select('assignment_submissions.*');
            } else {
                $submissionsQuery->orderBy($sortBy, $sortOrder);
            }

            // Execute paginated query
            $submissions = $submissionsQuery->paginate($perPage)->withQueryString();

            // Get the list of students who haven't submitted
            $submittedStudentIds = $submissions->pluck('student_id')->toArray();
            $notSubmittedStudents = $students->filter(function ($student) use ($submittedStudentIds) {
                return !in_array($student->id, $submittedStudentIds);
            });

            // If filtering for not submitted students
            if ($filterStatus == 'not_submitted') {
                // We need to manually paginate the not submitted students
                $notSubmittedCollection = collect($notSubmittedStudents->values());
                $currentPageItems = $notSubmittedCollection->forPage($page, $perPage);

                $notSubmittedPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
                    $currentPageItems,
                    $notSubmittedCollection->count(),
                    $perPage,
                    $page,
                    ['path' => \Illuminate\Support\Facades\Request::url()]
                );

                $submissions = $notSubmittedPaginator;
            }

            // Format submissions for frontend
            $formattedSubmissions = collect([]);

            if ($filterStatus == 'not_submitted') {
                $formattedSubmissions = $submissions->map(function ($student) use ($assignment) {
                    return [
                        'id' => null,
                        'student' => [
                            'id' => $student->id,
                            'name' => $student->name,
                            'nisn' => $student->nisn,
                        ],
                        'submission_text' => null,
                        'file_path' => null,
                        'grade' => null,
                        'message_eval' => null,
                        'submitted_at' => null,
                        'status' => 'not_submitted',
                    ];
                });
            } else {
                $formattedSubmissions = $submissions->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'student' => [
                            'id' => $submission->student->id,
                            'name' => $submission->student->name,
                            'nisn' => $submission->student->nisn,
                        ],
                        'submission_text' => $submission->submission_text,
                        'file_path' => $submission->file_path,
                        'grade' => $submission->grade,
                        'message_eval' => $submission->message_eval,
                        'submitted_at' => $submission->submitted_at ? date('d M Y, H:i', strtotime($submission->submitted_at)) : null,
                        'status' => $submission->grade !== null ? 'graded' : 'submitted',
                    ];
                });
            }

            // Prepare assignment data
            $formattedAssignment = [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'deadline' => date('d M Y, H:i', strtotime($assignment->deadline)),
                'is_past_deadline' => strtotime($assignment->deadline) < time(),
            ];

            // Prepare subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            // Prepare summary stats
            $totalStudents = $students->count();
            $submittedCount = AssignmentSubmission::where('assignment_id', $assignment->id)->count();
            $gradedCount = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->whereNotNull('grade')
                ->count();
            $notSubmittedCount = $totalStudents - $submittedCount;

            $stats = [
                'total_students' => $totalStudents,
                'submitted_count' => $submittedCount,
                'graded_count' => $gradedCount,
                'not_submitted_count' => $notSubmittedCount,
                'pending_count' => $submittedCount - $gradedCount,
                'submission_rate' => $totalStudents > 0 ? round(($submittedCount / $totalStudents) * 100) : 0,
            ];

            return Inertia::render('Teacher/Submission/Index', [
                'submissions' => $formattedSubmissions,
                'assignment' => $formattedAssignment,
                'subject' => $formattedSubject,
                'stats' => $stats,
                'pagination' => [
                    'total' => $submissions->total(),
                    'per_page' => $submissions->perPage(),
                    'current_page' => $submissions->currentPage(),
                    'last_page' => $submissions->lastPage(),
                    'from' => $submissions->firstItem(),
                    'to' => $submissions->lastItem(),
                ],
                'filters' => [
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                    'filter_status' => $filterStatus,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher submissions index: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load submissions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified submission.
     */
    public function show(AssignmentSubmission $submission)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load related models
            $submission->load(['assignment.subject', 'student']);
            $assignment = $submission->assignment;
            $subject = $assignment->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to view this submission.');
            }

            // Format submission data
            $formattedSubmission = [
                'id' => $submission->id,
                'student' => [
                    'id' => $submission->student->id,
                    'name' => $submission->student->name,
                    'nisn' => $submission->student->nisn,
                ],
                'submission_text' => $submission->submission_text,
                'file_path' => $submission->file_path,
                'grade' => $submission->grade,
                'message_eval' => $submission->message_eval,
                'submitted_at' => $submission->submitted_at ? date('d M Y, H:i', strtotime($submission->submitted_at)) : null,
                'is_late' => $submission->submitted_at && strtotime($submission->submitted_at) > strtotime($assignment->deadline),
            ];

            // Format assignment data
            $formattedAssignment = [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'file_path' => $assignment->file_path,
                'deadline' => date('d M Y, H:i', strtotime($assignment->deadline)),
                'is_past_deadline' => strtotime($assignment->deadline) < time(),
            ];

            // Format subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            return Inertia::render('Teacher/Submission/Show', [
                'submission' => $formattedSubmission,
                'assignment' => $formattedAssignment,
                'subject' => $formattedSubject,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher submission show: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to display submission: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Grade a submission.
     */
    public function grade(Request $request, AssignmentSubmission $submission)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'grade' => 'required|integer|min:0|max:100',
                'message_eval' => 'nullable|string',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load related models
            $submission->load(['assignment.subject', 'student']);
            $assignment = $submission->assignment;
            $subject = $assignment->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to grade this submission.');
            }

            // Start transaction
            DB::beginTransaction();

            // Update submission with grade
            $submission->update([
                'grade' => $request->grade,
                'message_eval' => $request->message_eval,
            ]);

            // Create notification for the student
            $this->createGradeNotification($submission);

            // Log activity
            $this->logActivity(Auth::id(), 'grade_submission', "Graded assignment submission for {$submission->student->name}, assignment: {$assignment->title}");

            DB::commit();

            return redirect()->route('teacher.submissions.show', $submission->id)
                ->with('success', 'Submission graded successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher submission grade: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to grade submission: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Export submissions for an assignment.
     */
    public function export(Assignment $assignment)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load subject
            $assignment->load('subject');
            $subject = $assignment->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to export submissions for this assignment.');
            }

            // Get all students in the class
            $students = Student::whereHas('classes', function ($query) use ($subject) {
                $query->where('class_id', $subject->class_id);
            })->get();

            // Get all submissions for this assignment
            $submissions = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->with('student')
                ->get();

            // Prepare data for export
            $exportData = [];
            foreach ($students as $student) {
                $submission = $submissions->where('student_id', $student->id)->first();

                $exportData[] = [
                    'nisn' => $student->nisn,
                    'name' => $student->name,
                    'status' => $submission ? ($submission->grade !== null ? 'Graded' : 'Submitted') : 'Not Submitted',
                    'submitted_at' => $submission && $submission->submitted_at ? date('Y-m-d H:i:s', strtotime($submission->submitted_at)) : '-',
                    'is_late' => $submission && $submission->submitted_at && strtotime($submission->submitted_at) > strtotime($assignment->deadline) ? 'Yes' : 'No',
                    'grade' => $submission && $submission->grade !== null ? $submission->grade : '-',
                    'message' => $submission && $submission->message_eval ? $submission->message_eval : '-',
                ];
            }

            // Generate CSV
            $filename = "assignment_{$assignment->id}_submissions_" . date('Ymd_His') . ".csv";
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ];

            $callback = function () use ($exportData) {
                $file = fopen('php://output', 'w');

                // Add header row
                fputcsv($file, ['NISN', 'Student Name', 'Status', 'Submitted At', 'Late Submission', 'Grade', 'Teacher\'s Message']);

                // Add data rows
                foreach ($exportData as $row) {
                    fputcsv($file, $row);
                }

                fclose($file);
            };

            // Log activity
            $this->logActivity(Auth::id(), 'export_submissions', "Exported submissions for assignment: {$assignment->title}");

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error in teacher submission export: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to export submissions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Create a notification for a student about their grade.
     */
    private function createGradeNotification(AssignmentSubmission $submission)
    {
        try {
            $student = $submission->student;
            $assignment = $submission->assignment;

            // Insert notification
            DB::table('notifications')->insert([
                'user_id' => $student->user_id,
                'title' => 'Assignment Graded',
                'content' => "Your submission for '{$assignment->title}' has been graded. Your score: {$submission->grade}/100.",
                'is_read' => false,
                'type' => 'grade',
                'related_id' => $submission->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error creating grade notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Log activity
     */
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
            return true;
        } catch (\Exception $e) {
            Log::error('Error logging activity: ' . $e->getMessage());
            return false;
        }
    }
}
