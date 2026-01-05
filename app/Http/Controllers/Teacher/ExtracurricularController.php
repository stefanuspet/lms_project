<?php

namespace App\Http\Controllers\Teacher;

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
    protected function getCurrentTeacher()
    {
        $user = Auth::user();
        return $user->teacher ?? \App\Models\Teacher::where('user_id', $user->id)->firstOrFail();
    }

    public function index(Request $request)
    {
        $teacher = $this->getCurrentTeacher();

        $items = Extracurricular::withCount('students')
            ->with('semester')
            ->where('teacher_id', $teacher->id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function (Extracurricular $extra) {
                return [
                    'id' => $extra->id,
                    'name' => $extra->name,
                    'description' => $extra->description,
                    'day_of_week' => $extra->day_of_week,
                    'start_time' => $extra->start_time,
                    'end_time' => $extra->end_time,
                    'room' => $extra->room,
                    'semester_name' => optional($extra->semester)->name,
                    'students_count' => $extra->students_count,
                    'is_active' => $extra->is_active,
                ];
            });

        return Inertia::render('Teacher/Extracurricular/Index', [
            'extracurriculars' => $items,
        ]);
    }

    public function show(Extracurricular $extracurricular)
    {
        $teacher = $this->getCurrentTeacher();

        if ($extracurricular->teacher_id !== $teacher->id) {
            return redirect()
                ->route('teacher.extracurriculars.index')
                ->with('error', 'Anda tidak memiliki akses ke ekstrakurikuler ini.');
        }

        $extracurricular->load(['semester', 'students.user']);

        // Sesi presensi khusus ekskul ini
        $sessionsCollection = AttendanceSession::where('extracurricular_id', $extracurricular->id)
            ->orderByDesc('date')
            ->orderByDesc('start_time')
            ->get();

        $sessions = $sessionsCollection->map(function (AttendanceSession $session) {
            $isActive = $session->expires_at && \Carbon\Carbon::parse($session->expires_at)->isFuture();

            return [
                'id' => $session->id,
                'title' => $session->title,
                'session_type' => $session->session_type,
                'date' => $session->date ? $session->date->format('d M Y') : null,
                'start_time' => $session->start_time?->format('H:i'),
                'expires_at' => $session->expires_at
                    ? \Carbon\Carbon::parse($session->expires_at)->format('d M Y H:i')
                    : null,
                'is_active' => $isActive,
            ];
        });

        // Rekap presensi per siswa untuk ekskul ini
        $sessionIds = $sessionsCollection->pluck('id');
        $attendanceMap = [];

        if ($sessionIds->isNotEmpty()) {
            $attendances = Attendance::whereIn('attendance_sessions_id', $sessionIds)->get();

            foreach ($attendances as $att) {
                $attendanceMap[$att->student_id][$att->attendance_sessions_id] = $att->status;
            }
        }

        $totalSessions = $sessionsCollection->count();

        $students = $extracurricular->students->map(function (Student $student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'email' => optional($student->user)->email,
            ];
        });

        $attendanceRecap = $extracurricular->students->map(function (Student $student) use ($totalSessions, $sessionsCollection, $attendanceMap) {
            $present = 0;
            $sick = 0;
            $permit = 0;
            $absent = 0;

            if ($totalSessions > 0) {
                foreach ($sessionsCollection as $session) {
                    $status = $attendanceMap[$student->id][$session->id] ?? 'alpha';

                    switch ($status) {
                        case 'hadir':
                            $present++;
                            break;
                        case 'sakit':
                            $sick++;
                            break;
                        case 'izin':
                            $permit++;
                            break;
                        case 'alpha':
                        default:
                            $absent++;
                            break;
                    }
                }
            }

            $rate = $totalSessions > 0
                ? round(($present / $totalSessions) * 100)
                : 0;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'present' => $present,
                'sick' => $sick,
                'permit' => $permit,
                'absent' => $absent,
                'total_sessions' => $totalSessions,
                'attendance_rate' => $totalSessions > 0 ? $rate . '%' : 'N/A',
            ];
        });

        $detail = [
            'id' => $extracurricular->id,
            'name' => $extracurricular->name,
            'description' => $extracurricular->description,
            'day_of_week' => $extracurricular->day_of_week,
            'start_time' => $extracurricular->start_time,
            'end_time' => $extracurricular->end_time,
            'room' => $extracurricular->room,
            'semester_name' => optional($extracurricular->semester)->name,
            'students' => $students,
            'sessions' => $sessions,
            'attendance_recap' => $attendanceRecap,
        ];

        return Inertia::render('Teacher/Extracurricular/Show', [
            'extracurricular' => $detail,
        ]);
    }

    /**
     * Export attendance recap for this extracurricular as CSV.
     */
    public function exportAttendance(Extracurricular $extracurricular)
    {
        $teacher = $this->getCurrentTeacher();

        if ($extracurricular->teacher_id !== $teacher->id) {
            return redirect()
                ->route('teacher.extracurriculars.index')
                ->with('error', 'Anda tidak memiliki akses ke ekstrakurikuler ini.');
        }

        $extracurricular->load('students');

        $sessions = AttendanceSession::where('extracurricular_id', $extracurricular->id)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        $sessionIds = $sessions->pluck('id');

        $attendanceMap = [];
        if ($sessionIds->isNotEmpty()) {
            $attendances = Attendance::whereIn('attendance_sessions_id', $sessionIds)->get();

            foreach ($attendances as $att) {
                $attendanceMap[$att->student_id][$att->attendance_sessions_id] = $att->status;
            }
        }

        $totalSessions = $sessions->count();

        $rows = [];
        foreach ($extracurricular->students as $student) {
            $present = 0;
            $sick = 0;
            $permit = 0;
            $absent = 0;

            if ($totalSessions > 0) {
                foreach ($sessions as $session) {
                    $status = $attendanceMap[$student->id][$session->id] ?? 'alpha';
                    switch ($status) {
                        case 'hadir':
                            $present++;
                            break;
                        case 'sakit':
                            $sick++;
                            break;
                        case 'izin':
                            $permit++;
                            break;
                        case 'alpha':
                        default:
                            $absent++;
                            break;
                    }
                }
            }

            $rate = $totalSessions > 0
                ? round(($present / $totalSessions) * 100)
                : 0;

            $rows[] = [
                'nisn' => $student->nisn,
                'name' => $student->name,
                'present' => $present,
                'sick' => $sick,
                'permit' => $permit,
                'absent' => $absent,
                'total_sessions' => $totalSessions,
                'attendance_rate' => $totalSessions > 0 ? $rate . '%' : 'N/A',
            ];
        }

        $filename = 'presensi_ekskul_' . ($extracurricular->id) . '_' . date('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($rows) {
            $output = fopen('php://output', 'w');

            // BOM UTF-8 untuk Excel
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($output, [
                'NISN',
                'Nama',
                'Hadir',
                'Sakit',
                'Izin',
                'Alpha',
                'Total Pertemuan',
                '% Hadir',
            ], ';');

            foreach ($rows as $row) {
                fputcsv($output, [
                    $row['nisn'],
                    $row['name'],
                    $row['present'],
                    $row['sick'],
                    $row['permit'],
                    $row['absent'],
                    $row['total_sessions'],
                    $row['attendance_rate'],
                ], ';');
            }

            fclose($output);
        };

        return response()->stream($callback, 200, $headers);
    }
}
