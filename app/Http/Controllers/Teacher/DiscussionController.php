<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DiscussionReply;
use App\Models\DiscussionThread;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DiscussionController extends Controller
{
    public function index(Subject $subject)
    {
        $threads = DiscussionThread::with(['creator'])
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

        $threads = $threads->map(function (DiscussionThread $thread) use (
            $teacherNames,
            $studentNames
        ) {
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
                'created_at' => $thread->created_at->format('d M Y H:i'),
                'creator' => $creatorName,
                'is_pinned' => (bool) $thread->is_pinned,
                'is_closed' => (bool) $thread->is_closed,
                'replies_count' => $thread->replies()->count(),
            ];
        });

        return Inertia::render('Teacher/Discussion/Index', [
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
            ],
            'threads' => $threads,
        ]);
    }

    public function store(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
        ]);

        DiscussionThread::create([
            'subject_id' => $subject->id,
            'class_id' => $subject->class_id,
            'created_by' => Auth::id(),
            'title' => $validated['title'],
            'body' => $validated['body'] ?? null,
        ]);

        return redirect()
            ->route('teacher.discussions.index', $subject->id)
            ->with('success', 'Topik diskusi berhasil dibuat.');
    }

    public function show(Subject $subject, DiscussionThread $thread)
    {
        if ($thread->subject_id !== $subject->id) {
            abort(404);
        }

        $thread->load('creator');

        // Tentukan nama pembuat thread (guru / siswa)
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
                'created_at' => $reply->created_at->format('d M Y H:i'),
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

        return Inertia::render('Teacher/Discussion/Show', [
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
            ],
            'thread' => [
                'id' => $thread->id,
                'title' => $thread->title,
                'body' => $thread->body,
                'created_at' => $thread->created_at->format('d M Y H:i'),
                'creator' => [
                    'id' => $thread->creator?->id,
                    'name' => $creatorName,
                ],
                'is_closed' => (bool) $thread->is_closed,
            ],
            'replies' => $replies,
            'current_user_id' => Auth::id(),
        ]);
    }

    public function reply(Request $request, Subject $subject, DiscussionThread $thread)
    {
        if ($thread->subject_id !== $subject->id) {
            abort(404);
        }

        $validated = $request->validate([
            'body' => 'required|string',
            'parent_reply_id' => 'nullable|integer|exists:discussion_replies,id',
        ]);

        DiscussionReply::create([
            'thread_id' => $thread->id,
            'user_id' => Auth::id(),
            'body' => $validated['body'],
            'parent_reply_id' => $validated['parent_reply_id'] ?? null,
        ]);

        // Refresh saat ada aksi: redirect kembali ke halaman thread
        return redirect()
            ->route('teacher.discussions.show', [$subject->id, $thread->id])
            ->with('success', 'Balasan berhasil dikirim.');
    }
}
