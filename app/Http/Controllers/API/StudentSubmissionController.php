<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Notification;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class StudentSubmissionController extends Controller
{
    /**
     * Submit or resubmit assignment for current student.
     */
    public function store(Request $request, Assignment $assignment)
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
            'submission_text' => 'nullable|string',
            'submission_file' => 'nullable|file|max:10240', // 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!$request->filled('submission_text') && !$request->hasFile('submission_file')) {
            return response()->json([
                'success' => false,
                'message' => 'Teks atau file harus diisi untuk mengumpulkan tugas.',
            ], 422);
        }

        // Pastikan assignment milik kelas siswa
        $subject = Subject::find($assignment->subject_id);
        $currentEnrollment = DB::table('semesters_students')
            ->where('students_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$subject || !$currentEnrollment || $subject->class_id != $currentEnrollment->class_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke tugas ini',
            ], 403);
        }

        // Cek submission lama
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        $isResubmission = false;

        if ($submission) {
            // Tidak boleh resubmit setelah deadline
            if (now()->gt($assignment->deadline)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Deadline telah lewat. Anda tidak dapat mengirim ulang tugas.',
                ], 403);
            }
            $isResubmission = true;
        } else {
            $submission = new AssignmentSubmission();
            $submission->assignment_id = $assignment->id;
            $submission->student_id = $student->id;
        }

        // Handle file upload
        if ($request->hasFile('submission_file')) {
            if ($submission->file_path) {
                Storage::disk('public')->delete($submission->file_path);
            }

            $file = $request->file('submission_file');
            $fileName = time() . '_' . Str::slug($student->name) . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('submissions', $fileName, 'public');
            $submission->file_path = $filePath;
        }

        $submission->submission_text = $request->input('submission_text');
        $submission->submitted_at = now();
        $submission->save();

        // Notifikasi untuk guru
        if ($subject && $subject->teacher) {
            Notification::create([
                'user_id' => $subject->teacher->user_id,
                'title' => $isResubmission ? 'Assignment Resubmitted' : 'New Assignment Submission',
                'content' => $student->name . ' telah ' . ($isResubmission ? 'mengirim ulang' : 'mengumpulkan') . ' tugas: ' . $assignment->title,
                'is_read' => false,
                'type' => 'assignment',
                'related_id' => $submission->id,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $isResubmission ? 'Tugas berhasil dikirim ulang.' : 'Tugas berhasil dikumpulkan.',
            'data' => [
                'submission_id' => $submission->id,
                'file_path' => $submission->file_path,
                'submitted_at' => $submission->submitted_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}

