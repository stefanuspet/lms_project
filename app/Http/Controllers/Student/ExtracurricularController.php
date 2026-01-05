<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Extracurricular;
use App\Models\Student;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExtracurricularController extends Controller
{
    /**
     * Get current logged-in student model.
     */
    protected function getCurrentStudent(): Student
    {
        $user = Auth::user();

        if ($user->student) {
            return $user->student;
        }

        return Student::where('user_id', $user->id)->firstOrFail();
    }

    /**
     * Show list of extracurriculars joined by the student.
     */
    public function index(Request $request)
    {
        $student = $this->getCurrentStudent();

        $extracurriculars = Extracurricular::with(['teacher', 'semester'])
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
                    'is_active' => $extra->is_active,
                ];
            });

        return Inertia::render('Student/Extracurricular/Index', [
            'extracurriculars' => $extracurriculars,
        ]);
    }

    /**
     * Show detail of a specific extracurricular for the student.
     */
    public function show(Extracurricular $extracurricular)
    {
        $student = $this->getCurrentStudent();

        // Pastikan siswa terdaftar di ekskul ini
        $isJoined = $extracurricular->students()
            ->where('students.id', $student->id)
            ->exists();

        if (!$isJoined) {
            return redirect()
                ->route('student.extracurriculars.index')
                ->with('error', 'Anda belum terdaftar pada ekstrakurikuler ini.');
        }

        // Ambil sesi presensi untuk ekskul ini beserta status siswa
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
                    'date' => $session->date ? $session->date->format('d M Y') : null,
                    'session_type' => $session->session_type,
                    'status' => $attendance?->status ?? 'belum_absen',
                    'submitted_at' => $attendance?->submitted_at
                        ? $attendance->submitted_at->format('H:i')
                        : null,
                ];
            });

        // Ringkasan presensi sederhana
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
            'is_active' => $extracurricular->is_active,
            'attendance_sessions' => $sessions,
            'attendance_summary' => $summary,
        ];

        return Inertia::render('Student/Extracurricular/Show', [
            'extracurricular' => $detail,
        ]);
    }
}
