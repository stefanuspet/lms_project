<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Subject;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    public function create(Assignment $assignment)
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

            // Check if already submitted
            $existingSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
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
            ];

            return Inertia::render('Student/Submission/Create', [
                'assignment' => $formattedAssignment,
                'existing_submission' => $existingSubmission ? [
                    'id' => $existingSubmission->id,
                    'submission_text' => $existingSubmission->submission_text,
                    'file_path' => $existingSubmission->file_path,
                    'file_name' => $existingSubmission->file_path ? basename($existingSubmission->file_path) : null,
                    'submitted_at' => $existingSubmission->submitted_at->format('d M Y, H:i'),
                ] : null,
                'is_resubmission' => $existingSubmission ? true : false,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student submission create: ' . $e->getMessage());

            return redirect()->route('student.assignments.index')
                ->with('error', 'Failed to load submission form: ' . $e->getMessage());
        }
    }

    public function store(Request $request, Assignment $assignment)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'submission_text' => 'nullable|string',
                'submission_file' => 'nullable|file|max:10240', // Max 10MB
            ]);

            if (empty($validated['submission_text']) && !$request->hasFile('submission_file')) {
                return redirect()->back()
                    ->withErrors(['error' => 'You must provide either text or a file for your submission.']);
            }

            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Check if assignment belongs to student's class
            $subject = Subject::find($assignment->subject_id);
            $currentSemesterStudent = DB::table('semesters_students')
                ->where('students_id', $student->id)
                ->first();

            if (!$currentSemesterStudent || !$subject || $subject->class_id != $currentSemesterStudent->class_id) {
                return redirect()->route('student.assignments.index')
                    ->with('error', 'You do not have access to this assignment.');
            }

            // Check for existing submission
            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('student_id', $student->id)
                ->first();

            $isResubmission = false;

            if ($submission) {
                $isResubmission = true;
                // Only allow resubmission before deadline
                if (now() > $assignment->deadline) {
                    return redirect()->route('student.assignments.show', $assignment->id)
                        ->with('error', 'Deadline has passed. You cannot resubmit your work.');
                }
            } else {
                $submission = new AssignmentSubmission();
                $submission->assignment_id = $assignment->id;
                $submission->student_id = $student->id;
            }

            // Handle file upload if present
            if ($request->hasFile('submission_file')) {
                // Delete old file if exists
                if ($submission->file_path) {
                    Storage::disk('public')->delete($submission->file_path);
                }

                $file = $request->file('submission_file');
                $fileName = time() . '_' . Str::slug($student->name) . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('submissions', $fileName, 'public');
                $submission->file_path = $filePath;
            }

            $submission->submission_text = $validated['submission_text'] ?? null;
            $submission->submitted_at = now();
            $submission->save();

            // Create notification for teacher
            $teacherUserId = $subject->teacher->user_id;
            Notification::create([
                'user_id' => $teacherUserId,
                'title' => $isResubmission ? 'Assignment Resubmitted' : 'New Assignment Submission',
                'content' => $student->name . ' has ' . ($isResubmission ? 'resubmitted' : 'submitted') . ' the assignment: ' . $assignment->title,
                'is_read' => false,
                'type' => 'assignment',
                'related_id' => $submission->id,
            ]);

            // Log activity
            $this->logActivity($user->id, 'assignment_submission', $isResubmission ? 'Resubmitted assignment: ' . $assignment->title : 'Submitted assignment: ' . $assignment->title);

            return redirect()->route('student.assignments.show', $assignment->id)
                ->with('success', $isResubmission ? 'Assignment resubmitted successfully.' : 'Assignment submitted successfully.');
        } catch (\Exception $e) {
            Log::error('Error in student assignment submission: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to submit assignment: ' . $e->getMessage()
            ]);
        }
    }

    public function show(AssignmentSubmission $submission)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Check if submission belongs to this student
            if ($submission->student_id != $student->id) {
                return redirect()->route('student.assignments.index')
                    ->with('error', 'You do not have access to this submission.');
            }

            $assignment = Assignment::find($submission->assignment_id);
            $subject = Subject::find($assignment->subject_id);

            // Format data for view
            $formattedSubmission = [
                'id' => $submission->id,
                'submission_text' => $submission->submission_text,
                'file_path' => $submission->file_path,
                'file_name' => $submission->file_path ? basename($submission->file_path) : null,
                'grade' => $submission->grade,
                'message_eval' => $submission->message_eval,
                'submitted_at' => $submission->submitted_at->format('d M Y, H:i'),
                'is_late' => $submission->submitted_at > $assignment->deadline,
                'assignment' => [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'deadline' => $assignment->deadline->format('d M Y, H:i'),
                    'subject_name' => $subject->name,
                ],
            ];

            return Inertia::render('Student/Submission/Show', [
                'submission' => $formattedSubmission,
                'can_resubmit' => now() < $assignment->deadline,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student submission show: ' . $e->getMessage());

            return redirect()->route('student.assignments.index')
                ->with('error', 'Failed to load submission details: ' . $e->getMessage());
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
