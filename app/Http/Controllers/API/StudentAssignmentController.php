<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StudentAssignmentController extends Controller
{
    /**
     * List assignments for current student with optional filters.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:50',
            'filter_status' => 'nullable|string|in:all,pending,submitted,graded',
            'sort_by' => 'nullable|string|in:deadline,title,subject',
            'sort_order' => 'nullable|string|in:asc,desc',
            'subject_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid',
                'errors' => $validator->errors(),
            ], 422);
        }

        $search = $request->input('search', '');
        $filterStatus = $request->input('filter_status', 'all');
        $sortBy = $request->input('sort_by', 'deadline');
        $sortOrder = $request->input('sort_order', 'asc');
        $subjectId = $request->input('subject_id');

        // Ambil kelas saat ini dari tabel pivot semesters_students
        $current = DB::table('semesters_students')
            ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
            ->where('semesters_students.students_id', $student->id)
            ->orderBy('semesters.end_date', 'desc')
            ->select('semesters_students.class_id', 'semesters_students.semesters_id')
            ->first();

        if (!$current) {
            return response()->json([
                'success' => true,
                'data' => [],
                'counts' => [
                    'all' => 0,
                    'pending' => 0,
                    'submitted' => 0,
                    'graded' => 0,
                ],
            ]);
        }

        $currentSemesterId = $current->semesters_id;
        $subjectIds = Subject::where('class_id', $current->class_id)->pluck('id')->toArray();

        $query = Assignment::whereIn('subject_id', $subjectIds)
            ->where(function ($q) use ($currentSemesterId) {
                $q->where('semester_id', $currentSemesterId);
            });

        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        $query->with(['subject', 'submissions' => function ($q) use ($student) {
            $q->where('student_id', $student->id);
        }]);

        if ($sortBy === 'title') {
            $query->orderBy('title', $sortOrder);
        } elseif ($sortBy === 'subject') {
            $query->join('subjects', 'assignments.subject_id', '=', 'subjects.id')
                ->orderBy('subjects.name', $sortOrder)
                ->select('assignments.*');
        } else {
            $query->orderBy('deadline', $sortOrder);
        }

        $assignments = $query->get()->map(function (Assignment $assignment) use ($student, $filterStatus) {
            $submission = $assignment->submissions->first();
            $status = $submission
                ? ($submission->grade !== null ? 'graded' : 'submitted')
                : 'pending';

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
                'subject_name' => $assignment->subject->name ?? '-',
                'has_file' => $assignment->file_path ? true : false,
                'status' => $status,
                'is_overdue' => now()->gt($assignment->deadline),
                'submission' => $submission ? [
                    'id' => $submission->id,
                    'submitted_at' => $submission->submitted_at
                        ? $submission->submitted_at->format('Y-m-d H:i:s')
                        : null,
                    'grade' => $submission->grade,
                    'message_eval' => $submission->message_eval,
                ] : null,
            ];
        })->filter()->values();

        return response()->json([
            'success' => true,
            'data' => $assignments,
            'counts' => [
                'all' => $assignments->count(),
                'pending' => $assignments->where('status', 'pending')->count(),
                'submitted' => $assignments->where('status', 'submitted')->count(),
                'graded' => $assignments->where('status', 'graded')->count(),
            ],
        ]);
    }

    /**
     * Show assignment detail + submission status for current student.
     */
    public function show(Request $request, Assignment $assignment)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan',
            ], 404);
        }

        $current = DB::table('semesters_students')
            ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
            ->where('semesters_students.students_id', $student->id)
            ->orderBy('semesters.end_date', 'desc')
            ->first();

        if (!$current) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke tugas ini',
            ], 403);
        }

        $subject = Subject::find($assignment->subject_id);

        if (!$subject || $subject->class_id != $current->class_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke tugas ini',
            ], 403);
        }

        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        $assignmentData = [
            'id' => $assignment->id,
            'title' => $assignment->title,
            'description' => $assignment->description,
            'deadline' => $assignment->deadline->format('Y-m-d H:i:s'),
            'formatted_deadline' => $assignment->deadline->format('d M Y, H:i'),
            'days_remaining' => now()->diffInDays($assignment->deadline, false),
            'is_overdue' => now()->gt($assignment->deadline),
            'subject_id' => $assignment->subject_id,
            'subject_name' => $subject->name,
            'file_path' => $assignment->file_path,
            'file_name' => $assignment->file_path ? basename($assignment->file_path) : null,
            'teacher_name' => $subject->teacher->name ?? 'Unknown',
        ];

        $submissionData = null;

        if ($submission) {
            $submissionData = [
                'id' => $submission->id,
                'submission_text' => $submission->submission_text,
                'file_path' => $submission->file_path,
                'file_name' => $submission->file_path ? basename($submission->file_path) : null,
                'grade' => $submission->grade,
                'message_eval' => $submission->message_eval,
                'submitted_at' => $submission->submitted_at
                    ? $submission->submitted_at->format('Y-m-d H:i:s')
                    : null,
                'is_late' => $submission->submitted_at && $submission->submitted_at->gt($assignment->deadline),
                'can_resubmit' => now()->lt($assignment->deadline),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'assignment' => $assignmentData,
                'submission' => $submissionData,
                'can_submit' => now()->lt($assignment->deadline) || !$submission,
            ],
        ]);
    }
}

