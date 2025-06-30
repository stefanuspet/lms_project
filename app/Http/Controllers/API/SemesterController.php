<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    /**
     * Mendapatkan daftar semester untuk siswa yang sedang login
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Ambil user yang sedang login
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        // Ambil semester yang diikuti oleh siswa
        $semesters = $student->semesters()
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(function ($semester) use ($student) {
                // Ambil kelas siswa untuk semester ini
                $classForThisSemester = $student->getClassesForSemester($semester->id)->first();

                return [
                    'id' => $semester->id,
                    'name' => $semester->name,
                    'start_date' => $semester->start_date->format('Y-m-d'),
                    'end_date' => $semester->end_date->format('Y-m-d'),
                    'is_active' => $semester->isActive(),
                    'class' => $classForThisSemester ? [
                        'id' => $classForThisSemester->id,
                        'name' => $classForThisSemester->name,
                        'description' => $classForThisSemester->description,
                    ] : null
                ];
            });

        // Identifikasi semester aktif
        $activeSemester = $semesters->first(function ($semester) {
            return $semester['is_active'];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'semesters' => $semesters,
                'active_semester' => $activeSemester
            ]
        ]);
    }

    /**
     * Mendapatkan detail semester beserta kelas siswa
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        // Validasi semester ID
        $semester = Semester::find($id);
        if (!$semester) {
            return response()->json([
                'success' => false,
                'message' => 'Semester tidak ditemukan'
            ], 404);
        }

        // Ambil user yang sedang login
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        // Cek apakah siswa terdaftar dalam semester ini
        $studentInSemester = $student->semesters()->where('semesters.id', $id)->exists();
        if (!$studentInSemester) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar pada semester ini'
            ], 403);
        }

        // Ambil kelas siswa untuk semester ini
        $classForThisSemester = $student->getClassesForSemester($id)->first();

        // Siapkan data semester
        $semesterData = [
            'id' => $semester->id,
            'name' => $semester->name,
            'start_date' => $semester->start_date->format('Y-m-d'),
            'end_date' => $semester->end_date->format('Y-m-d'),
            'is_active' => $semester->isActive(),
            'class' => $classForThisSemester ? [
                'id' => $classForThisSemester->id,
                'name' => $classForThisSemester->name,
                'description' => $classForThisSemester->description,
            ] : null
        ];

        // Jika ada kelas, ambil data mata pelajaran
        $subjects = [];
        if ($classForThisSemester) {
            $subjects = $classForThisSemester->subjects()
                ->with('teacher')
                ->get()
                ->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        'description' => $subject->description,
                        'teacher' => $subject->teacher ? [
                            'id' => $subject->teacher->id,
                            'name' => $subject->teacher->name
                        ] : null
                    ];
                });
        }

        // Ambil statistik performa siswa untuk semester ini
        $performanceMetrics = [
            'attendance' => $this->getAttendanceMetrics($student, $semester),
            'assignments' => $this->getAssignmentMetrics($student, $semester, $classForThisSemester)
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'semester' => $semesterData,
                'subjects' => $subjects,
                'performance' => $performanceMetrics
            ]
        ]);
    }

    /**
     * Mendapatkan statistik kehadiran siswa untuk semester tertentu
     *
     * @param Student $student
     * @param Semester $semester
     * @return array
     */
    private function getAttendanceMetrics(Student $student, Semester $semester)
    {
        // Total sesi kehadiran
        $totalSessions = $student->attendances()
            ->whereHas('session', function ($query) use ($semester) {
                $query->where('semester_id', $semester->id);
            })
            ->count();

        // Kehadiran (hadir)
        $presentCount = $student->attendances()
            ->whereHas('session', function ($query) use ($semester) {
                $query->where('semester_id', $semester->id);
            })
            ->where('status', 'hadir')
            ->count();

        // Izin
        $excusedCount = $student->attendances()
            ->whereHas('session', function ($query) use ($semester) {
                $query->where('semester_id', $semester->id);
            })
            ->where('status', 'izin')
            ->count();

        // Sakit
        $sickCount = $student->attendances()
            ->whereHas('session', function ($query) use ($semester) {
                $query->where('semester_id', $semester->id);
            })
            ->where('status', 'sakit')
            ->count();

        // Alpha (tidak hadir tanpa keterangan)
        $absentCount = $student->attendances()
            ->whereHas('session', function ($query) use ($semester) {
                $query->where('semester_id', $semester->id);
            })
            ->where('status', 'alpha')
            ->count();

        // Tingkat kehadiran (persentase)
        $attendanceRate = $totalSessions > 0
            ? round(($presentCount / $totalSessions) * 100, 2)
            : 0;

        return [
            'total_sessions' => $totalSessions,
            'present' => $presentCount,
            'excused' => $excusedCount,
            'sick' => $sickCount,
            'absent' => $absentCount,
            'attendance_rate' => $attendanceRate
        ];
    }

    /**
     * Mendapatkan statistik tugas siswa untuk semester tertentu
     *
     * @param Student $student
     * @param Semester $semester
     * @param Classroom|null $classroom
     * @return array
     */
    private function getAssignmentMetrics(Student $student, Semester $semester, $classroom)
    {
        if (!$classroom) {
            return [
                'total_assignments' => 0,
                'completed' => 0,
                'graded' => 0,
                'average_grade' => 0,
                'late_submissions' => 0
            ];
        }

        // Ambil semua tugas untuk kelas siswa pada semester ini
        $subjects = $classroom->subjects()->pluck('id')->toArray();

        // Total tugas
        $totalAssignments = \App\Models\Assignment::whereIn('subject_id', $subjects)->count();

        // Tugas yang sudah dikumpulkan
        $submittedAssignments = $student->assignmentSubmissions()
            ->whereHas('assignment', function ($query) use ($subjects) {
                $query->whereIn('subject_id', $subjects);
            })
            ->whereNotNull('submitted_at')
            ->count();

        // Tugas yang sudah dinilai
        $gradedAssignments = $student->assignmentSubmissions()
            ->whereHas('assignment', function ($query) use ($subjects) {
                $query->whereIn('subject_id', $subjects);
            })
            ->whereNotNull('grade')
            ->count();

        // Nilai rata-rata
        $averageGrade = $student->assignmentSubmissions()
            ->whereHas('assignment', function ($query) use ($subjects) {
                $query->whereIn('subject_id', $subjects);
            })
            ->whereNotNull('grade')
            ->avg('grade') ?? 0;

        // Tugas yang terlambat dikumpulkan
        $lateSubmissions = $student->assignmentSubmissions()
            ->join('assignments', 'assignment_submissions.assignment_id', '=', 'assignments.id')
            ->whereIn('assignments.subject_id', $subjects)
            ->whereRaw('assignment_submissions.submitted_at > assignments.deadline')
            ->count();

        return [
            'total_assignments' => $totalAssignments,
            'completed' => $submittedAssignments,
            'graded' => $gradedAssignments,
            'average_grade' => round($averageGrade, 2),
            'late_submissions' => $lateSubmissions
        ];
    }
}
