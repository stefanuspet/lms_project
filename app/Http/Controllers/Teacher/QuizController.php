<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizQuestionOption;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index()
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();
        if (!$teacher) {
            abort(403, 'Akun ini belum terhubung dengan data guru.');
        }
        $teacherId = $teacher->id;
        $quizzes = Quiz::with('classroom', 'subject')
            ->where('teacher_id', $teacherId)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'class' => $quiz->classroom?->name,
                    'subject' => $quiz->subject?->name,
                    'duration' => $quiz->duration_minutes,
                    'show_answers' => $quiz->show_answers_after_submission,
                    'start_at' => optional($quiz->start_at)->format('d-m-Y H:i'),
                    'end_at' => optional($quiz->end_at)->format('d-m-Y H:i'),
                ];
            });

        return Inertia::render('Teacher/Quiz/Index', [
            'quizzes' => $quizzes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Quiz/Create', [
            'classes' => Classroom::select('id', 'name')->orderBy('name')->get(),
            'subjects' => Subject::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();
        if (!$teacher) {
            abort(403, 'Akun ini belum terhubung dengan data guru.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'duration_minutes' => 'required|integer|min:1|max:300',
            'shuffle_questions' => 'boolean',
            'show_answers_after_submission' => 'boolean',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after:start_at',
            'questions' => 'required|array|min:1',
            'questions.*.type' => 'required|in:multiple_choice,essay',
            'questions.*.question_text' => 'required|string',
            'questions.*.points' => 'nullable|integer|min:1',
            'questions.*.options' => 'array',
            'questions.*.options.*.option_text' => 'required_with:questions.*.options|string',
            'questions.*.options.*.is_correct' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $teacher) {
            $quiz = Quiz::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'class_id' => $validated['class_id'],
                'subject_id' => $validated['subject_id'],
                'teacher_id' => $teacher->id,
                'duration_minutes' => $validated['duration_minutes'],
                'shuffle_questions' => $validated['shuffle_questions'] ?? true,
                'show_answers_after_submission' => $validated['show_answers_after_submission'] ?? false,
                'start_at' => $validated['start_at'] ?? null,
                'end_at' => $validated['end_at'] ?? null,
            ]);

            foreach ($validated['questions'] as $questionData) {
                $question = QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'type' => $questionData['type'],
                    'question_text' => $questionData['question_text'],
                    'points' => $questionData['type'] === 'multiple_choice'
                        ? 1
                        : ($questionData['points'] ?? 1),
                ]);

                if ($questionData['type'] === 'multiple_choice' && !empty($questionData['options'])) {
                    foreach ($questionData['options'] as $option) {
                        QuizQuestionOption::create([
                            'quiz_question_id' => $question->id,
                            'option_text' => $option['option_text'],
                            'is_correct' => $option['is_correct'] ?? false,
                        ]);
                    }
                }
            }
        });

        return redirect()->route('teacher.quizzes.index')->with('success', 'Quiz berhasil dibuat');
    }
}
