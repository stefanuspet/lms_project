<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\User;
use App\Models\Classes;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:name,nisn,email,gender,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'filter_gender' => 'nullable|string|in:male,female',
            'filter_class' => 'nullable|integer',
        ]);

        // Set default values if not provided
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $page = $request->input('page', 1);
        $filterGender = $request->input('filter_gender');
        $filterClass = $request->input('filter_class');

        // Query student dengan relasi user
        $query = Student::query()
            ->with(['user', 'classes.semester']);

        // Apply search filters
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('birth_place', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%");
                    });
            });
        }

        // Apply additional filters
        if ($filterGender) {
            $query->where('gender', $filterGender);
        }

        if ($filterClass) {
            $query->whereHas('classes', function ($q) use ($filterClass) {
                $q->where('class_id', $filterClass);
            });
        }

        // Apply sorting - handle special case for email which is in users table
        if ($sortBy === 'email') {
            $query->join('users', 'students.user_id', '=', 'users.id')
                ->orderBy('users.email', $sortOrder)
                ->select('students.*'); // To avoid field name collision
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Execute paginated query
        $students = $query->paginate($perPage)->withQueryString();

        // Get all classes for filter dropdown
        $classes = Classroom::select('id', 'name')->orderBy('name')->get();

        // Format data untuk frontend
            $formattedStudents = $students->map(function ($student) {
            // Ambil daftar kelas
            $classes = $student->classes->map(function ($class) {
                return $class->name;
            })->unique()->implode(', ');

            // Format tanggal lahir
            $birthDate = $student->birth_date ? date('d-m-Y', strtotime($student->birth_date)) : '-';

            // Format data siswa untuk tampilan
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'email' => $student->user->email,
                    'gender' => $student->gender ? ucfirst($student->gender) : '-',
                    'birth_date' => $birthDate,
                    'birth_place' => $student->birth_place ?? '-',
                    'classes' => $classes ?: '-',
                    'created_at' => $student->created_at->format('d-m-Y H:i'),
                    'profile_picture' => $student->profile_picture ?? '/assets/images/default-avatar.png',
                    'updated_at' => $student->updated_at ? $student->updated_at->timestamp : null,
                ];
        });

        // Return data ke view
        return Inertia::render('Admin/Student/Index', [
            'students' => $formattedStudents,
            'pagination' => [
                'total' => $students->total(),
                'per_page' => $students->perPage(),
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'from' => $students->firstItem(),
                'to' => $students->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'filter_gender' => $filterGender,
                'filter_class' => $filterClass,
            ],
            'filterOptions' => [
                'classes' => $classes,
            ],
        ]);
    }

    public function create()
    {
        // Get all available classes and semesters for selection
        $classes = Classroom::orderBy('name')->get();
        $semesters = Semester::orderBy('start_date', 'desc')->get();

        return Inertia::render('Admin/Student/Create', [
            'classes' => $classes,
            'semesters' => $semesters,
        ]);
    }

    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate(
            [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'nisn' => 'required|string|max:20|unique:students',
                'gender' => 'nullable|in:male,female',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string|max:255',
                'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
                'class_id' => 'nullable|array',
                'class_id.*' => 'exists:classes,id',
                'semester_id' => 'nullable|exists:semesters,id',
            ],
            [
                'name.required' => 'Nama siswa wajib diisi.',
                'name.max' => 'Nama siswa maksimal :max karakter.',

                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Format email tidak valid.',
                'email.max' => 'Email maksimal :max karakter.',
                'email.unique' => 'Email sudah digunakan oleh pengguna lain.',

                'password.required' => 'Password wajib diisi.',
                'password.min' => 'Password minimal :min karakter.',
                'password.confirmed' => 'Konfirmasi password tidak sama.',

                'nisn.required' => 'NISN wajib diisi.',
                'nisn.max' => 'NISN maksimal :max karakter.',
                'nisn.unique' => 'NISN sudah digunakan oleh siswa lain.',

                'gender.in' => 'Jenis kelamin tidak valid.',

                'birth_date.date' => 'Tanggal lahir tidak valid.',
                'birth_place.max' => 'Tempat lahir maksimal :max karakter.',

                'profile_picture.image' => 'Foto profil harus berupa gambar.',
                'profile_picture.mimes' => 'Foto profil harus berformat jpg, jpeg, png, atau gif.',
                'profile_picture.max' => 'Ukuran foto profil maksimal :max kilobyte.',

                'class_id.array' => 'Kelas tidak valid.',
                'class_id.*.exists' => 'Kelas yang dipilih tidak ditemukan.',

                'semester_id.exists' => 'Semester yang dipilih tidak ditemukan.',
            ]
        );

        DB::beginTransaction();

        try {
            // Buat user baru
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'siswa',
            ]);

            // Buat student baru
            // Tentukan path foto profil (default atau upload)
            $profilePicturePath = '/assets/images/default-avatar.png';
            if ($request->hasFile('profile_picture')) {
                $path = $request
                    ->file('profile_picture')
                    ->store('avatars/students', 'public');
                $profilePicturePath = '/storage/' . $path;
            }

            $student = Student::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'nisn' => $request->nisn,
                'gender' => $request->gender,
                'birth_date' => $request->birth_date,
                'birth_place' => $request->birth_place,
                'profile_picture' => $profilePicturePath,
            ]);

            // Jika ada kelas yang dipilih dan semester yang dipilih
            if ($request->filled('class_id') && $request->filled('semester_id')) {
                foreach ($request->class_id as $classId) {
                    // Hubungkan siswa dengan kelas dan semester
                    DB::table('semesters_students')->insert([
                        'semesters_id' => $request->semester_id,
                        'students_id' => $student->id,
                        'class_id' => $classId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();

            // Log aktivitas
            $this->logActivity($user->id, 'create', 'Created a new student: ' . $student->name);

            return redirect()->route('admin.students.index')
                ->with('success', 'Data siswa berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors(['error' => 'Gagal menambahkan siswa. Mohon periksa kembali data yang diisi.'])
                ->withInput();
        }
    }

    public function show(Student $student)
    {
        try {
            // Log data student untuk debugging
            Log::info('Student data before loading relationships:', ['student_id' => $student->id]);

            // Load relasi dengan eager loading
            $student->load(['user', 'classes.semesters']);

            // Log data yang berhasil dimuat
            Log::info('Student relationships loaded:', [
                'has_user' => isset($student->user),
                'classes_count' => $student->classes->count(),
                'has_classes_with_semesters' => $student->classes->filter(function ($class) {
                    return $class->semesters->count() > 0;
                })->count()
            ]);

            // Format data untuk view
            $formattedStudent = [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'gender' => $student->gender,
                'birth_date' => $student->birth_date ? date('Y-m-d', strtotime($student->birth_date)) : null,
                'birth_place' => $student->birth_place,
                'profile_picture' => $student->profile_picture ?? '/assets/images/default-avatar.png',
                'user' => [
                    'id' => $student->user->id,
                    'email' => $student->user->email,
                ],
                'classes' => $student->classes->map(function ($class) {
                    // Untuk setiap kelas, ambil semester pertama jika ada
                    $semester = $class->semesters->first();

                    return [
                        'id' => $class->id,
                        'name' => $class->name,
                        'semester' => $semester ? [
                            'id' => $semester->id,
                            'name' => $semester->name,
                        ] : null,
                    ];
                }),
            ];

            Log::info('Data sent to show view:', ['formatted_student' => $formattedStudent]);

            return Inertia::render('Admin/Student/Show', [
                'student' => $formattedStudent
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student show method: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return redirect()->route('admin.students.index')
                ->with('error', 'Terjadi kesalahan saat menampilkan data siswa: ' . $e->getMessage());
        }
    }

    public function edit(Student $student)
    {
        try {
            // Log data student sebelum dimuat
            Log::info('Student data before loading relationships:', ['student_id' => $student->id]);

            // Load relasi dengan try-catch untuk melihat jika ada error
            try {
                $student->load('user');
                Log::info('User relation loaded successfully');
            } catch (\Exception $e) {
                Log::error('Error loading user relation: ' . $e->getMessage());
            }

            try {
                $student->load('classes');
                Log::info('Classes relation loaded successfully');
            } catch (\Exception $e) {
                Log::error('Error loading classes relation: ' . $e->getMessage());
            }

            // Dapatkan daftar kelas dan semester yang tersedia
            $classes = Classroom::orderBy('name')->get();
            $semesters = Semester::orderBy('name')->get();

            // Cek relasi classes dan semester di semesters_students
            $semesterStudents = DB::table('semesters_students')
                ->where('students_id', $student->id)
                ->get();

            Log::info('Semester-Students relationships:', ['data' => $semesterStudents]);

            // Format data sesuai kebutuhan, tangani kasus nilai null
            $formattedStudent = [
                'id' => $student->id,
                'name' => $student->name ?? '',
                'nisn' => $student->nisn ?? '',
                'gender' => $student->gender ?? '',
                'birth_date' => $student->birth_date ? date('Y-m-d', strtotime($student->birth_date)) : null,
                'birth_place' => $student->birth_place ?? '',
                'user' => [
                    'id' => $student->user->id ?? null,
                    'email' => $student->user->email ?? '',
                ],
                'debug_info' => [
                    'created_at' => $student->created_at ? $student->created_at->format('Y-m-d H:i:s') : 'null',
                    'updated_at' => $student->updated_at ? $student->updated_at->format('Y-m-d H:i:s') : 'null',
                    'has_user_relation' => isset($student->user),
                    'has_classes_relation' => $student->classes && $student->classes->count() > 0,
                    'semester_students_count' => $semesterStudents->count(),
                ]
            ];

            // Log data yang dikirim ke view
            Log::info('Data sent to edit view:', ['formatted_student' => $formattedStudent]);

            return Inertia::render('Admin/Student/Edit', [
                'student' => $formattedStudent,
                'classes' => $classes,
                'semesters' => $semesters,
                'debug' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student edit method: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return redirect()->route('admin.students.index')
                ->with('error', 'Terjadi kesalahan saat memuat data siswa: ' . $e->getMessage());
        }
    }

    // Fungsi untuk melakukan update
    public function update(Request $request, Student $student)
    {
        try {
            // Log input request
            Log::info('Update request data:', ['request' => $request->all(), 'student_id' => $student->id]);

            // Validasi input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $student->user_id,
                'password' => 'nullable|string|min:8|confirmed',
                'nisn' => 'required|string|max:20|unique:students,nisn,' . $student->id,
                'gender' => 'nullable|in:male,female',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string|max:255',
                // Pakai validasi file image karena update bisa mengubah foto profil
                'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            ]);

            Log::info('Validation passed');

            DB::beginTransaction();

            try {
                // Update user data
                $userData = [
                    'email' => $request->email,
                ];

                // Update password if provided
                if ($request->filled('password')) {
                    $userData['password'] = bcrypt($request->password);
                }

                // Log user_id yang akan diupdate
                Log::info('Updating user with ID:', ['user_id' => $student->user_id]);

                // Cek apakah user ada
                $user = User::find($student->user_id);
                if (!$user) {
                    Log::error('User not found with ID: ' . $student->user_id);
                    throw new \Exception('User not found with ID: ' . $student->user_id);
                }

                $user->update($userData);
                Log::info('User updated successfully');

                // Tentukan path foto profil (tetap, atau upload baru jika ada)
                $profilePicturePath = $student->profile_picture ?? '/assets/images/default-avatar.png';
                if ($request->hasFile('profile_picture')) {
                    $path = $request->file('profile_picture')->store('avatars/students', 'public');
                    $profilePicturePath = '/storage/' . $path;
                }

                // Update student data
                $student->update([
                    'name' => $request->name,
                    'nisn' => $request->nisn,
                    'gender' => $request->gender,
                    'birth_date' => $request->birth_date,
                    'birth_place' => $request->birth_place,
                    'profile_picture' => $profilePicturePath,
                ]);

                Log::info('Student updated successfully');

                DB::commit();

                return redirect()->route('admin.students.index')
                    ->with('success', 'Data siswa berhasil diperbarui.');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error in transaction: ' . $e->getMessage());
                Log::error($e->getTraceAsString());

                return redirect()->back()
                    ->withErrors(['error' => 'Gagal memperbarui data siswa. Mohon periksa kembali data yang diisi.'])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Error in update method: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()])
                ->withInput();
        }
    }

    // Fungsi untuk menambahkan debug info ke data lama
    public function debugOldData()
    {
        try {
            // Ambil 10 data student tertua
            $oldStudents = Student::orderBy('created_at', 'asc')
                ->take(10)
                ->get();

            $results = [];

            foreach ($oldStudents as $student) {
                $userId = $student->user_id;
                $user = User::find($userId);

                $semesterStudents = DB::table('semesters_students')
                    ->where('students_id', $student->id)
                    ->get();

                $results[] = [
                    'student_id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'created_at' => $student->created_at ? $student->created_at->format('Y-m-d H:i:s') : 'null',
                    'user_id' => $userId,
                    'user_exists' => $user ? true : false,
                    'user_email' => $user ? $user->email : 'not found',
                    'semester_students_count' => $semesterStudents->count(),
                    'semester_students_data' => $semesterStudents,
                ];
            }

            return response()->json([
                'old_students_debug' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function destroy(Student $student)
    {
        // Simpan user_id sebelum menghapus student
        $userId = $student->user_id;
        $studentName = $student->name;

        DB::beginTransaction();

        try {
            // Hapus relasi di tabel semesters_students
            DB::table('semesters_students')
                ->where('students_id', $student->id)
                ->delete();

            // Hapus submission tugas jika ada
            DB::table('assignment_submissions')
                ->where('student_id', $student->id)
                ->delete();

            // Hapus absensi jika ada
            DB::table('attendances')
                ->where('student_id', $student->id)
                ->delete();

            // Hapus student
            $student->delete();

            // Hapus notifikasi terkait
            DB::table('notifications')
                ->where('user_id', $userId)
                ->delete();

            // Hapus user terkait
            if ($userId) {
                User::where('id', $userId)->delete();
            }

            DB::commit();

            // Log aktivitas (menggunakan ID admin yang sedang login)
            $this->logActivity(auth()->id(), 'delete', 'Deleted student: ' . $studentName);

            return redirect()->route('admin.students.index')
                ->with('success', 'Data siswa berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors(['error' => 'Gagal menghapus siswa: ' . $e->getMessage()]);
        }
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        DB::beginTransaction();

        try {
            $studentIds = $request->student_ids;
            $userIds = Student::whereIn('id', $studentIds)->pluck('user_id')->toArray();

            // Hapus relasi di tabel semesters_students
            DB::table('semesters_students')
                ->whereIn('students_id', $studentIds)
                ->delete();

            // Hapus submission tugas
            DB::table('assignment_submissions')
                ->whereIn('student_id', $studentIds)
                ->delete();

            // Hapus absensi
            DB::table('attendances')
                ->whereIn('student_id', $studentIds)
                ->delete();

            // Hapus student
            Student::whereIn('id', $studentIds)->delete();

            // Hapus notifikasi terkait
            DB::table('notifications')
                ->whereIn('user_id', $userIds)
                ->delete();

            // Hapus user terkait
            User::whereIn('id', $userIds)->delete();

            DB::commit();

            // Log aktivitas
            $this->logActivity(auth()->id(), 'bulk_delete', 'Bulk deleted ' . count($studentIds) . ' students');

            return redirect()->route('admin.students.index')
                ->with('success', count($studentIds) . ' siswa berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors(['error' => 'Gagal menghapus beberapa siswa: ' . $e->getMessage()]);
        }
    }

    public function export(Request $request)
    {
        $students = Student::with('user', 'classes')->get();

        $filename = 'data_siswa_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($students) {
            $output = fopen('php://output', 'w');

            // Tambah BOM supaya Excel membaca UTF-8 dengan benar
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            $delimiter = ';';

            // Header kolom
            fputcsv($output, ['Nama', 'NISN', 'Email', 'Jenis Kelamin', 'Kelas'], $delimiter);

            foreach ($students as $student) {
                $classes = $student->classes
                    ? $student->classes->pluck('name')->unique()->implode(', ')
                    : '';

                fputcsv($output, [
                    $student->name,
                    $student->nisn,
                    optional($student->user)->email,
                    $student->gender,
                    $classes,
                ], $delimiter);
            }

            fclose($output);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    // Fungsi untuk mencatat aktivitas
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

    // API Endpoint untuk search autocomplete
    public function searchAutocomplete(Request $request)
    {
        $search = $request->input('q');
        $limit = $request->input('limit', 10);

        if (empty($search)) {
            return response()->json([]);
        }

        $students = Student::where('name', 'like', "%{$search}%")
            ->orWhere('nisn', 'like', "%{$search}%")
            ->orWhereHas('user', function ($query) use ($search) {
                $query->where('email', 'like', "%{$search}%");
            })
            ->with('user')
            ->limit($limit)
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'email' => $student->user->email,
                ];
            });

        return response()->json($students);
    }
}
