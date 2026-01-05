<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DiscussionReply;
use App\Models\DiscussionThread;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StudentDiscussionController extends Controller
{
    /**
     * Get discussion threads for a subject the current student is enrolled in.
     */
    public function index(Request $request, Subject $subject)
    {
        $student = $this->getCurrentStudent($request);
        if (!$student) {
            return $this->studentNotFound();
        }

        if (!$this->studentHasAccessToSubject($student, $subject)) {
            return $this->forbiddenSubject();
        }

        $threads = DiscussionThread::with('creator')
            ->where('subject_id', $subject->id)
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->get();

        $creatorIds = $threads->pluck('created_by')->unique()->filter();
        $teacherNames = Teacher::whereIn('user_id', $creatorIds)
            ->pluck('name', 'user_id')
            ->toArray();
        $studentNames = Student::whereIn('user_id', $creatorIds)
            ->pluck('name', 'user_id')
            ->toArray();

        $data = $threads->map(function (DiscussionThread $thread) use ($teacherNames, $studentNames) {
            $userId = $thread->created_by;
            $creatorName =
                $teacherNames[$userId] ??
                $studentNames[$userId] ??
                $thread->creator?->email ??
                'Pengguna';

            return [
                'id' => $thread->id,
                'title' => $thread->title,
                'excerpt' => str($thread->body)->limit(100),
                'created_at' => $thread->created_at->format('Y-m-d H:i:s'),
                'creator' => $creatorName,
                'replies_count' => $thread->replies()->count(),
                'is_closed' => (bool) $thread->is_closed,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'subject' => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                ],
                'threads' => $data,
            ],
        ]);
    }

    /**
     * Create a new discussion thread for a subject.
     */
    public function store(Request $request, Subject $subject)
    {
        $student = $this->getCurrentStudent($request);
        if (!$student) {
            return $this->studentNotFound();
        }

        if (!$this->studentHasAccessToSubject($student, $subject)) {
            return $this->forbiddenSubject();
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid',
                'errors' => $validator->errors(),
            ], 422);
        }

        $thread = DiscussionThread::create([
            'subject_id' => $subject->id,
            'class_id' => $subject->class_id,
            'created_by' => $request->user()->id,
            'title' => $validator->validated()['title'],
            'body' => $validator->validated()['body'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Topik diskusi berhasil dibuat.',
            'data' => [
                'id' => $thread->id,
                'title' => $thread->title,
                'body' => $thread->body,
                'created_at' => $thread->created_at->format('Y-m-d H:i:s'),
            ],
        ], 201);
    }

    /**
     * Show a thread with its replies.
     */
    public function show(Request $request, Subject $subject, DiscussionThread $thread)
    {
        $student = $this->getCurrentStudent($request);
        if (!$student) {
            return $this->studentNotFound();
        }

        if ($thread->subject_id !== $subject->id) {
            return response()->json([
                'success' => false,
                'message' => 'Thread tidak ditemukan untuk mata pelajaran ini',
            ], 404);
        }

        if (!$this->studentHasAccessToSubject($student, $subject)) {
            return $this->forbiddenSubject();
        }

        $thread->load('creator');

        $creatorUserId = $thread->created_by;
        $creatorName =
            Teacher::where('user_id', $creatorUserId)->value('name') ??
            Student::where('user_id', $creatorUserId)->value('name') ??
            ($thread->creator?->email ?? 'Pengguna');

        $repliesCollection = DiscussionReply::with(['user', 'parent.user'])
            ->where('thread_id', $thread->id)
            ->orderBy('created_at')
            ->get();

        $replyUserIds = $repliesCollection->pluck('user_id')->unique()->filter();
        $replyTeacherNames = Teacher::whereIn('user_id', $replyUserIds)
            ->pluck('name', 'user_id')
            ->toArray();
        $replyStudentNames = Student::whereIn('user_id', $replyUserIds)
            ->pluck('name', 'user_id')
            ->toArray();

        $replies = $repliesCollection->map(function (DiscussionReply $reply) use (
            $replyTeacherNames,
            $replyStudentNames
        ) {
            $userId = $reply->user_id;
            $name =
                $replyTeacherNames[$userId] ??
                $replyStudentNames[$userId] ??
                $reply->user?->email ??
                'Pengguna';

            $parent = $reply->parent;

            return [
                'id' => $reply->id,
                'body' => $reply->body,
                'created_at' => $reply->created_at->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $reply->user?->id,
                    'name' => $name,
                ],
                'parent' => $parent
                    ? [
                        'id' => $parent->id,
                        'user_name' =>
                            $replyTeacherNames[$parent->user_id] ??
                            $replyStudentNames[$parent->user_id] ??
                            $parent->user?->email ??
                            'Pengguna',
                        'body_excerpt' => str($parent->body)->limit(80),
                    ]
                    : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'subject' => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                ],
                'thread' => [
                    'id' => $thread->id,
                    'title' => $thread->title,
                    'body' => $thread->body,
                    'created_at' => $thread->created_at->format('Y-m-d H:i:s'),
                    'creator' => [
                        'id' => $thread->creator?->id,
                        'name' => $creatorName,
                    ],
                    'is_closed' => (bool) $thread->is_closed,
                ],
                'replies' => $replies,
                'current_user_id' => $request->user()->id,
            ],
        ]);
    }

    /**
     * Reply to a thread.
     */
    public function reply(Request $request, Subject $subject, DiscussionThread $thread)
    {
        $student = $this->getCurrentStudent($request);
        if (!$student) {
            return $this->studentNotFound();
        }

        if ($thread->subject_id !== $subject->id) {
            return response()->json([
                'success' => false,
                'message' => 'Thread tidak ditemukan untuk mata pelajaran ini',
            ], 404);
        }

        if (!$this->studentHasAccessToSubject($student, $subject)) {
            return $this->forbiddenSubject();
        }

        $validator = Validator::make($request->all(), [
            'body' => 'required|string',
            'parent_reply_id' => 'nullable|integer|exists:discussion_replies,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $reply = DiscussionReply::create([
            'thread_id' => $thread->id,
            'user_id' => $request->user()->id,
            'body' => $data['body'],
            'parent_reply_id' => $data['parent_reply_id'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Balasan berhasil dikirim.',
            'data' => [
                'id' => $reply->id,
                'body' => $reply->body,
                'created_at' => $reply->created_at->format('Y-m-d H:i:s'),
            ],
        ], 201);
    }

    /**
     * Helpers
     */
    private function getCurrentStudent(Request $request): ?Student
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        return Student::where('user_id', $user->id)->first();
    }

    private function studentHasAccessToSubject(Student $student, Subject $subject): bool
    {
        // Cek apakah subject class_id sama dengan class_id aktif siswa
        $current = DB::table('semesters_students')
            ->where('students_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$current) {
            return false;
        }

        return (int) $subject->class_id === (int) $current->class_id;
    }

    private function studentNotFound()
    {
        return response()->json([
            'success' => false,
            'message' => 'Data siswa tidak ditemukan',
        ], 404);
    }

    private function forbiddenSubject()
    {
        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki akses ke mata pelajaran ini',
        ], 403);
    }
}

