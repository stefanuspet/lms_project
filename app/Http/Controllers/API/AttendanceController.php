<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Student;
use App\Models\Semester;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{
    /**
     * Submit absensi dengan QR yang dipindai dari web.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'qr_token' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Log request data for debugging
        Log::debug('Attendance submission attempt', [
            'qr_token' => $request->qr_token,
            'user_id' => $request->user()->id ?? 'null',
            'lat' => $request->latitude,
            'lng' => $request->longitude,
        ]);

        // Ambil user yang sedang login
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        Log::debug('Student found', ['student_id' => $student->id]);

        // Cari sesi absensi dengan QR token yang diberikan
        $session = AttendanceSession::where('qr_token', $request->qr_token)
            ->active()
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'QR tidak valid atau sesi absensi sudah berakhir'
            ], 404);
        }

        Log::debug('Session found', [
            'session_id' => $session->id,
            'qr_token' => $session->qr_token,
            'expires_at' => $session->expires_at
        ]);

        // Cek apakah siswa sudah absen di sesi ini
        $existingAttendance = Attendance::where('attendance_sessions_id', $session->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah melakukan absensi untuk sesi ini',
                'data' => [
                    'session' => [
                        'id' => $session->id,
                        'title' => $session->title,
                        'date' => $session->date->format('Y-m-d'),
                    ],
                    'attendance' => [
                        'status' => $existingAttendance->status,
                        'submitted_at' => $existingAttendance->submitted_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ], 409);
        }

        // Karena tidak ada kolom class_id di attendance_sessions, kita akan memeriksa
        // jika siswa terdaftar pada semester yang sama dengan sesi absensi
        $studentInSemester = $student->semesters()
            ->where('semesters.id', $session->semester_id)
            ->exists();

        Log::debug('Checking enrollment in semester', [
            'semester_id' => $session->semester_id,
            'is_enrolled' => $studentInSemester ? 'yes' : 'no'
        ]);

        if (!$studentInSemester) {
            return response()->json([
                'success' => false,
            'message' => 'Anda tidak terdaftar pada semester saat ini'
        ], 403);
    }

        // Validasi lokasi
        if (!$this->isWithinRadius($request->latitude, $request->longitude)) {
            return response()->json([
                'success' => false,
                'message' => 'Lokasi Anda berada di luar area yang diizinkan untuk absensi'
            ], 403);
        }

        // Buat record absensi baru
        $attendance = new Attendance([
            'attendance_sessions_id' => $session->id,
            'student_id' => $student->id,
            'status' => 'hadir', // Default adalah hadir
            'submitted_at' => now(),
        ]);

        $attendance->save();

        Log::debug('Attendance saved', ['attendance_id' => $attendance->id]);

        // Data sesi
        $sessionData = [
            'id' => $session->id,
            'title' => $session->title ?? 'Sesi Absensi',
            'date' => $session->date->format('Y-m-d'),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Absensi berhasil dicatat',
            'data' => [
                'session' => $sessionData,
                'attendance' => [
                    'id' => $attendance->id,
                    'status' => $attendance->status,
                    'submitted_at' => $attendance->submitted_at->format('Y-m-d H:i:s'),
                ]
            ]
        ], 201);
    }

    /**
     * Melihat riwayat absensi siswa
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function history(Request $request)
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

        // Filter berdasarkan tanggal jika diberikan
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Attendance::with(['session' => function ($q) {
            $q->with(['semester']);
        }])
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc');

        if ($startDate) {
            $query->whereHas('session', function ($q) use ($startDate) {
                $q->where('date', '>=', $startDate);
            });
        }

        if ($endDate) {
            $query->whereHas('session', function ($q) use ($endDate) {
                $q->where('date', '<=', $endDate);
            });
        }

        $attendances = $query->paginate(15);

        // Format data untuk response
        $formattedAttendances = $attendances->map(function ($attendance) {
            $sessionData = null;
            $semesterData = null;

            if ($attendance->session) {
                $sessionData = [
                    'id' => $attendance->session->id,
                    'title' => $attendance->session->title ?? 'Sesi Absensi',
                    'date' => $attendance->session->date->format('Y-m-d'),
                ];

                if ($attendance->session->semester) {
                    $semesterData = [
                        'id' => $attendance->session->semester->id,
                        'name' => $attendance->session->semester->name
                    ];
                }
            }

            return [
                'id' => $attendance->id,
                'status' => $attendance->status,
                'submitted_at' => $attendance->submitted_at ? $attendance->submitted_at->format('Y-m-d H:i:s') : null,
                'session' => $sessionData,
                'semester' => $semesterData
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedAttendances,
            'pagination' => [
                'total' => $attendances->total(),
                'per_page' => $attendances->perPage(),
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'from' => $attendances->firstItem(),
                'to' => $attendances->lastItem()
            ]
        ]);
    }

    /**
     * Melihat riwayat absensi siswa berdasarkan semester
     *
     * @param Request $request
     * @param int $semesterId
     * @return \Illuminate\Http\JsonResponse
     */
    public function historySemester(Request $request, $semesterId)
    {
        // Validasi semester ID
        $semester = Semester::find($semesterId);
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
        $studentInSemester = $student->semesters()->where('semesters.id', $semesterId)->exists();
        if (!$studentInSemester) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terdaftar pada semester ini'
            ], 403);
        }

        // Ambil semua absensi untuk semester ini
        $attendances = Attendance::with(['session'])
            ->whereHas('session', function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            })
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Hitung statistik
        $totalSessions = $attendances->total();
        $presentCount = Attendance::whereHas('session', function ($q) use ($semesterId) {
            $q->where('semester_id', $semesterId);
        })
            ->where('student_id', $student->id)
            ->where('status', 'hadir')
            ->count();

        $sickCount = Attendance::whereHas('session', function ($q) use ($semesterId) {
            $q->where('semester_id', $semesterId);
        })
            ->where('student_id', $student->id)
            ->where('status', 'sakit')
            ->count();

        $excusedCount = Attendance::whereHas('session', function ($q) use ($semesterId) {
            $q->where('semester_id', $semesterId);
        })
            ->where('student_id', $student->id)
            ->where('status', 'izin')
            ->count();

        $absentCount = Attendance::whereHas('session', function ($q) use ($semesterId) {
            $q->where('semester_id', $semesterId);
        })
            ->where('student_id', $student->id)
            ->where('status', 'alpha')
            ->count();

        // Format data untuk response
        $formattedAttendances = $attendances->map(function ($attendance) {
            $sessionData = null;

            if ($attendance->session) {
                $sessionData = [
                    'id' => $attendance->session->id,
                    'title' => $attendance->session->title ?? 'Sesi Absensi',
                    'date' => $attendance->session->date->format('Y-m-d'),
                ];
            }

            return [
                'id' => $attendance->id,
                'status' => $attendance->status,
                'submitted_at' => $attendance->submitted_at ? $attendance->submitted_at->format('Y-m-d H:i:s') : null,
                'session' => $sessionData
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'semester' => [
                    'id' => $semester->id,
                    'name' => $semester->name,
                    'start_date' => $semester->start_date,
                    'end_date' => $semester->end_date
                ],
                'statistics' => [
                    'total_sessions' => $totalSessions,
                    'present' => $presentCount,
                    'sick' => $sickCount,
                    'excused' => $excusedCount,
                    'absent' => $absentCount,
                    'attendance_rate' => $totalSessions > 0 ? round(($presentCount / $totalSessions) * 100, 2) : 0
                ],
                'attendances' => $formattedAttendances,
                'pagination' => [
                    'total' => $attendances->total(),
                    'per_page' => $attendances->perPage(),
                    'current_page' => $attendances->currentPage(),
                    'last_page' => $attendances->lastPage(),
                    'from' => $attendances->firstItem(),
                    'to' => $attendances->lastItem()
                ]
            ]
        ]);
    }

    private function isWithinRadius(float $latitude, float $longitude, int $radiusMeters = 150): bool
    {
        $targetLat = -7.780518240646772;
        $targetLng = 110.41577003973752;

        $earthRadius = 6371000; // meters
        $latFrom = deg2rad($latitude);
        $lonFrom = deg2rad($longitude);
        $latTo = deg2rad($targetLat);
        $lonTo = deg2rad($targetLng);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
        $distance = $angle * $earthRadius;

        return $distance <= $radiusMeters;
    }
}
