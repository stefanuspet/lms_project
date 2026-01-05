<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:name,nip,email',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        // Set default values if not provided
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $page = $request->input('page', 1);

        // Query teacher dengan relasi user
        $query = Teacher::query()
            ->with(['user', 'subjects.classroom']);

        // Apply search filters
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('subjects', function ($subjectQuery) use ($search) {
                        $subjectQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        // Execute paginated query
        $teachers = $query->paginate($perPage)->withQueryString();

        // Format data untuk frontend
            $formattedTeachers = $teachers->map(function ($teacher) {
            // Ambil daftar kelas yang diajar
            $classes = $teacher->subjects->flatMap(function ($subject) {
                return $subject->classroom ? [$subject->classroom->name] : [];
            })->unique()->implode(', ');

            // Ambil daftar mata pelajaran
            $subjects = $teacher->subjects->pluck('name')->unique()->implode(', ');

            // Format data guru untuk tampilan
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'nip' => $teacher->nip,
                    'email' => $teacher->user->email,
                    'school_id' => $teacher->nip,
                    'subject' => $subjects,
                    'classes' => $classes,
                    'profile_picture' => $teacher->profile_picture ?? '/assets/images/default-avatar.png',
                ];
        });

        // Return data ke view
        return Inertia::render('Admin/Teacher/Index', [
            'teachers' => $formattedTeachers,
            'pagination' => [
                'total' => $teachers->total(),
                'per_page' => $teachers->perPage(),
                'current_page' => $teachers->currentPage(),
                'last_page' => $teachers->lastPage(),
                'from' => $teachers->firstItem(),
                'to' => $teachers->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Export teacher data as CSV (bisa dibuka di Excel tanpa warning).
     */
    public function export(Request $request)
    {
        $teachers = Teacher::with(['user', 'subjects.classroom'])->get();

        $filename = 'data_guru_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($teachers) {
            $output = fopen('php://output', 'w');

            // Tambah BOM supaya Excel membaca UTF-8 dengan benar
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Gunakan ; sebagai delimiter (umum di regional Indonesia)
            $delimiter = ';';

            // Header kolom
            fputcsv($output, ['Nama', 'NIP', 'Email', 'Mata Pelajaran', 'Kelas'], $delimiter);

            foreach ($teachers as $teacher) {
                $classes = $teacher->subjects->flatMap(function ($subject) {
                    return $subject->classroom ? [$subject->classroom->name] : [];
                })->unique()->implode(', ');

                $subjects = $teacher->subjects->pluck('name')->unique()->implode(', ');

                fputcsv($output, [
                    $teacher->name,
                    $teacher->nip,
                    optional($teacher->user)->email,
                    $subjects,
                    $classes,
                ], $delimiter);
            }

            fclose($output);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    public function create()
    {
        return Inertia::render('Admin/Teacher/Create');
    }

    public function store(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'nip' => 'required|string|max:20|unique:teachers',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            ]);

            DB::beginTransaction();

            // Buat user baru
            $user = User::create([
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'role' => 'guru',
            ]);

            // Tentukan path foto profil (default atau upload)
            $profilePicturePath = '/assets/images/default-avatar.png';
            if ($request->hasFile('profile_picture')) {
                $path = $request
                    ->file('profile_picture')
                    ->store('avatars/teachers', 'public');
                $profilePicturePath = '/storage/' . $path;
            }

            // Buat teacher baru
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'nip' => $request->nip,
                'phone' => $request->phone ?? null,
                'address' => $request->address ?? null,
                'profile_picture' => $profilePicturePath,
            ]);

            // Log aktivitas
            $this->logActivity(
                auth()->id(),
                'create teacher',
                'Created new teacher: ' . $teacher->name . ' (NIP: ' . $teacher->nip . ')'
            );

            DB::commit();

            return redirect()->route('admin.teachers.index')->with('success', 'Teacher created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating teacher: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to create teacher: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified teacher.
     */
    public function show(Teacher $teacher)
    {
        try {
            $teacher->load(['user', 'subjects.classroom']);

            // Log aktivitas
            $this->logActivity(
                auth()->id(),
                'view teacher',
                'Viewed teacher details: ' . $teacher->name . ' (NIP: ' . $teacher->nip . ')'
            );

            return Inertia::render('Admin/Teacher/Show', [
                'teacher' => [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'nip' => $teacher->nip,
                    'profile_picture' => $teacher->profile_picture,
                    'phone' => $teacher->phone,
                    'address' => $teacher->address,
                    'user' => [
                        'id' => $teacher->user->id,
                        'email' => $teacher->user->email,
                    ],
                    'subjects' => $teacher->subjects->map(function ($subject) {
                        return [
                            'id' => $subject->id,
                            'name' => $subject->name,
                            'classroom' => $subject->classroom ? [
                                'id' => $subject->classroom->id,
                                'name' => $subject->classroom->name,
                            ] : null,
                        ];
                    }),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing teacher: ' . $e->getMessage());
            return redirect()->route('admin.teachers.index')
                ->with('error', 'Error displaying teacher details: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified teacher.
     */
    public function edit(Teacher $teacher)
    {
        try {
            $teacher->load('user');

            return Inertia::render('Admin/Teacher/Edit', [
                'teacher' => [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'nip' => $teacher->nip,
                    'phone' => $teacher->phone,
                    'address' => $teacher->address,
                    'user' => [
                        'id' => $teacher->user->id,
                        'email' => $teacher->user->email,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error editing teacher: ' . $e->getMessage());
            return redirect()->route('admin.teachers.index')
                ->with('error', 'Error loading teacher for editing: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified teacher in storage.
     */
    public function update(Request $request, Teacher $teacher)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->user_id,
                'password' => 'nullable|string|min:8|confirmed',
                'nip' => 'required|string|max:20|unique:teachers,nip,' . $teacher->id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            ]);

            DB::beginTransaction();

            // Update user data
            $userData = [
                'email' => $request->email,
            ];

            // Update password if provided
            if ($request->filled('password')) {
                $userData['password'] = bcrypt($request->password);
            }

            $teacher->user->update($userData);

            // Update teacher data
            // Tentukan path foto profil (tetap, atau upload baru jika ada)
            $profilePicturePath =
                $teacher->profile_picture ?? '/assets/images/default-avatar.png';
            if ($request->hasFile('profile_picture')) {
                $path = $request
                    ->file('profile_picture')
                    ->store('avatars/teachers', 'public');
                $profilePicturePath = '/storage/' . $path;
            }

            $teacher->update([
                'name' => $request->name,
                'nip' => $request->nip,
                'phone' => $request->phone,
                'address' => $request->address,
                'profile_picture' => $profilePicturePath,
            ]);

            // Log aktivitas
            $this->logActivity(
                auth()->id(),
                'update teacher',
                'Updated teacher: ' . $teacher->name . ' (NIP: ' . $teacher->nip . ')'
            );

            DB::commit();

            return redirect()->route('admin.teachers.index')->with('success', 'Teacher updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating teacher: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to update teacher: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified teacher from storage.
     */
    public function destroy(Teacher $teacher)
    {
        try {
            DB::beginTransaction();

            // Simpan informasi teacher sebelum dihapus untuk logging
            $teacherName = $teacher->name;
            $teacherNip = $teacher->nip;

            // Simpan user_id sebelum menghapus teacher
            $userId = $teacher->user_id;

            // Cek apakah guru memiliki mata pelajaran terkait
            $subjectsCount = $teacher->subjects()->count();
            if ($subjectsCount > 0) {
                return redirect()->back()->withErrors([
                    'error' => "Cannot delete teacher because they have {$subjectsCount} subjects assigned. Please reassign the subjects first."
                ]);
            }

            // Hapus relasi teachers_subjects jika ada
            DB::table('teachers_subjects')
                ->where('teacher_id', $teacher->id)
                ->delete();

            // Hapus teacher
            $teacher->delete();

            // Hapus notifikasi terkait
            DB::table('notifications')
                ->where('user_id', $userId)
                ->delete();

            // Hapus user terkait
            if ($userId) {
                User::where('id', $userId)->delete();
            }

            // Log aktivitas
            $this->logActivity(
                auth()->id(),
                'delete teacher',
                'Deleted teacher: ' . $teacherName . ' (NIP: ' . $teacherNip . ')'
            );

            DB::commit();

            return redirect()->route('admin.teachers.index')->with('success', 'Teacher deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting teacher: ' . $e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to delete teacher: ' . $e->getMessage()]);
        }
    }

    /**
     * Bulk delete teachers.
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'exists:teachers,id',
        ]);

        DB::beginTransaction();

        try {
            $teacherIds = $request->teacher_ids;

            // Check which teachers have subjects
            $teachersWithSubjects = Teacher::whereIn('id', $teacherIds)
                ->withCount('subjects')
                ->having('subjects_count', '>', 0)
                ->get();

            if ($teachersWithSubjects->count() > 0) {
                $teacherNames = $teachersWithSubjects->pluck('name')->implode(', ');
                return redirect()->back()->withErrors([
                    'error' => "Cannot delete teachers with assigned subjects: {$teacherNames}"
                ]);
            }

            // Get user IDs for these teachers
            $userIds = Teacher::whereIn('id', $teacherIds)->pluck('user_id')->toArray();

            // Delete teachers_subjects records
            DB::table('teachers_subjects')
                ->whereIn('teacher_id', $teacherIds)
                ->delete();

            // Delete teachers
            Teacher::whereIn('id', $teacherIds)->delete();

            // Delete notifications
            DB::table('notifications')
                ->whereIn('user_id', $userIds)
                ->delete();

            // Delete users
            User::whereIn('id', $userIds)->delete();

            // Log aktivitas
            $this->logActivity(
                auth()->id(),
                'bulk delete teachers',
                'Bulk deleted ' . count($teacherIds) . ' teachers'
            );

            DB::commit();

            return redirect()->route('admin.teachers.index')
                ->with('success', count($teacherIds) . ' teachers deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error bulk deleting teachers: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete teachers: ' . $e->getMessage()]);
        }
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
