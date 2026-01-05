<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Semester;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    /**
     * Display enrollment management page.
     */
    public function index(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'semester_id' => 'nullable|exists:semesters,id',
            'class_id' => 'nullable|exists:classes,id',
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        // Get active semester if not specified
        $activeSemester = $request->filled('semester_id')
            ? Semester::find($request->semester_id)
            : Semester::where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->orderByDesc('start_date')
                ->first();

        // If no active semester, get the latest one
        if (!$activeSemester) {
            $activeSemester = Semester::orderBy('start_date', 'desc')->first();
        }

        // Get all semesters for dropdown
        $semesters = Semester::orderBy('start_date', 'desc')->get()
            ->map(function ($semester) {
                return [
                    'id' => $semester->id,
                    'name' => $semester->name,
                    'is_active' => $semester->isActive(),
                ];
            });

        // Get all classes for dropdown
        $classes = Classroom::orderBy('name')->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                ];
            });

        // Set default values
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $selectedClass = $request->input('class_id');

        // Base query: Get all students
        $studentsQuery = Student::with('user');

        // Apply search filter
        if (!empty($search)) {
            $studentsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($query) use ($search) {
                        $query->where('email', 'like', "%{$search}%");
                    });
            });
        }

        // Get enrolled student IDs for the active semester and selected class
        $enrolledStudentIds = [];
        if ($activeSemester) {
            $enrollmentQuery = DB::table('semesters_students')
                ->where('semesters_id', $activeSemester->id);

            if ($selectedClass) {
                $enrollmentQuery->where('class_id', $selectedClass);
            }

            $enrolledStudentIds = $enrollmentQuery->pluck('students_id')->toArray();
        }

        // Get all students with enrollment status
        $students = $studentsQuery->paginate($perPage);

        // Format students data with enrollment info
        $formattedStudents = $students->map(function ($student) use ($enrolledStudentIds, $activeSemester, $selectedClass) {
            $isEnrolled = in_array($student->id, $enrolledStudentIds);

            // Get enrollment details if enrolled
            $enrollmentDetails = null;
            if ($isEnrolled && $activeSemester) {
                $enrollment = DB::table('semesters_students')
                    ->where('students_id', $student->id)
                    ->where('semesters_id', $activeSemester->id);

                if ($selectedClass) {
                    $enrollment->where('class_id', $selectedClass);
                }

                $enrollmentRecord = $enrollment->first();

                if ($enrollmentRecord) {
                    $className = Classroom::find($enrollmentRecord->class_id)->name ?? 'Unknown';
                    $enrollmentDetails = [
                        'class_id' => $enrollmentRecord->class_id,
                        'class_name' => $className,
                        'enrolled_at' => date('d M Y', strtotime($enrollmentRecord->created_at)),
                    ];
                }
            }

            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'email' => $student->user->email,
                'gender' => $student->gender,
                'is_enrolled' => $isEnrolled,
                'enrollment_details' => $enrollmentDetails,
            ];
        });

        // Get class statistics for the active semester
        $classStats = [];
        if ($activeSemester) {
            $classStats = DB::table('semesters_students')
                ->where('semesters_id', $activeSemester->id)
                ->join('classes', 'semesters_students.class_id', '=', 'classes.id')
                ->select('classes.id', 'classes.name', DB::raw('count(*) as student_count'))
                ->groupBy('classes.id', 'classes.name')
                ->get();
        }

        return Inertia::render('Admin/Enrollment/Index', [
            'students' => [
                'data' => $formattedStudents->values()->all(),
                'total' => $students->total(),
                'per_page' => $students->perPage(),
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'from' => $students->firstItem(),
                'to' => $students->lastItem(),
            ],
            'semesters' => $semesters,
            'classes' => $classes,
            'active_semester' => $activeSemester ? [
                'id' => $activeSemester->id,
                'name' => $activeSemester->name,
                'start_date' => $activeSemester->start_date->format('Y-m-d'),
                'end_date' => $activeSemester->end_date->format('Y-m-d'),
                'is_active' => $activeSemester->isActive(),
            ] : null,
            'selected_class' => $selectedClass,
            'class_stats' => $classStats,
            'filters' => [
                'search' => $search,
            ],
            'pagination' => [
                'total' => $students->total(),
                'per_page' => $students->perPage(),
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'from' => $students->firstItem(),
                'to' => $students->lastItem(),
            ],
        ]);
    }

    /**
     * Enroll students to a semester and class.
     */
    public function enroll(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'class_id' => 'required|exists:classes,id',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        try {
            DB::beginTransaction();

            $semesterId = $request->semester_id;
            $classId = $request->class_id;
            $studentIds = $request->student_ids;
            $now = now();

            // Get existing enrollments for these students in this semester
            $existingEnrollments = DB::table('semesters_students')
                ->where('semesters_id', $semesterId)
                ->whereIn('students_id', $studentIds)
                ->get();

            $existingStudentIds = $existingEnrollments->pluck('students_id')->toArray();

            // Update existing enrollments to the new class
            foreach ($existingEnrollments as $enrollment) {
                DB::table('semesters_students')
                    ->where('id', $enrollment->id)
                    ->update([
                        'class_id' => $classId,
                        'updated_at' => $now,
                    ]);
            }

            // Insert new enrollments for students not already enrolled
            $newStudentIds = array_diff($studentIds, $existingStudentIds);
            $newEnrollments = [];

            foreach ($newStudentIds as $studentId) {
                $newEnrollments[] = [
                    'semesters_id' => $semesterId,
                    'students_id' => $studentId,
                    'class_id' => $classId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (!empty($newEnrollments)) {
                DB::table('semesters_students')->insert($newEnrollments);
            }

            DB::commit();

            // Log activity
            $semester = Semester::find($semesterId)->name;
            $class = Classroom::find($classId)->name;
            $count = count($studentIds);
            $this->logActivity(
                auth()->id(),
                'enroll',
                "Enrolled {$count} students to {$class} class for {$semester} semester"
            );

            return redirect()->back()->with('success', "{$count} students enrolled successfully");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error enrolling students: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to enroll students: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Unenroll students from a semester.
     */
    public function unenroll(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'class_id' => 'nullable|exists:classes,id',
        ]);

        try {
            DB::beginTransaction();

            $semesterId = $request->semester_id;
            $studentIds = $request->student_ids;
            $classId = $request->class_id;

            // Build the query
            $query = DB::table('semesters_students')
                ->where('semesters_id', $semesterId)
                ->whereIn('students_id', $studentIds);

            // If class_id is provided, only unenroll from that specific class
            if ($classId) {
                $query->where('class_id', $classId);
            }

            // Delete the enrollments
            $deleted = $query->delete();

            DB::commit();

            // Log activity
            $semester = Semester::find($semesterId)->name;
            $classInfo = $classId ? " from " . Classroom::find($classId)->name . " class" : "";
            $count = count($studentIds);
            $this->logActivity(
                auth()->id(),
                'unenroll',
                "Unenrolled {$count} students{$classInfo} for {$semester} semester"
            );

            return redirect()->back()->with('success', "{$count} students unenrolled successfully");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error unenrolling students: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to unenroll students: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Move students to a different class within the same semester.
     */
    public function moveClass(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
            'from_class_id' => 'required|exists:classes,id',
            'to_class_id' => 'required|exists:classes,id|different:from_class_id',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        try {
            DB::beginTransaction();

            $semesterId = $request->semester_id;
            $fromClassId = $request->from_class_id;
            $toClassId = $request->to_class_id;
            $studentIds = $request->student_ids;

            // Update the class for these students
            $updated = DB::table('semesters_students')
                ->where('semesters_id', $semesterId)
                ->where('class_id', $fromClassId)
                ->whereIn('students_id', $studentIds)
                ->update([
                    'class_id' => $toClassId,
                    'updated_at' => now(),
                ]);

            DB::commit();

            // Log activity
            $semester = Semester::find($semesterId)->name;
            $fromClass = Classroom::find($fromClassId)->name;
            $toClass = Classroom::find($toClassId)->name;
            $count = count($studentIds);
            $this->logActivity(
                auth()->id(),
                'move_class',
                "Moved {$count} students from {$fromClass} to {$toClass} class in {$semester} semester"
            );

            return redirect()->back()->with('success', "{$count} students moved to {$toClass} successfully");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error moving students: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to move students: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Promote students to the next semester.
     */
    public function promote(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'from_semester_id' => 'required|exists:semesters,id',
            'to_semester_id' => 'required|exists:semesters,id|different:from_semester_id',
            'class_mapping' => 'required|array',
            'class_mapping.*.from_class_id' => 'required|exists:classes,id',
            'class_mapping.*.to_class_id' => 'required|exists:classes,id',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        try {
            DB::beginTransaction();

            $fromSemesterId = $request->from_semester_id;
            $toSemesterId = $request->to_semester_id;
            $classMapping = collect($request->class_mapping)->keyBy('from_class_id');
            $studentIds = $request->student_ids;
            $now = now();

            // Get current enrollments for these students
            $currentEnrollments = DB::table('semesters_students')
                ->where('semesters_id', $fromSemesterId)
                ->whereIn('students_id', $studentIds)
                ->get();

            // Check if any students are already enrolled in the target semester
            $existingInTarget = DB::table('semesters_students')
                ->where('semesters_id', $toSemesterId)
                ->whereIn('students_id', $studentIds)
                ->pluck('students_id')
                ->toArray();

            // If there are existing enrollments, delete them first
            if (!empty($existingInTarget)) {
                DB::table('semesters_students')
                    ->where('semesters_id', $toSemesterId)
                    ->whereIn('students_id', $existingInTarget)
                    ->delete();
            }

            // Create new enrollments in the target semester
            $newEnrollments = [];

            foreach ($currentEnrollments as $enrollment) {
                $fromClassId = $enrollment->class_id;
                $toClassId = isset($classMapping[$fromClassId])
                    ? $classMapping[$fromClassId]->to_class_id
                    : $fromClassId; // Default to same class if mapping not provided

                $newEnrollments[] = [
                    'semesters_id' => $toSemesterId,
                    'students_id' => $enrollment->students_id,
                    'class_id' => $toClassId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (!empty($newEnrollments)) {
                DB::table('semesters_students')->insert($newEnrollments);
            }

            DB::commit();

            // Log activity
            $fromSemester = Semester::find($fromSemesterId)->name;
            $toSemester = Semester::find($toSemesterId)->name;
            $count = count($newEnrollments);
            $this->logActivity(
                auth()->id(),
                'promote',
                "Promoted {$count} students from {$fromSemester} to {$toSemester} semester"
            );

            return redirect()->back()->with('success', "{$count} students promoted to {$toSemester} successfully");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error promoting students: ' . $e->getMessage());

            return redirect()->back()
                ->withErrors(['error' => 'Failed to promote students: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Get student enrollment history.
     */
    public function studentHistory($studentId)
    {
        $student = Student::with('user')->findOrFail($studentId);

        $enrollments = DB::table('semesters_students')
            ->where('students_id', $studentId)
            ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
            ->join('classes', 'semesters_students.class_id', '=', 'classes.id')
            ->select(
                'semesters_students.id',
                'semesters.id as semester_id',
                'semesters.name as semester_name',
                'semesters.start_date',
                'semesters.end_date',
                'classes.id as class_id',
                'classes.name as class_name',
                'semesters_students.created_at'
            )
            ->orderBy('semesters.start_date', 'desc')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'semester' => [
                        'id' => $enrollment->semester_id,
                        'name' => $enrollment->semester_name,
                        'start_date' => date('Y-m-d', strtotime($enrollment->start_date)),
                        'end_date' => date('Y-m-d', strtotime($enrollment->end_date)),
                    ],
                    'class' => [
                        'id' => $enrollment->class_id,
                        'name' => $enrollment->class_name,
                    ],
                    'enrolled_at' => date('d M Y', strtotime($enrollment->created_at)),
                ];
            });

        return Inertia::render('Admin/Enrollment/History', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'email' => $student->user->email,
                'gender' => $student->gender,
            ],
            'enrollments' => $enrollments,
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
