<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    /**
     * Mendapatkan informasi kelas aktif siswa
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function current(Request $request)
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

        // Ambil semester aktif
        $activeSemester = $student->semesters()
            ->orderBy('start_date', 'desc')
            ->get()
            ->first(function ($semester) {
                return $semester->isActive();
            });

        if (!$activeSemester) {
            // Jika tidak ada semester aktif, ambil semester terakhir
            $activeSemester = $student->semesters()
                ->orderBy('start_date', 'desc')
                ->first();
        }

        if (!$activeSemester) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada kelas aktif yang ditemukan'
            ], 404);
        }

        // Ambil kelas siswa untuk semester aktif
        $currentClass = $student->getClassesForSemester($activeSemester->id)->first();

        if (!$currentClass) {
            return response()->json([
                'success' => false,
                'message' => 'Anda belum terdaftar dalam kelas untuk semester ini'
            ], 404);
        }

        // Ambil daftar mata pelajaran untuk kelas ini
        $subjects = $currentClass->subjects()
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

        // Data kelas
        $classData = [
            'id' => $currentClass->id,
            'name' => $currentClass->name,
            'description' => $currentClass->description,
            'semester' => [
                'id' => $activeSemester->id,
                'name' => $activeSemester->name,
                'start_date' => $activeSemester->start_date->format('Y-m-d'),
                'end_date' => $activeSemester->end_date->format('Y-m-d'),
                'is_active' => $activeSemester->isActive()
            ],
            'subjects' => $subjects
        ];

        return response()->json([
            'success' => true,
            'data' => $classData
        ]);
    }

    /**
     * Mendapatkan detail kelas siswa
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id)
    {
        // Validasi class ID
        $classroom = Classroom::find($id);
        if (!$classroom) {
            return response()->json([
                'success' => false,
                'message' => 'Kelas tidak ditemukan'
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

        // Cek apakah siswa terdaftar dalam kelas ini
        $studentInClass = $student->isEnrolledIn($classroom->id);
        if (!$studentInClass) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar dalam kelas ini'
            ], 403);
        }

        // Ambil semester terkait kelas ini untuk siswa
        $semester = $student->semesters()
            ->wherePivot('class_id', $classroom->id)
            ->orderBy('start_date', 'desc')
            ->first();

        // Ambil daftar mata pelajaran untuk kelas ini
        $subjects = $classroom->subjects()
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

        // Statistik kelas
        $totalStudents = $classroom->students()
            ->wherePivot('semesters_id', $semester->id)
            ->count();

        // Data kelas
        $classData = [
            'id' => $classroom->id,
            'name' => $classroom->name,
            'description' => $classroom->description,
            'semester' => $semester ? [
                'id' => $semester->id,
                'name' => $semester->name,
                'start_date' => $semester->start_date->format('Y-m-d'),
                'end_date' => $semester->end_date->format('Y-m-d'),
                'is_active' => $semester->isActive()
            ] : null,
            'stats' => [
                'total_students' => $totalStudents,
                'total_subjects' => $subjects->count()
            ],
            'subjects' => $subjects
        ];

        return response()->json([
            'success' => true,
            'data' => $classData
        ]);
    }
}
