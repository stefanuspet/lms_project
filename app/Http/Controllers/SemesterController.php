<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SemesterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:name,start_date,end_date,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'academic_year_id' => 'nullable|integer|exists:academic_years,id',
        ]);

        // Set default values if not provided
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'start_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $page = $request->input('page', 1);
        $academicYearId = $request->input('academic_year_id');

        // Query semesters
        $query = Semester::query()->with('academicYear');

        // Apply search filters
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if (!empty($academicYearId)) {
            $query->where('academic_year_id', $academicYearId);
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        // Execute paginated query
        $semesters = $query->paginate($perPage)->withQueryString();

        // Format data untuk frontend
        $formattedSemesters = $semesters->map(function ($semester) {
            $isActive = $semester->isActive();

            return [
                'id' => $semester->id,
                'name' => $semester->name,
                'academic_year_name' => optional($semester->academicYear)->name,
                'start_date' => $semester->start_date->format('Y-m-d'),
                'end_date' => $semester->end_date->format('Y-m-d'),
                'formatted_start_date' => $semester->start_date->format('d M Y'),
                'formatted_end_date' => $semester->end_date->format('d M Y'),
                'is_active' => $isActive,
                'status' => $isActive ? 'active' : 'inactive',
                'created_at' => $semester->created_at->format('d-m-Y H:i'),
                'student_count' => $semester->students()->count(),
            ];
        });

        // Return data ke view
        return Inertia::render('Admin/Semester/Index', [
            'semesters' => $formattedSemesters,
            'pagination' => [
                'total' => $semesters->total(),
                'per_page' => $semesters->perPage(),
                'current_page' => $semesters->currentPage(),
                'last_page' => $semesters->lastPage(),
                'from' => $semesters->firstItem(),
                'to' => $semesters->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'academic_year_id' => $academicYearId,
            ],
            'academic_years' => AcademicYear::orderBy('name', 'desc')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Semester/Create', [
            'academic_years' => AcademicYear::orderBy('name', 'desc')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'academic_year_id' => 'required|integer|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        try {
            DB::beginTransaction();

            // Buat semester baru
            $semester = Semester::create([
                'academic_year_id' => $request->academic_year_id,
                'name' => $request->name,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]);

            DB::commit();

            // Log aktivitas
            $this->logActivity(auth()->id(), 'create', 'Created a new semester: ' . $semester->name);

            return redirect()->route('admin.semesters.index')
                ->with('success', 'Semester created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating semester: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to create semester: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Semester $semester)
    {
        // Load necessary relations
        $semester->load(['students.user', 'teacherSubjects.teacher', 'teacherSubjects.subject']);

        // Get student count by class
        $studentsByClass = DB::table('semesters_students')
            ->where('semesters_id', $semester->id)
            ->join('classes', 'semesters_students.class_id', '=', 'classes.id')
            ->select('classes.id', 'classes.name', DB::raw('count(*) as count'))
            ->groupBy('classes.id', 'classes.name')
            ->get();

        return Inertia::render('Admin/Semester/Show', [
            'semester' => [
                'id' => $semester->id,
                'name' => $semester->name,
                'start_date' => $semester->start_date->format('Y-m-d'),
                'end_date' => $semester->end_date->format('Y-m-d'),
                'formatted_start_date' => $semester->start_date->format('d M Y'),
                'formatted_end_date' => $semester->end_date->format('d M Y'),
                'is_active' => $semester->isActive(),
                'created_at' => $semester->created_at->format('d-m-Y H:i'),
                'student_count' => $semester->students->count(),
                'teacher_subject_count' => $semester->teacherSubjects->count(),
            ],
            'students_by_class' => $studentsByClass,
            'teacher_subjects' => $semester->teacherSubjects->map(function ($teacherSubject) {
                return [
                    'id' => $teacherSubject->id,
                    'teacher' => [
                        'id' => $teacherSubject->teacher->id,
                        'name' => $teacherSubject->teacher->name,
                    ],
                    'subject' => [
                        'id' => $teacherSubject->subject->id,
                        'name' => $teacherSubject->subject->name,
                    ],
                ];
            }),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Semester $semester)
    {
        return Inertia::render('Admin/Semester/Edit', [
            'semester' => [
                'id' => $semester->id,
                'name' => $semester->name,
                'academic_year_id' => $semester->academic_year_id,
                'start_date' => $semester->start_date->format('Y-m-d'),
                'end_date' => $semester->end_date->format('Y-m-d'),
            ],
            'academic_years' => AcademicYear::orderBy('name', 'desc')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Semester $semester)
    {
        // Validasi input
        $validated = $request->validate([
            'academic_year_id' => 'required|integer|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        try {
            DB::beginTransaction();

            // Update semester
            $semester->update([
                'academic_year_id' => $request->academic_year_id,
                'name' => $request->name,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]);

            DB::commit();

            // Log aktivitas
            $this->logActivity(auth()->id(), 'update', 'Updated semester: ' . $semester->name);

            return redirect()->route('admin.semesters.index')
                ->with('success', 'Semester updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating semester: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to update semester: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Semester $semester)
    {
        try {
            DB::beginTransaction();

            // Check if semester has students
            $hasStudents = DB::table('semesters_students')
                ->where('semesters_id', $semester->id)
                ->exists();

            if ($hasStudents) {
                return redirect()->route('admin.semesters.index')
                    ->with('error', 'Cannot delete semester because it has students enrolled');
            }

            // Check if semester has teacher subjects
            $hasTeacherSubjects = DB::table('teachers_subjects')
                ->where('semester_id', $semester->id)
                ->exists();

            if ($hasTeacherSubjects) {
                return redirect()->route('admin.semesters.index')
                    ->with('error', 'Cannot delete semester because it has subjects assigned');
            }

            // Check if semester has attendance sessions
            $hasAttendanceSessions = DB::table('attendance_sessions')
                ->where('semester_id', $semester->id)
                ->exists();

            if ($hasAttendanceSessions) {
                return redirect()->route('admin.semesters.index')
                    ->with('error', 'Cannot delete semester because it has attendance sessions');
            }

            // If no relations, delete semester
            $semesterName = $semester->name;
            $semester->delete();

            DB::commit();

            // Log aktivitas
            $this->logActivity(auth()->id(), 'delete', 'Deleted semester: ' . $semesterName);

            return redirect()->route('admin.semesters.index')
                ->with('success', 'Semester deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting semester: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete semester: ' . $e->getMessage()]);
        }
    }

    /**
     * Set semester as active.
     */
    public function setActive(Semester $semester)
    {
        try {
            // Update all semesters end_date to yesterday if they end in the future
            Semester::where('id', '!=', $semester->id)
                ->where('end_date', '>', now())
                ->update(['end_date' => now()->subDay()]);

            // Set this semester as active by ensuring it spans the current date
            if ($semester->start_date > now()) {
                $semester->start_date = now();
            }

            if ($semester->end_date < now()) {
                $semester->end_date = now()->addMonths(6);
            }

            $semester->save();

            // Log aktivitas
            $this->logActivity(auth()->id(), 'update', 'Set semester as active: ' . $semester->name);

            return redirect()->route('admin.semesters.index')
                ->with('success', 'Semester set as active successfully');
        } catch (\Exception $e) {
            Log::error('Error setting semester as active: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to set semester as active: ' . $e->getMessage()]);
        }
    }

    /**
     * Get active semester for API.
     */
    public function getActiveSemester()
    {
        $now = now();
        $activeSemester = Semester::where('start_date', '<=', $now)
            ->where('end_date', '>=', $now)
            ->first();

        if (!$activeSemester) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active semester found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $activeSemester->id,
                'name' => $activeSemester->name,
                'start_date' => $activeSemester->start_date->format('Y-m-d'),
                'end_date' => $activeSemester->end_date->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Logs activity.
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
