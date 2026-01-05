<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Quiz;
use App\Models\QuizSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:name,class_id,teacher_id,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'filter_class' => 'nullable|integer',
            'filter_teacher' => 'nullable|integer',
        ]);

        // Set default values if not provided
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $page = $request->input('page', 1);
        $filterClass = $request->input('filter_class');
        $filterTeacher = $request->input('filter_teacher');

        // Query subjects with relations
        $query = Subject::query()
            ->with(['classroom', 'teacher']);

        // Apply search filters
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply additional filters
        if ($filterClass) {
            $query->where('class_id', $filterClass);
        }

        if ($filterTeacher) {
            $query->where('teacher_id', $filterTeacher);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        // Execute paginated query
        $subjects = $query->paginate($perPage)->withQueryString();

        // Get classes and teachers for filter dropdowns
        $classes = Classroom::select('id', 'name')->orderBy('name')->get();
        $teachers = Teacher::select('id', 'name')->orderBy('name')->get();

        // Format data for frontend
        $formattedSubjects = $subjects->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                // Ubah 'class' menjadi 'classroom' di sini
                'classroom' => $subject->classroom ? $subject->classroom->name : '-',
                'teacher' => $subject->teacher ? $subject->teacher->name : '-',
                'class_id' => $subject->class_id,
                'teacher_id' => $subject->teacher_id,
                'created_at' => $subject->created_at->format('d-m-Y H:i'),
            ];
        });

        // Return data to view
        return Inertia::render('Admin/Subject/Index', [
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
                'filter_teacher' => $filterTeacher,
            ],
            'filterOptions' => [
                'classes' => $classes,
                'teachers' => $teachers,
            ],
        ]);
    }

    public function create()
    {
        // Get all available classes and teachers for selection
        $classes = Classroom::orderBy('name')->get();
        $teachers = Teacher::orderBy('name')->get();

        return Inertia::render('Admin/Subject/Create', [
            'classes' => $classes,
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'class_id' => 'required|exists:classes,id',
            'teacher_id' => 'required|exists:teachers,id',
        ]);

        DB::beginTransaction();

        try {
            // Create new subject
            $subject = Subject::create([
                'name' => $request->name,
                'description' => $request->description,
                'class_id' => $request->class_id,
                'teacher_id' => $request->teacher_id,
            ]);

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'create', 'Created a new subject: ' . $subject->name);

            return redirect()->route('admin.subjects.index')->with('success', 'Subject created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to create subject: ' . $e->getMessage()])->withInput();
        }
    }

    public function show(Subject $subject)
    {
        try {
            // Load relations
            $subject->load(['classroom', 'teacher', 'materials', 'assignments']);

            // Format data for view
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                'class' => [
                    'id' => $subject->classroom->id,
                    'name' => $subject->classroom->name,
                ],
                'teacher' => [
                    'id' => $subject->teacher->id,
                    'name' => $subject->teacher->name,
                ],
                'materials_count' => $subject->materials->count(),
                'assignments_count' => $subject->assignments->count(),
                'created_at' => $subject->created_at->format('d-m-Y H:i'),
            ];

            return Inertia::render('Admin/Subject/Show', [
                'subject' => $formattedSubject
            ]);
        } catch (\Exception $e) {
            Log::error('Error in subject show method: ' . $e->getMessage());
            return redirect()->route('admin.subjects.index')
                ->with('error', 'Error displaying subject details: ' . $e->getMessage());
        }
    }

    public function edit(Subject $subject)
    {
        try {
            // Load relations
            $subject->load(['classroom', 'teacher']);

            // Get all available classes and teachers for selection
            $classes = Classroom::orderBy('name')->get();
            $teachers = Teacher::orderBy('name')->get();

            // Format data for view
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                'class_id' => $subject->class_id,
                'teacher_id' => $subject->teacher_id,
            ];

            return Inertia::render('Admin/Subject/Edit', [
                'subject' => $formattedSubject,
                'classes' => $classes,
                'teachers' => $teachers,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in subject edit method: ' . $e->getMessage());
            return redirect()->route('admin.subjects.index')
                ->with('error', 'Error loading subject data: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Subject $subject)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'class_id' => 'required|exists:classes,id',
                'teacher_id' => 'required|exists:teachers,id',
            ]);

            DB::beginTransaction();

            try {
                // Update subject
                $subject->update([
                    'name' => $request->name,
                    'description' => $request->description,
                    'class_id' => $request->class_id,
                    'teacher_id' => $request->teacher_id,
                ]);

                DB::commit();

                // Log activity
                $this->logActivity(auth()->id(), 'update', 'Updated subject: ' . $subject->name);

                return redirect()->route('admin.subjects.index')
                    ->with('success', 'Subject updated successfully');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error updating subject: ' . $e->getMessage());
                return redirect()->back()
                    ->withErrors(['error' => 'Failed to update subject: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Error in update method: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Error: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Export subjects as CSV (bisa dibuka di Excel).
     */
    public function export(Request $request)
    {
        $subjects = Subject::with(['classroom', 'teacher'])->get();

        $filename = 'data_mata_pelajaran_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($subjects) {
            $output = fopen('php://output', 'w');

            // Tambah BOM supaya Excel membaca UTF-8 dengan benar
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            $delimiter = ';';

            // Header kolom
            fputcsv($output, ['Nama Mapel', 'Deskripsi', 'Kelas', 'Guru'], $delimiter);

            foreach ($subjects as $subject) {
                fputcsv($output, [
                    $subject->name,
                    $subject->description,
                    optional($subject->classroom)->name,
                    optional($subject->teacher)->name,
                ], $delimiter);
            }

            fclose($output);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    /**
     * Export grades for a subject as CSV (admin view).
     * Mirip dengan export guru, tetapi tanpa cek pemilik guru.
     */
    public function exportGrades(Subject $subject)
    {
        try {
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
                $studentAssignmentSubs = $assignmentSubmissions->where('student_id', $student->id);
                $studentQuizSubs = $quizSubmissions->where('student_id', $student->id);

                $row = [
                    'nisn' => $student->nisn,
                    'name' => $student->name,
                ];

                foreach ($assignments as $assignment) {
                    $sub = $studentAssignmentSubs->where('assignment_id', $assignment->id)->first();
                    $row['assignment_' . $assignment->id] =
                        $sub && $sub->grade !== null ? $sub->grade : '-';
                }

                foreach ($quizzes as $quiz) {
                    $sub = $studentQuizSubs->where('quiz_id', $quiz->id)->first();
                    $row['quiz_' . $quiz->id] =
                        $sub && $sub->score !== null ? $sub->score : '-';
                }

                $assignmentGrades = $studentAssignmentSubs
                    ->pluck('grade')
                    ->filter(function ($g) {
                        return $g !== null;
                    })
                    ->all();
                $assignmentAvg = count($assignmentGrades) > 0
                    ? round(array_sum($assignmentGrades) / count($assignmentGrades), 2)
                    : null;

                $quizScores = $studentQuizSubs
                    ->pluck('score')
                    ->filter(function ($s) {
                        return $s !== null;
                    })
                    ->all();
                $quizAvg = count($quizScores) > 0
                    ? round(array_sum($quizScores) / count($quizScores), 2)
                    : null;

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

            $filename = 'nilai_mapel_admin_' . Str::slug($subject->name ?? 'subject') . '_' . date('Ymd_His') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ];

            $callback = function () use ($exportRows, $assignments, $quizzes) {
                $output = fopen('php://output', 'w');

                fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

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

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error exporting subject grades (admin): ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to export grades: ' . $e->getMessage());
        }
    }

    public function destroy(Subject $subject)
    {
        $subjectName = $subject->name;

        DB::beginTransaction();

        try {
            // Check if subject has materials or assignments
            $materialsCount = $subject->materials()->count();
            $assignmentsCount = $subject->assignments()->count();

            if ($materialsCount > 0 || $assignmentsCount > 0) {
                return redirect()->back()->withErrors([
                    'error' => "Cannot delete subject. It has $materialsCount materials and $assignmentsCount assignments."
                ]);
            }

            // Delete subject
            $subject->delete();

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'delete', 'Deleted subject: ' . $subjectName);

            return redirect()->route('admin.subjects.index')->with('success', 'Subject deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to delete subject: ' . $e->getMessage()]);
        }
    }

    // Bulk delete functionality
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        DB::beginTransaction();

        try {
            $subjectIds = $request->subject_ids;

            // Check if any subjects have materials or assignments
            $subjectsWithDependencies = Subject::whereIn('id', $subjectIds)
                ->withCount(['materials', 'assignments'])
                ->having('materials_count', '>', 0)
                ->orHaving('assignments_count', '>', 0)
                ->get();

            if ($subjectsWithDependencies->count() > 0) {
                return redirect()->back()->withErrors([
                    'error' => 'Cannot delete subjects with existing materials or assignments.'
                ]);
            }

            // Delete subjects
            Subject::whereIn('id', $subjectIds)->delete();

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'bulk_delete', 'Bulk deleted ' . count($subjectIds) . ' subjects');

            return redirect()->route('admin.subjects.index')->with('success', count($subjectIds) . ' subjects deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to delete subjects: ' . $e->getMessage()]);
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
