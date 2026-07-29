<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Student;
use App\Models\Material;
use App\Models\Assignment;
use App\Models\Teacher;
use App\Models\AssignmentSubmission;
use App\Models\Quiz;
use App\Models\QuizSubmission;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user    = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            $search = $request->input('search', '');

            // Semester aktif berdasarkan tanggal
            $activeSemesterId = DB::table('semesters')
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->orderByDesc('start_date')
                ->value('id');

            // Semua (subject, semester) yang dimiliki guru ini
            $query = DB::table('teachers_subjects')
                ->join('subjects', 'teachers_subjects.subject_id', '=', 'subjects.id')
                ->join('semesters', 'teachers_subjects.semester_id', '=', 'semesters.id')
                ->leftJoin('classes', 'subjects.class_id', '=', 'classes.id')
                ->where('teachers_subjects.teacher_id', $teacher->id)
                ->select(
                    'subjects.id as subject_id',
                    'subjects.name as subject_name',
                    'subjects.description',
                    'subjects.class_id',
                    'classes.name as class_name',
                    'semesters.id as semester_id',
                    'semesters.name as semester_name',
                    'semesters.start_date'
                )
                ->orderByDesc('semesters.start_date')
                ->orderBy('subjects.name');

            if (!empty($search)) {
                $query->where('subjects.name', 'like', "%{$search}%");
            }

            $rows = $query->get();

            // Kelompokkan per semester, hitung stat masing-masing
            $semesters = $rows
                ->groupBy('semester_id')
                ->map(function ($subjectRows, $semesterId) use ($activeSemesterId) {
                    $first = $subjectRows->first();

                    $subjects = $subjectRows->map(function ($row) use ($semesterId, $activeSemesterId) {
                        $studentCount = DB::table('semesters_students')
                            ->where('class_id', $row->class_id)
                            ->where('semesters_id', $semesterId)
                            ->count();

                        $materialsCount = DB::table('materials')
                            ->where('subject_id', $row->subject_id)
                            ->where('semester_id', $semesterId)
                            ->count();

                        $assignmentsCount = DB::table('assignments')
                            ->where('subject_id', $row->subject_id)
                            ->where('semester_id', $semesterId)
                            ->count();

                        $pendingSubmissions = 0;
                        if ($semesterId == $activeSemesterId) {
                            $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($q) use ($row, $semesterId) {
                                $q->where('subject_id', $row->subject_id)
                                  ->where('semester_id', $semesterId);
                            })->whereNull('grade')->count();
                        }

                        return [
                            'id'                        => $row->subject_id,
                            'name'                      => $row->subject_name,
                            'description'               => $row->description,
                            'class_name'                => $row->class_name ?? '-',
                            'class_id'                  => $row->class_id,
                            'semester_id'               => $semesterId,
                            'student_count'             => $studentCount,
                            'materials_count'           => $materialsCount,
                            'assignments_count'         => $assignmentsCount,
                            'pending_submissions_count' => $pendingSubmissions,
                        ];
                    })->values();

                    return [
                        'id'         => $semesterId,
                        'name'       => $first->semester_name,
                        'is_active'  => $semesterId == $activeSemesterId,
                        'start_date' => $first->start_date,
                        'subjects'   => $subjects,
                    ];
                })
                ->sort(function ($a, $b) {
                    if ($a['is_active'] !== $b['is_active']) {
                        return $a['is_active'] ? -1 : 1;
                    }
                    return $b['start_date'] <=> $a['start_date'];
                })
                ->values();

            return Inertia::render('Teacher/Subject/Index', [
                'semesters' => $semesters,
                'filters'   => ['search' => $search],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher subjects index: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to load subjects: ' . $e->getMessage(),
            ]);
        }
    }

    public function show(Request $request, Subject $subject)
    {
        try {
            $user    = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to view this subject.');
            }

            // Resolusi semester: dari query param, fallback ke semester aktif
            $requestedSemesterId = $request->input('semester_id');

            $activeSemesterId = DB::table('semesters')
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->orderByDesc('start_date')
                ->value('id');

            // Verifikasi guru memang mengajar subject ini di semester tersebut
            $semesterId = $requestedSemesterId && DB::table('teachers_subjects')
                ->where('teacher_id', $teacher->id)
                ->where('subject_id', $subject->id)
                ->where('semester_id', $requestedSemesterId)
                ->exists()
                ? (int) $requestedSemesterId
                : $activeSemesterId;

            $semester = DB::table('semesters')->find($semesterId);

            // Semua semester yang guru ini punya untuk subject ini (untuk switcher)
            $availableSemesters = DB::table('teachers_subjects')
                ->join('semesters', 'teachers_subjects.semester_id', '=', 'semesters.id')
                ->where('teachers_subjects.teacher_id', $teacher->id)
                ->where('teachers_subjects.subject_id', $subject->id)
                ->orderByDesc('semesters.start_date')
                ->select('semesters.id', 'semesters.name')
                ->get();

            $classInfo = DB::table('classes')->where('id', $subject->class_id)->first();

            // Siswa yang enroll di kelas ini pada semester yang dipilih
            $students = DB::table('students')
                ->join('semesters_students', 'students.id', '=', 'semesters_students.students_id')
                ->where('semesters_students.class_id', $subject->class_id)
                ->where('semesters_students.semesters_id', $semesterId)
                ->select('students.*')
                ->get();

            $materialsCount   = Material::where('subject_id', $subject->id)->where('semester_id', $semesterId)->count();
            $assignmentsCount = Assignment::where('subject_id', $subject->id)->where('semester_id', $semesterId)->count();

            $attendanceCount = 0;
            try {
                $attendanceCount = DB::table('attendance_sessions')
                    ->where('subject_id', $subject->id)
                    ->count();
            } catch (\Exception $e) {
                Log::warning('Could not get attendance count: ' . $e->getMessage());
            }

            $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($q) use ($subject, $semesterId) {
                $q->where('subject_id', $subject->id)->where('semester_id', $semesterId);
            })->whereNull('grade')->count();

            $formattedStudents = $students->map(function ($student) use ($subject, $semesterId) {
                $completedAssignments = 0;
                try {
                    $completedAssignments = AssignmentSubmission::whereHas('assignment', function ($q) use ($subject, $semesterId) {
                        $q->where('subject_id', $subject->id)->where('semester_id', $semesterId);
                    })->where('student_id', $student->id)->count();
                } catch (\Exception $e) {}

                $attendanceRate = 'N/A';
                try {
                    $sessions = DB::table('attendance_sessions')->where('subject_id', $subject->id)->count();
                    if ($sessions > 0) {
                        $hadir = DB::table('attendances')
                            ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                            ->where('attendance_sessions.subject_id', $subject->id)
                            ->where('attendances.student_id', $student->id)
                            ->where('attendances.status', 'hadir')
                            ->count();
                        $attendanceRate = round(($hadir / $sessions) * 100) . '%';
                    }
                } catch (\Exception $e) {}

                return [
                    'id'                    => $student->id,
                    'name'                  => $student->name,
                    'nisn'                  => $student->nisn,
                    'gender'                => $student->gender ? ucfirst($student->gender) : '-',
                    'completed_assignments' => $completedAssignments,
                    'attendance_rate'       => $attendanceRate,
                ];
            });

            // Aktivitas difilter per semester
            $activities = [];

            foreach (Material::where('subject_id', $subject->id)->where('semester_id', $semesterId)->latest()->get() as $material) {
                $activities[] = [
                    'type'       => 'Materi',
                    'title'      => $material->title ?? 'Materi baru',
                    'date'       => $material->created_at?->format('d M Y H:i') ?? '',
                    'created_at' => $material->created_at,
                    'url'        => route('teacher.materials.edit', $material->id),
                ];
            }

            foreach (Assignment::where('subject_id', $subject->id)->where('semester_id', $semesterId)->latest()->get() as $assignment) {
                $activities[] = [
                    'type'       => 'Tugas',
                    'title'      => $assignment->title ?? 'Tugas baru',
                    'date'       => $assignment->created_at?->format('d M Y H:i') ?? '',
                    'created_at' => $assignment->created_at,
                    'url'        => route('teacher.assignments.edit', $assignment->id),
                ];
            }

            try {
                foreach (\App\Models\DiscussionThread::where('subject_id', $subject->id)
                    ->where('semester_id', $semesterId)->latest()->get() as $thread) {
                    $activities[] = [
                        'type'       => 'Diskusi',
                        'title'      => $thread->title ?? 'Topik diskusi',
                        'date'       => $thread->created_at?->format('d M Y H:i') ?? '',
                        'created_at' => $thread->created_at,
                        'url'        => route('teacher.discussions.show', ['subject' => $subject->id, 'thread' => $thread->id]),
                    ];
                }
            } catch (\Exception $e) {}

            usort($activities, fn ($a, $b) => ($b['created_at'] ?? 0) <=> ($a['created_at'] ?? 0));

            $recentActivities = array_map(fn ($item) => [
                'type'  => $item['type'],
                'title' => $item['title'],
                'date'  => $item['date'],
                'url'   => $item['url'] ?? null,
            ], $activities);

            $formattedSubject = [
                'id'                        => $subject->id,
                'name'                      => $subject->name,
                'description'               => $subject->description,
                'class_name'                => $classInfo?->name ?? 'Unknown Class',
                'semester_name'             => $semester?->name ?? '-',
                'semester_id'               => $semesterId,
                'is_active_semester'        => $semesterId == $activeSemesterId,
                'student_count'             => $students->count(),
                'materials_count'           => $materialsCount,
                'assignments_count'         => $assignmentsCount,
                'attendance_count'          => $attendanceCount,
                'pending_submissions_count' => $pendingSubmissions,
                'students'                  => $formattedStudents,
                'created_at'               => $subject->created_at->format('d-m-Y'),
                'recent_activities'         => $recentActivities,
                'available_semesters'       => $availableSemesters,
            ];

            $this->logActivity($user->id, 'view_subject', "Viewed subject: {$subject->name}");

            return Inertia::render('Teacher/Subject/Show', [
                'subject' => $formattedSubject,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher subject show: ' . $e->getMessage(), [
                'subject_id' => $subject->id ?? 'unknown',
                'user_id'    => Auth::id(),
            ]);

            return redirect()->route('teacher.subjects.index')
                ->with('error', 'Error displaying subject details. Please try again.');
        }
    }

    /**
     * Export grades for this subject (per class) as CSV.
     * Includes assignment grades and quiz scores.
     */
    public function exportGrades(Subject $subject)
    {
        try {
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Pastikan subject milik guru ini
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to export grades for this subject.');
            }

            // Ambil semua siswa di kelas subject ini
            $students = Student::whereHas('classes', function ($query) use ($subject) {
                $query->where('class_id', $subject->class_id);
            })->get();

            // Ambil semua tugas dan submission untuk subject ini
            $assignments = Assignment::where('subject_id', $subject->id)
                ->orderBy('created_at')
                ->get();
            $assignmentIds = $assignments->pluck('id');

            $assignmentSubmissions = AssignmentSubmission::whereIn('assignment_id', $assignmentIds)
                ->whereNotNull('grade')
                ->get();

            // Ambil semua quiz dan submission untuk subject ini
            $quizzes = Quiz::where('subject_id', $subject->id)
                ->orderBy('created_at')
                ->get();
            $quizIds = $quizzes->pluck('id');

            $quizSubmissions = QuizSubmission::whereIn('quiz_id', $quizIds)
                ->whereNotNull('score')
                ->get();

            $exportRows = [];

            foreach ($students as $student) {
                // Nilai tugas per tugas
                $studentAssignmentSubs = $assignmentSubmissions->where('student_id', $student->id);

                // Nilai kuis per kuis
                $studentQuizSubs = $quizSubmissions->where('student_id', $student->id);

                $row = [
                    'nisn' => $student->nisn,
                    'name' => $student->name,
                ];

                // Kolom per tugas
                foreach ($assignments as $assignment) {
                    $sub = $studentAssignmentSubs->where('assignment_id', $assignment->id)->first();
                    $row['assignment_' . $assignment->id] =
                        $sub && $sub->grade !== null ? $sub->grade : '-';
                }

                // Kolom per kuis
                foreach ($quizzes as $quiz) {
                    $sub = $studentQuizSubs->where('quiz_id', $quiz->id)->first();
                    $row['quiz_' . $quiz->id] =
                        $sub && $sub->score !== null ? $sub->score : '-';
                }

                // Rata-rata tugas
                $assignmentGrades = $studentAssignmentSubs
                    ->pluck('grade')
                    ->filter(function ($g) {
                        return $g !== null;
                    })
                    ->all();
                $assignmentAvg = count($assignmentGrades) > 0
                    ? round(array_sum($assignmentGrades) / count($assignmentGrades), 2)
                    : null;

                // Rata-rata kuis
                $quizScores = $studentQuizSubs
                    ->pluck('score')
                    ->filter(function ($s) {
                        return $s !== null;
                    })
                    ->all();
                $quizAvg = count($quizScores) > 0
                    ? round(array_sum($quizScores) / count($quizScores), 2)
                    : null;

                // Nilai akhir sederhana: rata-rata dari komponen yang ada
                $components = [];
                if (!is_null($assignmentAvg)) {
                    $components[] = $assignmentAvg;
                }
                if (!is_null($quizAvg)) {
                    $components[] = $quizAvg;
                }
                $finalScore = count($components) > 0
                    ? round(array_sum($components) / count($components), 2)
                    : null;

                $row['assignment_avg'] = $assignmentAvg !== null ? $assignmentAvg : '-';
                $row['quiz_avg'] = $quizAvg !== null ? $quizAvg : '-';
                $row['final_score'] = $finalScore !== null ? $finalScore : '-';

                $exportRows[] = $row;
            }

            // Nama file
            $filename = 'nilai_' . Str::slug($subject->name ?? 'subject') . '_' . date('Ymd_His') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ];

            $callback = function () use ($exportRows, $assignments, $quizzes) {
                $output = fopen('php://output', 'w');

                // BOM UTF-8 agar Excel Indonesia membaca dengan benar
                fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

                // Header kolom dinamis
                $header = ['NISN', 'Nama Siswa'];

                foreach ($assignments as $assignment) {
                    $header[] = 'Tugas: ' . ($assignment->title ?? ('ID ' . $assignment->id));
                }

                foreach ($quizzes as $quiz) {
                    $header[] = 'Kuis: ' . ($quiz->title ?? ('ID ' . $quiz->id));
                }

                $header[] = 'Rata-rata Tugas';
                $header[] = 'Rata-rata Kuis';
                $header[] = 'Nilai Akhir (Rata-rata)';

                fputcsv($output, $header, ';');

                // Data
                foreach ($exportRows as $row) {
                    $data = [
                        $row['nisn'],
                        $row['name'],
                    ];

                    foreach ($assignments as $assignment) {
                        $data[] = $row['assignment_' . $assignment->id] ?? '-';
                    }

                    foreach ($quizzes as $quiz) {
                        $data[] = $row['quiz_' . $quiz->id] ?? '-';
                    }

                    $data[] = $row['assignment_avg'];
                    $data[] = $row['quiz_avg'];
                    $data[] = $row['final_score'];

                    fputcsv($output, $data, ';');
                }

                fclose($output);
            };

            // Log aktivitas
            $this->logActivity($user->id, 'export_grades', "Exported grades for subject: {$subject->name}");

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error exporting grades: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to export grades: ' . $e->getMessage());
        }
    }

    // Function to log activity
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
        } catch (\Exception $e) {
            Log::warning('Could not log activity: ' . $e->getMessage());
        }
    }
}
