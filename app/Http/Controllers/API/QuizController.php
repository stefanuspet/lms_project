<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizSubmission;
use App\Models\QuizAnswer;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        // Pastikan relasi student selalu ada untuk user yang login
        $user = $request->user();
        $student = $user->student
            ?? Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan untuk akun ini.',
            ], 403);
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
                    'duration_minutes' => $quiz->duration_minutes,
                    'start_at' => optional($quiz->start_at)->toDateTimeString(),
                    'end_at' => optional($quiz->end_at)->toDateTimeString(),
                    'submitted' => (bool) $submission,
                    'score' => $submission?->score,
                ];
            });

        return response()->json(['success' => true, 'data' => $quizzes]);
    }

    public function show(Request $request, Quiz $quiz)
    {
        $user = $request->user();
        $student = $user->student
            ?? Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan untuk akun ini.',
            ], 403);
        }

        $existing = QuizSubmission::where('quiz_id', $quiz->id)->where('student_id', $student->id)->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Quiz sudah dikerjakan'], 409);
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

        return response()->json([
            'success' => true,
            'data' => [
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'duration_minutes' => $quiz->duration_minutes,
                    'show_answers_after_submission' => $quiz->show_answers_after_submission,
                ],
                'questions' => $questions,
            ],
        ]);
    }

    public function submit(Request $request, Quiz $quiz)
    {
        $user = $request->user();
        $student = $user->student
            ?? Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan untuk akun ini.',
            ], 403);
        }

        $existing = QuizSubmission::where('quiz_id', $quiz->id)->where('student_id', $student->id)->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Quiz sudah dikerjakan'], 409);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:quiz_questions,id',
            'answers.*.option_id' => 'nullable|exists:quiz_question_options,id',
            'answers.*.essay_answer' => 'nullable|string',
        ]);

        $result = DB::transaction(function () use ($validated, $quiz, $student) {
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

            return $submission;
        });

        return response()->json([
            'success' => true,
            'message' => 'Jawaban dikirim',
            'data' => [
                'submission_id' => $result->id,
                'score' => $result->score,
            ],
        ], 201);
    }
}
