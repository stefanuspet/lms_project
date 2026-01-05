<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Extracurricular;
use App\Models\Student;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExtracurricularController extends Controller
{
    /**
     * Get current authenticated student model.
     */
    protected function getCurrentStudent(Request $request): ?Student
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        if ($user->student) {
            return $user->student;
        }

        return Student::where('user_id', $user->id)->first();
    }

    /**
     * List extracurriculars joined by the student.
     */
    public function index(Request $request): JsonResponse
    {
        $student = $this->getCurrentStudent($request);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student data not found',
            ], 404);
        }

        $items = Extracurricular::with(['teacher', 'semester'])
            ->where('is_active', true)
            ->whereHas('students', function ($q) use ($student) {
                $q->where('students.id', $student->id);
            })
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function (Extracurricular $extra) {
                return [
                    'id' => $extra->id,
                    'name' => $extra->name,
                    'description' => $extra->description,
                    'teacher_name' => optional($extra->teacher)->name,
                    'semester_name' => optional($extra->semester)->name,
                    'day_of_week' => $extra->day_of_week,
                    'start_time' => $extra->start_time,
                    'end_time' => $extra->end_time,
                    'room' => $extra->room,
                    'is_active' => (bool) $extra->is_active,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Show detail of one extracurricular, including attendance summary for student.
     */
    public function show(Request $request, Extracurricular $extracurricular): JsonResponse
    {
        $student = $this->getCurrentStudent($request);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student data not found',
            ], 404);
        }

        $isJoined = $extracurricular->students()
            ->where('students.id', $student->id)
            ->exists();

        if (!$isJoined) {
            return response()->json([
                'success' => false,
                'message' => 'You are not enrolled in this extracurricular',
            ], 403);
        }

        $extracurricular->load(['teacher', 'semester']);

        // Sessions for this extracurricular
        $sessions = AttendanceSession::where('extracurricular_id', $extracurricular->id)
            ->orderByDesc('date')
            ->orderByDesc('start_time')
            ->get()
            ->map(function (AttendanceSession $session) use ($student) {
                $attendance = Attendance::where('attendance_sessions_id', $session->id)
                    ->where('student_id', $student->id)
                    ->first();

                return [
                    'id' => $session->id,
                    'title' => $session->title ?? 'Pertemuan',
                    'date' => $session->date ? $session->date->format('Y-m-d') : null,
                    'session_type' => $session->session_type,
                    'status' => $attendance?->status ?? 'belum_absen',
                    'submitted_at' => $attendance?->submitted_at
                        ? $attendance->submitted_at->format('H:i:s')
                        : null,
                ];
            });

        $summary = [
            'total_sessions' => $sessions->count(),
            'present' => $sessions->where('status', 'hadir')->count(),
            'sick' => $sessions->where('status', 'sakit')->count(),
            'permit' => $sessions->where('status', 'izin')->count(),
            'absent' => $sessions->where('status', 'alpha')->count(),
        ];

        $detail = [
            'id' => $extracurricular->id,
            'name' => $extracurricular->name,
            'description' => $extracurricular->description,
            'teacher_name' => optional($extracurricular->teacher)->name,
            'semester_name' => optional($extracurricular->semester)->name,
            'day_of_week' => $extracurricular->day_of_week,
            'start_time' => $extracurricular->start_time,
            'end_time' => $extracurricular->end_time,
            'room' => $extracurricular->room,
            'is_active' => (bool) $extracurricular->is_active,
            'attendance_summary' => $summary,
            'attendance_sessions' => $sessions,
        ];

        return response()->json([
            'success' => true,
            'data' => $detail,
        ]);
    }
}

