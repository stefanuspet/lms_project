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
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Validate input
            $validated = $request->validate([
                'search' => 'nullable|string|max:50',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'sort_by' => 'nullable|string|in:name,class_id,created_at',
                'sort_order' => 'nullable|string|in:asc,desc',
                'filter_class' => 'nullable|integer',
                'filter_semester' => 'nullable|integer',
            ]);

            // Set default values if not provided
            $search = $request->input('search', '');
            $perPage = $request->input('per_page', 10);
            $sortBy = $request->input('sort_by', 'name');
            $sortOrder = $request->input('sort_order', 'asc');
            $page = $request->input('page', 1);
            $filterClass = $request->input('filter_class');
            $filterSemester = $request->input('filter_semester');

            // Query subjects assigned to this teacher
            $query = Subject::query()
                ->where('teacher_id', $teacher->id)
                ->leftJoin('classes', 'subjects.class_id', '=', 'classes.id')
                ->select('subjects.*', 'classes.name as class_name');

            // Apply search filters
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('subjects.name', 'like', "%{$search}%")
                        ->orWhere('subjects.description', 'like', "%{$search}%");
                });
            }

            // Apply additional filters
            if ($filterClass) {
                $query->where('subjects.class_id', $filterClass);
            }

            // Apply sorting
            $query->orderBy("subjects.{$sortBy}", $sortOrder);

            // Execute paginated query
            $subjects = $query->paginate($perPage)->withQueryString();

            // Format data for frontend
            $formattedSubjects = $subjects->map(function ($subject) {
                // Get student count for this subject's class - FIX: Use correct column name
                $studentCount = DB::table('semesters_students')
                    ->where('class_id', $subject->class_id)
                    ->distinct('students_id') // Use whatever column name exists in your DB
                    ->count('students_id');

                // Get material count
                $materialCount = Material::where('subject_id', $subject->id)->count();

                // Get assignment count
                $assignmentCount = Assignment::where('subject_id', $subject->id)->count();

                // Get pending submissions count
                $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($query) use ($subject) {
                    $query->where('subject_id', $subject->id);
                })->whereNull('grade')->count();

                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'description' => $subject->description,
                    'class_name' => $subject->class_name ?? '-',
                    'semester_name' => 'Current Semester',
                    'student_count' => $studentCount,
                    'materials_count' => $materialCount,
                    'assignments_count' => $assignmentCount,
                    'pending_submissions_count' => $pendingSubmissions,
                    'class_id' => $subject->class_id,
                    'created_at' => $subject->created_at->format('d-m-Y'),
                ];
            });

            // Log the successful request
            Log::info('Teacher subjects fetched successfully', [
                'teacher_id' => $teacher->id,
                'subjects_count' => $subjects->count()
            ]);

            // Return data to view
            return Inertia::render('Teacher/Subject/Index', [
                'subjects' => $formattedSubjects,
                'pagination' => [
                    'total' => $subjects->total(),
                    'per_page' => $subjects->perPage(),
                    'current_page' => $subjects->currentPage(),
                    'last_page' => $subjects->lastPage(),
                    'from' => $subjects->firstItem(),
                    'to' => $subjects->lastItem(),
                ],
                'filters' => [
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                    'filter_class' => $filterClass,
                    'filter_semester' => $filterSemester,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher subjects index: ' . $e->getMessage());

            // Return error response
            return redirect()->back()->withErrors([
                'error' => 'Failed to load subjects: ' . $e->getMessage()
            ]);
        }
    }

    public function show(Subject $subject)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Make sure this subject belongs to the current teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to view this subject.');
            }

            // Get class information using raw query to avoid relationship issues
            $classInfo = DB::table('classes')
                ->where('id', $subject->class_id)
                ->first();

            // Get students for this subject's class - FIX: Use direct DB query instead of relationship
            $students = DB::table('students')
                ->join('semesters_students', 'students.id', '=', 'semesters_students.students_id')
                ->where('semesters_students.class_id', $subject->class_id)
                ->select('students.*')
                ->get();

            // Get counts for materials, assignments, and attendance
            $materialsCount = Material::where('subject_id', $subject->id)->count();
            $assignmentsCount = Assignment::where('subject_id', $subject->id)->count();

            // Get attendance count with error handling
            $attendanceCount = 0;
            try {
                $attendanceCount = DB::table('attendance_sessions')
                    ->where('subject_id', $subject->id)
                    ->count();
            } catch (\Exception $e) {
                Log::warning('Could not get attendance count: ' . $e->getMessage());
            }

            // Get pending submissions count
            $pendingSubmissions = AssignmentSubmission::whereHas('assignment', function ($query) use ($subject) {
                $query->where('subject_id', $subject->id);
            })->whereNull('grade')->count();

            // Format student data with completion statistics
            $formattedStudents = $students->map(function ($student) use ($subject, $assignmentsCount) {
                // Calculate completed assignments
                $completedAssignments = 0;
                try {
                    $completedAssignments = AssignmentSubmission::whereHas('assignment', function ($query) use ($subject) {
                        $query->where('subject_id', $subject->id);
                    })->where('student_id', $student->id)->count();
                } catch (\Exception $e) {
                    Log::warning('Could not get completed assignments for student ' . $student->id);
                }

                // Calculate attendance rate with error handling
                $attendanceRate = 'N/A';
                try {
                    $attendanceSessions = DB::table('attendance_sessions')
                        ->where('subject_id', $subject->id)
                        ->count();

                    if ($attendanceSessions > 0) {
                        $studentAttendances = DB::table('attendances')
                            ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                            ->where('attendance_sessions.subject_id', $subject->id)
                            ->where('attendances.student_id', $student->id)
                            ->where('attendances.status', 'hadir')
                            ->count();

                        $attendanceRate = round(($studentAttendances / $attendanceSessions) * 100) . '%';
                    }
                } catch (\Exception $e) {
                    Log::warning('Could not calculate attendance rate for student ' . $student->id);
                }

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'gender' => $student->gender ? ucfirst($student->gender) : '-',
                    'completed_assignments' => $completedAssignments,
                    'attendance_rate' => $attendanceRate
                ];
            });

            // Kumpulkan semua aktivitas (materi, tugas, kuis, presensi, diskusi)
            $activities = [];

            // Materi
            foreach (Material::where('subject_id', $subject->id)->latest()->get() as $material) {
                $activities[] = [
                    'type' => 'Materi',
                    'title' => $material->title ?? 'Materi baru',
                    'date' => $material->created_at
                        ? $material->created_at->format('d M Y H:i')
                        : '',
                    'created_at' => $material->created_at,
                    'url' => route('teacher.materials.edit', $material->id),
                ];
            }

            // Tugas
            foreach (Assignment::where('subject_id', $subject->id)->latest()->get() as $assignment) {
                $activities[] = [
                    'type' => 'Tugas',
                    'title' => $assignment->title ?? 'Tugas baru',
                    'date' => $assignment->created_at
                        ? $assignment->created_at->format('d M Y H:i')
                        : '',
                    'created_at' => $assignment->created_at,
                    'url' => route('teacher.assignments.edit', $assignment->id),
                ];
            }

            // Kuis
            try {
                $quizModel = \App\Models\Quiz::class;
                if (class_exists($quizModel)) {
                    foreach ($quizModel::where('subject_id', $subject->id)
                        ->latest()
                        ->get() as $quiz) {
                        $activities[] = [
                            'type' => 'Kuis',
                            'title' => $quiz->title ?? 'Kuis baru',
                            'date' => $quiz->created_at
                                ? $quiz->created_at->format('d M Y H:i')
                                : '',
                            'created_at' => $quiz->created_at,
                            // Belum ada route detail kuis guru, arahkan ke index kuis dengan filter subject
                            'url' => route('teacher.quizzes.index', [
                                'subject_id' => $subject->id,
                            ]),
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Could not get quizzes for activity list: ' . $e->getMessage());
            }

            // Presensi
            try {
                $attendanceSessions = DB::table('attendance_sessions')
                    ->where('subject_id', $subject->id)
                    ->latest()
                    ->get();

                foreach ($attendanceSessions as $session) {
                    $activities[] = [
                        'type' => 'Presensi',
                        'title' => $session->title ?? 'Sesi presensi',
                        'date' => $session->created_at
                            ? \Carbon\Carbon::parse($session->created_at)->format('d M Y H:i')
                            : '',
                        'created_at' => $session->created_at
                            ? \Carbon\Carbon::parse($session->created_at)
                            : null,
                        // Arahkan ke daftar presensi, opsional dengan subject_id
                        'url' => route('teacher.attendance.index', [
                            'subject_id' => $subject->id,
                        ]),
                    ];
                }
            } catch (\Exception $e) {
                Log::warning('Could not get attendance sessions for activity list: ' . $e->getMessage());
            }

            // Diskusi
            try {
                $threadModel = \App\Models\DiscussionThread::class;
                if (class_exists($threadModel)) {
                    foreach ($threadModel::where('subject_id', $subject->id)
                        ->latest()
                        ->get() as $thread) {
                        $activities[] = [
                            'type' => 'Diskusi',
                            'title' => $thread->title ?? 'Topik diskusi',
                            'date' => $thread->created_at
                                ? $thread->created_at->format('d M Y H:i')
                                : '',
                            'created_at' => $thread->created_at,
                            'url' => route('teacher.discussions.show', [
                                'subject' => $subject->id,
                                'thread' => $thread->id,
                            ]),
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Could not get discussion threads for activity list: ' . $e->getMessage());
            }

            // Urutkan aktivitas berdasarkan created_at terbaru
            usort($activities, function ($a, $b) {
                if (empty($a['created_at']) || empty($b['created_at'])) {
                    return 0;
                }
                return $b['created_at'] <=> $a['created_at'];
            });

            // Format tanggal & URL untuk frontend dan buang created_at mentah
            $recentActivities = array_map(function ($item) {
                return [
                    'type' => $item['type'],
                    'title' => $item['title'],
                    'date' => $item['date'],
                    'url' => $item['url'] ?? null,
                ];
            }, $activities);

            // Format data for view
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                'class_name' => $classInfo ? $classInfo->name : 'Unknown Class',
                'semester_name' => 'Current Semester',
                'student_count' => $students->count(),
                'materials_count' => $materialsCount,
                'assignments_count' => $assignmentsCount,
                'attendance_count' => $attendanceCount,
                'pending_submissions_count' => $pendingSubmissions,
                'students' => $formattedStudents,
                'created_at' => $subject->created_at->format('d-m-Y'),
                'recent_activities' => $recentActivities,
            ];

            // Log successful access
            $this->logActivity($user->id, 'view_subject', "Viewed subject: {$subject->name}");

            return Inertia::render('Teacher/Subject/Show', [
                'subject' => $formattedSubject
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher subject show: ' . $e->getMessage(), [
                'subject_id' => $subject->id ?? 'unknown',
                'user_id' => Auth::id(),
                'stack_trace' => $e->getTraceAsString()
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
