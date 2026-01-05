<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizSubmission;
use App\Models\QuizAnswer;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index()
    {
        // Pastikan relasi student selalu ada untuk user yang login
        $student = Auth::user()->student
            ?? Student::where('user_id', Auth::id())->first();

        if (!$student) {
            abort(403, 'Data siswa tidak ditemukan untuk akun ini.');
        }
        $classId = DB::table('semesters_students')->where('students_id', $student->id)->orderByDesc('created_at')->value('class_id');

        $quizzes = Quiz::with('subject')
            ->where('class_id', $classId)
            ->orderByDesc('start_at')
            ->get()
            ->map(function ($quiz) use ($student) {
                $submission = $quiz->submissions()->where('student_id', $student->id)->first();
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'subject' => $quiz->subject?->name,
                    'duration' => $quiz->duration_minutes,
                    'start_at' => optional($quiz->start_at)->format('d-m-Y H:i'),
                    'end_at' => optional($quiz->end_at)->format('d-m-Y H:i'),
                    'submitted' => (bool) $submission,
                    'score' => $submission?->score,
                ];
            });

        return Inertia::render('Student/Quiz/Index', [
            'quizzes' => $quizzes,
        ]);
    }

    public function show(Quiz $quiz)
    {
        $student = Auth::user()->student
            ?? Student::where('user_id', Auth::id())->first();

        if (!$student) {
            abort(403, 'Data siswa tidak ditemukan untuk akun ini.');
        }
        $existing = QuizSubmission::where('quiz_id', $quiz->id)->where('student_id', $student->id)->first();
        if ($existing) {
            return redirect()->route('student.quizzes.index')->withErrors(['error' => 'Anda sudah mengerjakan quiz ini.']);
        }

        $questions = $quiz->questions()->with('options')->get()->map(function ($question) {
            return [
                'id' => $question->id,
                'type' => $question->type,
                'question_text' => $question->question_text,
                'points' => $question->points,
                'options' => $question->options->map(function ($opt) {
                    return [
                        'id' => $opt->id,
                        'option_text' => $opt->option_text,
                    ];
                }),
            ];
        });

        if ($quiz->shuffle_questions) {
            $questions = $questions->shuffle()->values();
        }

        return Inertia::render('Student/Quiz/Take', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'duration_minutes' => $quiz->duration_minutes,
                'show_answers_after_submission' => $quiz->show_answers_after_submission,
            ],
            'questions' => $questions,
        ]);
    }

    public function submit(Request $request, Quiz $quiz)
    {
        $student = Auth::user()->student
            ?? Student::where('user_id', Auth::id())->first();

        if (!$student) {
            abort(403, 'Data siswa tidak ditemukan untuk akun ini.');
        }
        $existing = QuizSubmission::where('quiz_id', $quiz->id)->where('student_id', $student->id)->first();
        if ($existing) {
            return redirect()->route('student.quizzes.index')->withErrors(['error' => 'Quiz sudah pernah dikerjakan.']);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:quiz_questions,id',
            'answers.*.option_id' => 'nullable|exists:quiz_question_options,id',
            'answers.*.essay_answer' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $quiz, $student) {
            $submission = QuizSubmission::create([
                'quiz_id' => $quiz->id,
                'student_id' => $student->id,
                'started_at' => now(),
                'submitted_at' => now(),
            ]);

            $score = 0;
            foreach ($validated['answers'] as $answer) {
                $question = $quiz->questions()->find($answer['question_id']);
                $awarded = null;
                if ($question->type === 'multiple_choice' && !empty($answer['option_id'])) {
                    $isCorrect = $question->options()->where('id', $answer['option_id'])->where('is_correct', true)->exists();
                    $awarded = $isCorrect ? 1 : 0;
                    $score += $awarded;
                }
                QuizAnswer::create([
                    'quiz_submission_id' => $submission->id,
                    'quiz_question_id' => $question->id,
                    'quiz_question_option_id' => $answer['option_id'] ?? null,
                    'essay_answer' => $answer['essay_answer'] ?? null,
                    'awarded_points' => $awarded,
                ]);
            }

            $submission->update(['score' => $score]);
        });

        return redirect()->route('student.quizzes.index')->with('success', 'Jawaban dikirim. Quiz selesai.');
    }
}
