<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    /**
     * Display a listing of the classes.
     */
    public function index(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:name,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        // Set default values if not provided
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $page = $request->input('page', 1);

        // Query classes with relations
        $query = Classroom::query()
            ->withCount(['students', 'subjects']);

        // Apply search filters
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        // Execute paginated query
        $classes = $query->paginate($perPage)->withQueryString();

        // Format data for frontend
        $formattedClasses = $classes->map(function ($class) {
            // Use globally active semester (or latest) for enrollment context
            $activeSemester = Semester::where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->orderByDesc('start_date')
                ->first() ?? Semester::orderBy('start_date', 'desc')->first();

            return [
                'id' => $class->id,
                'name' => $class->name,
                'description' => $class->description,
                'students_count' => $class->students_count,
                'subjects_count' => $class->subjects_count,
                'active_semester' => $activeSemester ? [
                    'id' => $activeSemester->id,
                    'name' => $activeSemester->name,
                ] : null,
                'created_at' => $class->created_at->format('d-m-Y H:i'),
            ];
        });

        // Return data to view
        return Inertia::render('Admin/Classroom/Index', [
            'classes' => $formattedClasses,
            'pagination' => [
                'total' => $classes->total(),
                'per_page' => $classes->perPage(),
                'current_page' => $classes->currentPage(),
                'last_page' => $classes->lastPage(),
                'from' => $classes->firstItem(),
                'to' => $classes->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Export classes as CSV (bisa dibuka di Excel).
     */
    public function export(Request $request)
    {
        $classes = Classroom::withCount(['students', 'subjects'])->get();

        $filename = 'data_kelas_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($classes) {
            $output = fopen('php://output', 'w');

            // Tambah BOM supaya Excel membaca UTF-8 dengan benar
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            $delimiter = ';';

            // Header kolom
            fputcsv($output, ['Nama Kelas', 'Deskripsi', 'Jumlah Siswa', 'Jumlah Mapel'], $delimiter);

            foreach ($classes as $class) {
                fputcsv($output, [
                    $class->name,
                    $class->description,
                    $class->students_count,
                    $class->subjects_count,
                ], $delimiter);
            }

            fclose($output);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    /**
     * Show the form for creating a new class.
     */
    public function create()
    {
        $semesters = Semester::orderBy('start_date', 'desc')->get();

        return Inertia::render('Admin/Classroom/Create', [
            'semesters' => $semesters,
        ]);
    }

    /**
     * Store a newly created class in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate(
            [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'semester_id' => 'nullable|exists:semesters,id',
            ],
            [
                'name.required' => 'Nama kelas wajib diisi.',
                'name.max' => 'Nama kelas maksimal :max karakter.',

                'description.string' => 'Deskripsi kelas harus berupa teks.',

                'semester_id.exists' => 'Semester yang dipilih tidak ditemukan.',
            ]
        );

        DB::beginTransaction();

        try {
            // Create new class
            $classroom = Classroom::create([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            // If a semester is selected, attach it to the class
            if ($request->semester_id) {
                // We don't need to add entries to semesters_students here
                // because students will be added later through enrollment
            }

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'create', 'Created a new class: ' . $classroom->name);

            return redirect()->route('admin.classrooms.index')
                ->with('success', 'Kelas berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating class: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Gagal menambahkan kelas. Mohon periksa kembali data yang diisi.'])
                ->withInput();
        }
    }

    /**
     * Display the specified class.
     */
    public function show(Classroom $classroom)
    {
        try {
            // Load necessary relationships
            $classroom->load(['subjects.teacher', 'students' => function ($query) {
                $query->select('students.id', 'students.name', 'students.nisn');
            }]);

            // Use globally active semester (or latest) for enrollment context
            $activeSemester = Semester::where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->orderByDesc('start_date')
                ->first() ?? Semester::orderBy('start_date', 'desc')->first();

            // Format data for frontend
            $formattedClassroom = [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'description' => $classroom->description,
                'students_count' => $classroom->students->count(),
                'subjects_count' => $classroom->subjects->count(),
                'active_semester' => $activeSemester ? [
                    'id' => $activeSemester->id,
                    'name' => $activeSemester->name,
                    'start_date' => $activeSemester->start_date,
                    'end_date' => $activeSemester->end_date,
                ] : null,
                'subjects' => $classroom->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'description' => $subject->description,
                        'teacher' => $subject->teacher ? [
                            'id' => $subject->teacher->id,
                            'name' => $subject->teacher->name,
                        ] : null,
                    ];
                }),
                'students' => $classroom->students->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'nisn' => $student->nisn,
                    ];
                }),
                'created_at' => $classroom->created_at->format('d-m-Y H:i'),
                'updated_at' => $classroom->updated_at->format('d-m-Y H:i'),
            ];

        return Inertia::render('Admin/Classroom/Show', [
            'classroom' => $formattedClassroom,
            'semesters' => Semester::orderBy('start_date', 'desc')->get()->map(function ($semester) {
                return [
                    'id' => $semester->id,
                    'name' => $semester->name,
                    'is_active' => $semester->isActive(),
                ];
            }),
        ]);
        } catch (\Exception $e) {
            Log::error('Error in classroom show method: ' . $e->getMessage());
            return redirect()->route('admin.classrooms.index')
                ->with('error', 'Error displaying class details: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified class.
     */
    public function edit(Classroom $classroom)
    {
        $semesters = Semester::orderBy('start_date', 'desc')->get();

        // Get active semester if any
        $activeSemester = $classroom->semesters()
            ->orderBy('start_date', 'desc')
            ->first();

        return Inertia::render('Admin/Classroom/Edit', [
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'description' => $classroom->description,
                'active_semester_id' => $activeSemester ? $activeSemester->id : null,
            ],
            'semesters' => $semesters,
        ]);
    }

    /**
     * Update the specified class in storage.
     */
    public function update(Request $request, Classroom $classroom)
    {
        // Validate input
        $validated = $request->validate(
            [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'semester_id' => 'nullable|exists:semesters,id',
            ],
            [
                'name.required' => 'Nama kelas wajib diisi.',
                'name.max' => 'Nama kelas maksimal :max karakter.',

                'description.string' => 'Deskripsi kelas harus berupa teks.',

                'semester_id.exists' => 'Semester yang dipilih tidak ditemukan.',
            ]
        );

        DB::beginTransaction();

        try {
            // Update class
            $classroom->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            // If semester_id is provided and different from active semester,
            // we might want to handle that (not implemented here)

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'update', 'Updated class: ' . $classroom->name);

            return redirect()->route('admin.classrooms.index')
                ->with('success', 'Kelas berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating class: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Gagal memperbarui kelas. Mohon periksa kembali data yang diisi.'])
                ->withInput();
        }
    }

    /**
     * Remove the specified class from storage.
     */
    public function destroy(Classroom $classroom)
    {
        $className = $classroom->name;

        DB::beginTransaction();

        try {
            // Check if class has subjects
            if ($classroom->subjects()->count() > 0) {
                $message = 'Kelas tidak dapat dihapus karena masih memiliki mata pelajaran. Silakan hapus atau pindahkan mata pelajaran terlebih dahulu.';
                return redirect()->back()
                    ->withErrors(['error' => $message])
                    ->with('error', $message);
            }

            // Check if class has students
            if ($classroom->students()->count() > 0) {
                $message = 'Kelas tidak dapat dihapus karena masih memiliki siswa terdaftar. Silakan keluarkan siswa dari kelas ini terlebih dahulu.';
                return redirect()->back()
                    ->withErrors(['error' => $message])
                    ->with('error', $message);
            }

            // Remove class from semesters_students if any
            DB::table('semesters_students')
                ->where('class_id', $classroom->id)
                ->delete();

            // Delete class
            $classroom->delete();

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'delete', 'Deleted class: ' . $className);

            return redirect()->route('admin.classrooms.index')
                ->with('success', 'Kelas berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            $message = 'Gagal menghapus kelas: ' . $e->getMessage();
            return redirect()->back()
                ->withErrors(['error' => $message])
                ->with('error', $message);
        }
    }

    /**
     * Bulk delete classes.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'classroom_ids' => 'required|array',
            'classroom_ids.*' => 'exists:classes,id',
        ]);

        DB::beginTransaction();

        try {
            $classroomIds = $request->classroom_ids;

            // Check which classes have subjects or students
            $classroomsWithDependencies = Classroom::whereIn('id', $classroomIds)
                ->withCount(['subjects', 'students'])
                ->get()
                ->filter(function ($classroom) {
                    return $classroom->subjects_count > 0 || $classroom->students_count > 0;
                });

            if ($classroomsWithDependencies->count() > 0) {
                $classNames = $classroomsWithDependencies->pluck('name')->implode(', ');
                $message = "Beberapa kelas tidak dapat dihapus karena masih memiliki siswa atau mata pelajaran: {$classNames}. Silakan pindahkan terlebih dahulu.";
                return redirect()->back()
                    ->withErrors(['error' => $message])
                    ->with('error', $message);
            }

            // Remove entries from semesters_students
            DB::table('semesters_students')
                ->whereIn('class_id', $classroomIds)
                ->delete();

            // Delete classes
            Classroom::whereIn('id', $classroomIds)->delete();

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'bulk_delete', 'Bulk deleted ' . count($classroomIds) . ' classes');

            return redirect()->route('admin.classrooms.index')
                ->with('success', count($classroomIds) . ' kelas berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            $message = 'Gagal menghapus beberapa kelas: ' . $e->getMessage();
            return redirect()->back()
                ->withErrors(['error' => $message])
                ->with('error', $message);
        }
    }

    /**
     * Add students to a class for a specific semester.
     */
    public function addStudents(Request $request, Classroom $classroom)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        DB::beginTransaction();

        try {
            $semesterId = $request->semester_id;
            $studentIds = $request->student_ids;
            $semester = Semester::find($semesterId);

              // For each student, create a record in semesters_students
              foreach ($studentIds as $studentId) {
                  // Check if the student is already enrolled in this class for this semester
                  $exists = DB::table('semesters_students')
                      ->where('students_id', $studentId)
                      ->where('class_id', $classroom->id)
                    ->where('semesters_id', $semesterId)
                    ->exists();

                if (!$exists) {
                    DB::table('semesters_students')->insert([
                        'students_id' => $studentId,
                        'class_id' => $classroom->id,
                        'semesters_id' => $semesterId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();

            // Log activity
            $this->logActivity(
                auth()->id(),
                'enroll',
                'Enrolled ' . count($studentIds) . ' students in class ' . $classroom->name . ' for semester ' . $semester->name
            );

            return redirect()->route('admin.classrooms.show', $classroom->id)
                ->with('success', count($studentIds) . ' students enrolled successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to enroll students: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove students from a class for a specific semester.
     */
    public function removeStudents(Request $request, Classroom $classroom)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        DB::beginTransaction();

        try {
            $semesterId = $request->semester_id;
            $studentIds = $request->student_ids;
            $semester = Semester::find($semesterId);

            // Remove records from semesters_students
            DB::table('semesters_students')
                ->where('class_id', $classroom->id)
                ->where('semesters_id', $semesterId)
                ->whereIn('students_id', $studentIds)
                ->delete();

            DB::commit();

            // Log activity
            $this->logActivity(
                auth()->id(),
                'unenroll',
                'Removed ' . count($studentIds) . ' students from class ' . $classroom->name . ' for semester ' . $semester->name
            );

            return redirect()->route('admin.classrooms.show', $classroom->id)
                ->with('success', count($studentIds) . ' students removed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to remove students: ' . $e->getMessage()]);
        }
    }

    /**
     * Search students for enrollment.
     */
    public function searchStudents(Request $request)
    {
        $search = $request->input('q');
        $limit = $request->input('limit', 10);
        $excludeIds = $request->input('exclude_ids', []);

        if (empty($search)) {
            return response()->json([]);
        }

        $students = Student::where('name', 'like', "%{$search}%")
            ->orWhere('nisn', 'like', "%{$search}%")
            ->when(!empty($excludeIds), function ($query) use ($excludeIds) {
                return $query->whereNotIn('id', $excludeIds);
            })
            ->limit($limit)
            ->get(['id', 'name', 'nisn'])
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                ];
            });

        return response()->json($students);
    }

    /**
     * Function to log activity
     */
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
