<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    private function activeSemesterForSubject(int $teacherId, int $subjectId): ?int
    {
        return DB::table('teachers_subjects')
            ->join('semesters', 'teachers_subjects.semester_id', '=', 'semesters.id')
            ->where('teachers_subjects.teacher_id', $teacherId)
            ->where('teachers_subjects.subject_id', $subjectId)
            ->orderByDesc('semesters.start_date')
            ->value('teachers_subjects.semester_id');
    }

    /**
     * Display a listing of the assignments for a subject.
     */
    public function index(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'subject_id'  => 'required|exists:subjects,id',
                'semester_id' => 'nullable|exists:semesters,id',
                'search'      => 'nullable|string|max:50',
                'page'        => 'nullable|integer|min:1',
                'per_page'    => 'nullable|integer|min:1|max:100',
                'sort_by'     => 'nullable|string|in:title,deadline,created_at',
                'sort_order'  => 'nullable|string|in:asc,desc',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get the subject
            $subject = Subject::findOrFail($request->subject_id);

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to view assignments for this subject.');
            }

            // Semester list untuk subject+teacher ini
            $semesters = DB::table('teachers_subjects')
                ->join('semesters', 'teachers_subjects.semester_id', '=', 'semesters.id')
                ->where('teachers_subjects.teacher_id', $teacher->id)
                ->where('teachers_subjects.subject_id', $subject->id)
                ->orderByDesc('semesters.start_date')
                ->select('semesters.id', 'semesters.name', 'semesters.start_date', 'semesters.end_date')
                ->get();

            $selectedSemesterId = $request->filled('semester_id')
                ? (int) $request->semester_id
                : ($semesters->first()->id ?? $this->activeSemesterForSubject($teacher->id, $subject->id));

            // Set default values
            $search    = $request->input('search', '');
            $perPage   = $request->input('per_page', 10);
            $sortBy    = $request->input('sort_by', 'deadline');
            $sortOrder = $request->input('sort_order', 'desc');

            $query = Assignment::where('subject_id', $subject->id)
                ->where('semester_id', $selectedSemesterId);

            // Apply search if provided
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $query->orderBy($sortBy, $sortOrder);

            // Get paginated results
            $assignments = $query->paginate($perPage)->withQueryString();

            // Count total students in the class
            $totalStudents = DB::table('semesters_students')
                ->where('class_id', $subject->class_id)
                ->distinct('students_id')
                ->count('students_id');

            // Format data for frontend
            $formattedAssignments = $assignments->map(function ($assignment) use ($totalStudents) {
                // Count submissions
                $submissionsCount = AssignmentSubmission::where('assignment_id', $assignment->id)->count();
                $gradedCount = AssignmentSubmission::where('assignment_id', $assignment->id)
                    ->whereNotNull('grade')
                    ->count();

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'file_path' => $assignment->file_path,
                    'deadline' => $assignment->deadline,
                    'created_at' => $assignment->created_at->format('d M Y, H:i'),
                    'submissions_count' => $submissionsCount,
                    'graded_count' => $gradedCount,
                    'total_students' => $totalStudents,
                    'submission_rate' => $totalStudents > 0 ? round(($submissionsCount / $totalStudents) * 100) : 0,
                ];
            });

            // Get formatted subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_id' => $subject->class_id,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            // Return view with data
            return Inertia::render('Teacher/Assignment/Index', [
                'assignments'        => $formattedAssignments,
                'subject'            => $formattedSubject,
                'semesters'          => $semesters,
                'currentSemesterId'  => $selectedSemesterId,
                'pagination' => [
                    'total'        => $assignments->total(),
                    'per_page'     => $assignments->perPage(),
                    'current_page' => $assignments->currentPage(),
                    'last_page'    => $assignments->lastPage(),
                    'from'         => $assignments->firstItem(),
                    'to'           => $assignments->lastItem(),
                ],
                'filters' => [
                    'search'     => $search,
                    'sort_by'    => $sortBy,
                    'sort_order' => $sortOrder,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher assignments index: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load assignments: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for creating a new assignment.
     */
    public function create(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'subject_id' => 'required|exists:subjects,id',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get the subject
            $subject = Subject::findOrFail($request->subject_id);

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to add assignments to this subject.');
            }

            // Format subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            return Inertia::render('Teacher/Assignment/Create', [
                'subject' => $formattedSubject,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher assignments create: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load create form: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Store a newly created assignment in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'subject_id' => 'required|exists:subjects,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'file' => 'nullable|file|max:10240', // 10MB max
                'deadline' => 'required|date|after:now',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get the subject
            $subject = Subject::findOrFail($request->subject_id);

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to add assignments to this subject.');
            }

            // Start transaction
            DB::beginTransaction();

            // Prepare assignment data
            $assignmentData = [
                'subject_id'  => $subject->id,
                'semester_id' => $this->activeSemesterForSubject($teacher->id, $subject->id),
                'title'       => $request->title,
                'description' => $request->description,
                'deadline'    => $request->deadline,
            ];

            // Handle file upload if present
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('assignments', $fileName, 'public');
                $assignmentData['file_path'] = Storage::url($filePath);
            }

            // Create assignment
            $assignment = Assignment::create($assignmentData);

            // Create notification for students
            $this->createNotificationsForStudents($subject, $assignment, 'assignment');

            // Log activity
            $this->logActivity(Auth::id(), 'create_assignment', "Created new assignment: {$assignment->title} for subject: {$subject->name}");

            DB::commit();

            return redirect()->route('teacher.assignments.index', ['subject_id' => $subject->id])
                ->with('success', 'Assignment created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher assignments store: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to create assignment: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Display the specified assignment.
     */
    public function show(Assignment $assignment)
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
                    ->with('error', 'You do not have permission to view this assignment.');
            }

            // Get submissions statistics
            $totalStudents = DB::table('semesters_students')
                ->where('class_id', $subject->class_id)
                ->distinct('students_id')
                ->count('students_id');

            $submissions = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->with('student')
                ->get();

            $submittedCount = $submissions->count();
            $gradedCount = $submissions->whereNotNull('grade')->count();
            $pendingCount = $submissions->whereNull('grade')->count();
            $notSubmittedCount = $totalStudents - $submittedCount;

            // Get student submission status
            $students = Student::whereHas('classes', function ($query) use ($subject) {
                $query->where('class_id', $subject->class_id);
            })->get();

            $studentStatuses = $students->map(function ($student) use ($submissions) {
                $submission = $submissions->where('student_id', $student->id)->first();

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'has_submitted' => $submission ? true : false,
                    'submission_id' => $submission ? $submission->id : null,
                    'submitted_at' => $submission ? $submission->submitted_at : null,
                    'grade' => $submission ? $submission->grade : null,
                    'status' => $submission
                        ? ($submission->grade !== null ? 'graded' : 'submitted')
                        : 'not_submitted',
                ];
            });

            // Format assignment data
            $formattedAssignment = [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'file_path' => $assignment->file_path,
                'deadline' => $assignment->deadline,
                'created_at' => $assignment->created_at->format('d M Y, H:i'),
                'updated_at' => $assignment->updated_at->format('d M Y, H:i'),
                'stats' => [
                    'total_students' => $totalStudents,
                    'submitted_count' => $submittedCount,
                    'graded_count' => $gradedCount,
                    'pending_count' => $pendingCount,
                    'not_submitted_count' => $notSubmittedCount,
                    'submission_rate' => $totalStudents > 0 ? round(($submittedCount / $totalStudents) * 100) : 0,
                ],
                'student_statuses' => $studentStatuses,
            ];

            // Format subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_id' => $subject->class_id,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            return Inertia::render('Teacher/Assignment/Show', [
                'assignment' => $formattedAssignment,
                'subject' => $formattedSubject,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher assignments show: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to display assignment: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for editing the specified assignment.
     */
    public function edit(Assignment $assignment)
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
                    ->with('error', 'You do not have permission to edit this assignment.');
            }

            // Format assignment data
            $formattedAssignment = [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'file_path' => $assignment->file_path,
                'deadline' => $assignment->deadline,
            ];

            // Format subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            return Inertia::render('Teacher/Assignment/Edit', [
                'assignment' => $formattedAssignment,
                'subject' => $formattedSubject,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher assignments edit: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load edit form: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified assignment in storage.
     */
    public function update(Request $request, Assignment $assignment)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'file' => 'nullable|file|max:10240', // 10MB max
                'remove_file' => 'nullable|boolean',
                'deadline' => 'required|date',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load subject
            $assignment->load('subject');
            $subject = $assignment->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to edit this assignment.');
            }

            // Check if there are submissions already
            $hasSubmissions = AssignmentSubmission::where('assignment_id', $assignment->id)->exists();

            // If the deadline is in the past and there are submissions, only allow editing title and description
            $isPastDeadline = strtotime($assignment->deadline) < time();
            if ($isPastDeadline && $hasSubmissions && $assignment->deadline != $request->deadline) {
                return redirect()->back()->withErrors([
                    'error' => 'Cannot change the deadline for an assignment with submissions that is already past due.'
                ])->withInput();
            }

            // Start transaction
            DB::beginTransaction();

            // Prepare update data
            $updateData = [
                'title' => $request->title,
                'description' => $request->description,
                'deadline' => $request->deadline,
            ];

            // Handle file upload or removal
            if ($request->hasFile('file')) {
                // Remove old file if exists
                if ($assignment->file_path && Storage::exists('public/assignments/' . basename($assignment->file_path))) {
                    Storage::delete('public/assignments/' . basename($assignment->file_path));
                }

                // Store new file
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('assignments', $fileName, 'public');
                $updateData['file_path'] = Storage::url($filePath);
            } elseif ($request->boolean('remove_file')) {
                // Remove file if requested
                if ($assignment->file_path && Storage::exists('public/assignments/' . basename($assignment->file_path))) {
                    Storage::delete('public/assignments/' . basename($assignment->file_path));
                }
                $updateData['file_path'] = null;
            }

            // Update assignment
            $assignment->update($updateData);

            // Log activity
            $this->logActivity(Auth::id(), 'update_assignment', "Updated assignment: {$assignment->title} for subject: {$subject->name}");

            // If deadline was extended, notify students
            $deadlineChanged = $assignment->getOriginal('deadline') != $assignment->deadline;
            if ($deadlineChanged) {
                $this->createNotificationsForStudents(
                    $subject,
                    $assignment,
                    'assignment_update',
                    "The deadline for assignment '{$assignment->title}' has been updated to " . date('d M Y, H:i', strtotime($assignment->deadline))
                );
            }

            DB::commit();

            return redirect()->route('teacher.assignments.index', ['subject_id' => $subject->id])
                ->with('success', 'Assignment updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher assignments update: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to update assignment: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Remove the specified assignment from storage.
     */
    public function destroy(Assignment $assignment)
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
                    ->with('error', 'You do not have permission to delete this assignment.');
            }

            // Check if there are submissions
            $submissionsCount = AssignmentSubmission::where('assignment_id', $assignment->id)->count();
            if ($submissionsCount > 0) {
                return redirect()->back()->withErrors([
                    'error' => "Cannot delete assignment with {$submissionsCount} submissions. Please consider archiving it instead."
                ]);
            }

            // Start transaction
            DB::beginTransaction();

            // Store assignment info for log
            $assignmentTitle = $assignment->title;
            $subjectName = $subject->name;
            $subjectId = $subject->id;

            // Delete file if exists
            if ($assignment->file_path && Storage::exists('public/assignments/' . basename($assignment->file_path))) {
                Storage::delete('public/assignments/' . basename($assignment->file_path));
            }

            // Delete assignment
            $assignment->delete();

            // Log activity
            $this->logActivity(Auth::id(), 'delete_assignment', "Deleted assignment: {$assignmentTitle} from subject: {$subjectName}");

            DB::commit();

            return redirect()->route('teacher.assignments.index', ['subject_id' => $subjectId])
                ->with('success', 'Assignment deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher assignments destroy: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to delete assignment: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Create notifications for students in the subject's class
     */
    private function createNotificationsForStudents($subject, $assignment, $type, $customMessage = null)
    {
        try {
            // Get all students in the subject's class
            $studentUserIds = DB::table('semesters_students')
                ->join('students', 'semesters_students.students_id', '=', 'students.id')
                ->where('semesters_students.class_id', $subject->class_id)
                ->pluck('students.user_id');

            // Create notification data
            $title = $type == 'assignment' ? 'New Assignment' : 'Assignment Updated';
            $content = $customMessage ?? "A new assignment '{$assignment->title}' has been added to {$subject->name}. Deadline: " . date('d M Y, H:i', strtotime($assignment->deadline));

            $notificationData = [
                'title' => $title,
                'content' => $content,
                'is_read' => false,
                'type' => $type,
                'related_id' => $assignment->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Insert notifications for each student
            foreach ($studentUserIds as $userId) {
                $notificationData['user_id'] = $userId;
                DB::table('notifications')->insert($notificationData);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Error creating notifications: ' . $e->getMessage());
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
