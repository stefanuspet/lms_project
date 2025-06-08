<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
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
            ->with(['user', 'subjects.class']);

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
                return $subject->class ? [$subject->class->name] : [];
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

    // Metode lainnya tetap sama...

    public function create()
    {
        return Inertia::render('Admin/Teacher/Create');
    }

    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'nip' => 'required|string|max:20|unique:teachers',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        // Buat user baru
        $user = User::create([
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'guru',
        ]);

        // Buat teacher baru
        $teacher = Teacher::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'nip' => $request->nip,
            'phone' => $request->phone ?? null,
            'address' => $request->address ?? null,
        ]);

        return redirect()->route('admin.teachers.index')->with('success', 'Teacher created successfully');
    }

    /**
     * Display the specified teacher.
     */
    public function show(Teacher $teacher)
    {
        $teacher->load(['user', 'subjects.class']);

        return Inertia::render('Admin/Teacher/Show', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'nip' => $teacher->nip,
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
                        'class' => $subject->class ? [
                            'id' => $subject->class->id,
                            'name' => $subject->class->name,
                        ] : null,
                    ];
                }),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified teacher.
     */
    public function edit(Teacher $teacher)
    {
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
    }

    /**
     * Update the specified teacher in storage.
     */
    public function update(Request $request, Teacher $teacher)
    {
        // Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->user_id,
            'password' => 'nullable|string|min:8|confirmed',
            'nip' => 'required|string|max:20|unique:teachers,nip,' . $teacher->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

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
        $teacher->update([
            'name' => $request->name,
            'nip' => $request->nip,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        return redirect()->route('admin.teachers.index')->with('success', 'Teacher updated successfully');
    }

    /**
     * Remove the specified teacher from storage.
     */
    public function destroy(Teacher $teacher)
    {
        // Simpan user_id sebelum menghapus teacher
        $userId = $teacher->user_id;

        // Hapus teacher
        $teacher->delete();

        // Hapus user terkait
        if ($userId) {
            User::where('id', $userId)->delete();
        }

        return redirect()->route('admin.teachers.index')->with('success', 'Teacher deleted successfully');
    }
}
