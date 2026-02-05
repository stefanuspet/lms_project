<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\TeacherSubject;
use App\Models\Extracurricular;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AttendanceController extends Controller
{
    /* =====================================================
     |  INDEX
     ===================================================== */
    public function index(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:date,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
            'filter_date_from' => 'nullable|date',
            'filter_date_to' => 'nullable|date|after_or_equal:filter_date_from',
            'filter_status' => 'nullable|string|in:active,expired',
        ]);

        // Set default values if not provided
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $filterDateFrom = $request->input('filter_date_from');
        $filterDateTo = $request->input('filter_date_to');
        $filterStatus = $request->input('filter_status');

        // Query attendance sessions
        $query = AttendanceSession::with(['semester'])
            ->withCount(['attendances']);

        // Apply search filters
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('qr_token', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply additional filters
        if ($filterDateFrom) {
            $query->whereDate('date', '>=', $filterDateFrom);
        }

        if ($filterDateTo) {
            $query->whereDate('date', '<=', $filterDateTo);
        }

        if ($filterStatus === 'active') {
            $query->where('expires_at', '>', now());
        } elseif ($filterStatus === 'expired') {
            $query->where('expires_at', '<=', now());
        }

        // Apply sorting
        $query->orderBy($sortBy, $sortOrder);

        // Execute paginated query
        $sessions = $query->paginate($perPage)->withQueryString();

        // Format data for frontend
        $formattedSessions = $sessions->map(function ($session) {
            if (empty($session->qr_token)) {
                $session->update(['qr_token' => $this->generateUniqueQrToken()]);
            }
            $isActive = Carbon::parse($session->expires_at)->isFuture();
            $presentCount = $session->attendances()->where('status', 'hadir')->count();
            $absentCount = $session->attendances()->whereIn('status', ['izin', 'sakit', 'alpha'])->count();
            $totalStudents = $presentCount + $absentCount;
            $attendanceRate = $totalStudents > 0 ? round(($presentCount / $totalStudents) * 100, 1) : 0;

            return [
                'id' => $session->id,
                'qr_token' => $session->qr_token,
                'title' => $session->title,
                'session_type' => $session->session_type,
                'description' => $session->description,
                'date' => Carbon::parse($session->date)->format('d-m-Y'),
                'start_time' => $session->start_time?->format('H:i'),
                'semester' => $session->semester ? $session->semester->name : '-',
                'expires_at' => Carbon::parse($session->expires_at)->format('d-m-Y H:i'),
                'is_active' => $isActive,
                'status' => $isActive ? 'Active' : 'Expired',
                'attendance_count' => $session->attendances_count,
                'present_count' => $presentCount,
                'absent_count' => $absentCount,
                'attendance_rate' => $attendanceRate,
                'created_at' => Carbon::parse($session->created_at)->format('d-m-Y H:i'),
            ];
        });

        // Return data to view
        return Inertia::render('Teacher/Attendance/Index', [
            'sessions' => $formattedSessions,
            'pagination' => [
                'total' => $sessions->total(),
                'per_page' => $sessions->perPage(),
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'from' => $sessions->firstItem(),
                'to' => $sessions->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'filter_date_from' => $filterDateFrom,
                'filter_date_to' => $filterDateTo,
                'filter_status' => $filterStatus,
            ],
        ]);
    }

    /* =====================================================
     |  SHOW
     ===================================================== */
    public function show(Request $request, AttendanceSession $session)
    {
        // Load relasi penting
        $session->load('semester');

        if (empty($session->qr_token)) {
            $session->update(['qr_token' => $this->generateUniqueQrToken()]);
        }

        // 🔹 Ambil filter kelas dari query
        $classId = $request->query('class_id');

        /**
         * =========================
         * STUDENTS QUERY
         * =========================
         */
        $studentsQuery = Student::with('classes')
            ->orderBy('name');

        if ($classId) {
            $studentsQuery->whereHas('classes', function ($q) use ($classId) {
                $q->where('classes.id', $classId);
            });
        }

        $students = $studentsQuery->get();

        /**
         * =========================
         * ATTENDANCES
         * =========================
         */
        $attendances = Attendance::where('attendance_sessions_id', $session->id)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        /**
         * =========================
         * MAP STUDENTS → FRONTEND
         * =========================
         */
        $studentAttendances = $students->map(function ($student) use ($attendances) {
            $attendance = $attendances->get($student->id);

            return [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'gender' => $student->gender ?? '-',
                'status' => $attendance?->status,
                'submitted_at' => $attendance?->submitted_at
                    ? Carbon::parse($attendance->submitted_at)->format('d-m-Y H:i:s')
                    : null,
                'attendance_id' => $attendance?->id,
                'classes' => $student->classes->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                ]),
            ];
        });

        /**
         * =========================
         * STATISTICS (BASED ON FILTER)
         * =========================
         */
        $stats = [
            'total' => $students->count(),
            'present' => $attendances->where('status', 'hadir')->count(),
            'sick' => $attendances->where('status', 'sakit')->count(),
            'excused' => $attendances->where('status', 'izin')->count(),
            'absent' => $attendances->where('status', 'alpha')->count(),
            'not_submitted' => $students->count() - $attendances->count(),
        ];

        /**
         * =========================
         * SESSION FORMAT
         * =========================
         */
        $formattedSession = [
            'id' => $session->id,
            'qr_token' => $session->qr_token,
            'session_type' => $session->session_type,
            'title' => $session->title,
            'description' => $session->description,
            'date' => Carbon::parse($session->date)->format('d-m-Y'),
            'start_time' => $session->start_time?->format('H:i'),
            'semester' => $session->semester ? [
                'id' => $session->semester->id,
                'name' => $session->semester->name,
            ] : null,
            'expires_at' => Carbon::parse($session->expires_at)->format('d-m-Y H:i:s'),
            'is_active' => Carbon::parse($session->expires_at)->isFuture(),
            'created_at' => Carbon::parse($session->created_at)->format('d-m-Y H:i:s'),
        ];

        return Inertia::render('Teacher/Attendance/Show', [
            'session' => $formattedSession,
            'students' => $studentAttendances,
            'stats' => $stats,
            'filters' => [
                'class_id' => $classId,
            ],
        ]);
    }



    /* =====================================================
     |  UPDATE ATTENDANCE
     ===================================================== */
    public function updateAttendance(Request $request, AttendanceSession $session)
    {
        // $this->authorizeSession($session);

        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'status' => 'required|in:hadir,izin,sakit,alpha',
        ]);

        Attendance::updateOrCreate(
            [
                'attendance_sessions_id' => $session->id,
                'student_id' => $data['student_id'],
            ],
            [
                'status' => $data['status'],
                'submitted_at' => now(),
            ]
        );

        return back()->with('success', 'Attendance updated');
    }

    /* =====================================================
     |  UPDATE SESSION
     ===================================================== */
    public function edit(AttendanceSession $session)
    {
        return Inertia::render('Teacher/Attendance/Edit', [
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'description' => $session->description,
                'date' => $session->date,
                'start_time' => $session->start_time,
                'duration_minutes' => $session->duration_minutes,
                'ends_at' => $session->ends_at,
                'expires_at' => $session->expires_at,
            ],
        ]);
    }

    /**
     * Update attendance session
     */
    public function update(Request $request, AttendanceSession $session)
    {

        // Validate input
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'duration_minutes' => 'required|integer|min:1|max:480',
        ]);

        DB::beginTransaction();
        try {
            // Parse date and time
            $dateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['start_time']);
            $endsAt = $dateTime->copy()->addMinutes($validated['duration_minutes']);

            // Update session
            $session->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'duration_minutes' => $validated['duration_minutes'],
                'ends_at' => $endsAt,
                'expires_at' => $endsAt->addHour(),
            ]);

            // Log activity
            $this->logActivity(
                auth()->id(),
                'UPDATE',
                'Updated attendance session: ' . $session->title . ' (ID: ' . $session->id . ')'
            );

            DB::commit();

            return redirect()->route('teacher.attendance.show', $session->id)
                ->with('success', 'Attendance session updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating attendance session: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update attendance session.');
        }
    }

    /* =====================================================
     |  DESTROY
     ===================================================== */
    public function destroy(Request $request, AttendanceSession $session)
    {
        DB::beginTransaction();
        try {
            // Delete all related attendance records
            Attendance::where('attendance_sessions_id', $session->id)->delete();

            // Delete the session
            $sessionTitle = $session->title;
            $session->delete();

            // Log activity
            $this->logActivity(
                auth()->id(),
                'DELETE',
                'Deleted attendance session: ' . $sessionTitle . ' (ID: ' . $session->id . ')'
            );

            DB::commit();

            return redirect()->route('teacher.attendance.index')
                ->with('success', 'Attendance session deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting attendance session: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete attendance session.');
        }
    }

    /* =====================================================
     |  HELPERS
     ===================================================== */
    // private function authorizeSession(AttendanceSession $session): void
    // {
    //     abort_if($session->teacher_id !== auth()->id(), 403);
    // }

    private function formatSession(AttendanceSession $s, bool $detail = false): array
    {
        return [
            'id' => $s->id,
            'qr_token' => $s->qr_token,
            'title' => $s->title,
            'session_type' => $s->session_type,
            'description' => $s->description,
            'date' => Carbon::parse($s->date)->format('d-m-Y'),
            'start_time' => $s->start_time,
            'semester' => $s->semester?->name ?? '-',
            'expires_at' => Carbon::parse($s->expires_at)->format('d-m-Y H:i'),
            'is_active' => Carbon::parse($s->expires_at)->isFuture(),
            'attendance_count' => $s->attendances_count ?? null,
            'present_count' => $s->present_count ?? null,
            'absent_count' => $s->absent_count ?? null,
            'created_at' => Carbon::parse($s->created_at)->format('d-m-Y H:i'),
        ];
    }

    private function attendanceStats($students, $attendances): array
    {
        return [
            'total' => $students->count(),
            'present' => $attendances->where('status', 'hadir')->count(),
            'sick' => $attendances->where('status', 'sakit')->count(),
            'excused' => $attendances->where('status', 'izin')->count(),
            'absent' => $attendances->where('status', 'alpha')->count(),
            'not_submitted' => $students->count() - $attendances->count(),
        ];
    }

    private function pagination($p)
    {
        return [
            'total' => $p->total(),
            'per_page' => $p->perPage(),
            'current_page' => $p->currentPage(),
            'last_page' => $p->lastPage(),
            'from' => $p->firstItem(),
            'to' => $p->lastItem(),
        ];
    }

    private function generateUniqueQrToken(): string
    {
        do {
            $token = Str::uuid() . '-' . bin2hex(random_bytes(6));
        } while (
            AttendanceSession::where('qr_token', $token)
            ->where('expires_at', '>', now())
            ->exists()
        );

        return $token;
    }

    public function create()
    {
        $semesters = Semester::where('end_date', '>=', now())
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Teacher/Attendance/Create', [
            'semesters' => $semesters,
        ]);
    }

    /**
     * Store a newly created attendance session in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'title' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'date' => 'required|date',
            'semester_id' => 'required|exists:semesters,id',
            'arrival_start_time' => 'required|date_format:H:i',
            'arrival_duration' => 'required|integer|min:5|max:300', // menit
            'departure_start_time' => 'required|date_format:H:i',
            'departure_duration' => 'required|integer|min:5|max:300', // menit
        ]);

        // Cegah duplikasi sesi presensi harian di tanggal & semester yang sama
        $existingArrival = AttendanceSession::where('date', $request->date)
            ->where('semester_id', $request->semester_id)
            ->where('session_type', 'arrival')
            ->exists();

        $existingDeparture = AttendanceSession::where('date', $request->date)
            ->where('semester_id', $request->semester_id)
            ->where('session_type', 'departure')
            ->exists();

        if ($existingArrival || $existingDeparture) {
            return redirect()->back()
                ->withErrors([
                    'error' => 'Sesi presensi berangkat dan/atau pulang untuk tanggal dan semester ini sudah ada. Tidak bisa membuat dua kali dalam satu hari.'
                ])
                ->withInput();
        }

        DB::beginTransaction();

        try {
            // Siapkan judul & deskripsi default jika tidak diisi
            $semester = Semester::find($request->semester_id);
            $formattedDate = Carbon::parse($request->date)->format('d-m-Y');
            $baseTitle = $request->title ?: 'Presensi Harian ' . $formattedDate;
            $description = $request->description
                ?: 'Presensi harian tanggal ' . $formattedDate . ($semester ? ' - ' . $semester->name : '');

            $payloads = [
                [
                    'session_type' => 'arrival',
                    'title' => $baseTitle . ' - Berangkat',
                    'start_time' => $request->arrival_start_time,
                    'duration' => (int) $request->arrival_duration,
                ],
                [
                    'session_type' => 'departure',
                    'title' => $baseTitle . ' - Pulang',
                    'start_time' => $request->departure_start_time,
                    'duration' => (int) $request->departure_duration,
                ],
            ];

            foreach ($payloads as $payload) {
                $startDateTime = Carbon::parse($request->date . ' ' . $payload['start_time']);
                $expiresAt = (clone $startDateTime)->addMinutes($payload['duration']);

                AttendanceSession::create([
                    'qr_token' => $this->generateUniqueQrToken(),
                    'session_type' => $payload['session_type'],
                    'title' => $payload['title'],
                    'description' => $description,
                    'date' => $request->date,
                    'start_time' => $payload['start_time'],
                    'semester_id' => $request->semester_id,
                    'expires_at' => $expiresAt,
                ]);
            }

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'create', 'Created arrival & departure attendance sessions with QR.');

            return redirect()->route('teacher.attendance.index')
                ->with('success', 'Dua sesi absensi (berangkat & pulang) berhasil dibuat dengan QR masing-masing.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating attendance session: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to create attendance session: ' . $e->getMessage()])
                ->withInput();
        }
    }

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


    public function reports(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'semester_id' => 'nullable|exists:semesters,id',
            'student_id' => 'nullable|exists:students,id',
            'class_id' => 'nullable|exists:classes,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        // Get filter options
        $semesters = Semester::orderBy('start_date', 'desc')->get();
        $classes = Classroom::orderBy('name')->get();

        $studentsQuery = Student::orderBy('name');
        if ($request->class_id) {
            $studentsQuery->filterByClass($request->class_id);
        }
        $students = $studentsQuery->get();

        // Apply filters
        $query = AttendanceSession::with(['semester']);

        if ($request->semester_id) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->date_from) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        // Get attendance sessions
        $sessions = $query->orderBy('date', 'desc')->get();

        // Prepare attendance data
        $attendanceData = [];
        $sessionDates = [];

        if ($request->student_id) {
            // Report for a specific student
            $student = Student::findOrFail($request->student_id);

            $attendances = Attendance::whereIn('attendance_sessions_id', $sessions->pluck('id'))
                ->where('student_id', $student->id)
                ->with('session')
                ->get();

            $studentAttendances = [];
            $totalSessions = $sessions->count();
            $presentCount = 0;
            $sickCount = 0;
            $excusedCount = 0;
            $absentCount = 0;

            foreach ($sessions as $session) {
                $attendance = $attendances->where('attendance_sessions_id', $session->id)->first();
                $status = $attendance ? $attendance->status : 'not_submitted';

                if ($status === 'hadir') $presentCount++;
                else if ($status === 'sakit') $sickCount++;
                else if ($status === 'izin') $excusedCount++;
                else if ($status === 'alpha') $absentCount++;

                $sessionDate = Carbon::parse($session->date)->format('d-m-Y');
                if (!in_array($sessionDate, $sessionDates)) {
                    $sessionDates[] = $sessionDate;
                }

                $studentAttendances[] = [
                    'date' => $sessionDate,
                    'title' => $session->title,
                    'description' => $session->description,
                    'status' => $status,
                    'submitted_at' => $attendance && $attendance->submitted_at ?
                        Carbon::parse($attendance->submitted_at)->format('d-m-Y H:i:s') : '-',
                ];
            }

            $attendanceRate = $totalSessions > 0 ? round(($presentCount / $totalSessions) * 100, 1) : 0;

            $attendanceData = [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                ],
                'attendances' => $studentAttendances,
                'stats' => [
                    'total' => $totalSessions,
                    'present' => $presentCount,
                    'sick' => $sickCount,
                    'excused' => $excusedCount,
                    'absent' => $absentCount,
                    'not_submitted' => $totalSessions - ($presentCount + $sickCount + $excusedCount + $absentCount),
                    'attendance_rate' => $attendanceRate,
                ],
            ];
        } else if ($request->semester_id) {
            // Report for all students in a semester
            $studentStats = [];

            foreach ($students as $student) {
                $attendances = Attendance::whereIn('attendance_sessions_id', $sessions->pluck('id'))
                    ->where('student_id', $student->id)
                    ->get();

                $totalSessions = $sessions->count();
                $presentCount = $attendances->where('status', 'hadir')->count();
                $sickCount = $attendances->where('status', 'sakit')->count();
                $excusedCount = $attendances->where('status', 'izin')->count();
                $absentCount = $attendances->where('status', 'alpha')->count();
                $notSubmittedCount = $totalSessions - $attendances->count();

                $attendanceRate = $totalSessions > 0 ? round(($presentCount / $totalSessions) * 100, 1) : 0;

                $studentStats[] = [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'nisn' => $student->nisn,
                    ],
                    'stats' => [
                        'total' => $totalSessions,
                        'present' => $presentCount,
                        'sick' => $sickCount,
                        'excused' => $excusedCount,
                        'absent' => $absentCount,
                        'not_submitted' => $notSubmittedCount,
                        'attendance_rate' => $attendanceRate,
                    ],
                ];
            }

            // Get session dates for column headers
            foreach ($sessions as $session) {
                $sessionDate = Carbon::parse($session->date)->format('d-m-Y');
                if (!in_array($sessionDate, $sessionDates)) {
                    $sessionDates[] = $sessionDate;
                }
            }

            $attendanceData = [
                'semester' => Semester::find($request->semester_id),
                'students' => $studentStats,
                'session_count' => $sessions->count(),
            ];
        }

        return Inertia::render('Teacher/Attendance/Report', [
            'filters' => [
                'semester_id' => $request->semester_id,
                'student_id' => $request->student_id,
                'class_id' => $request->class_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'filterOptions' => [
                'semesters' => $semesters,
                'students' => $students,
                'classes' => $classes,
            ],
            'attendanceData' => $attendanceData ?? [],
            'sessionDates' => $sessionDates ?? [],
            'hasData' => !empty($attendanceData ?? []),
        ]);
    }
    public function exportReport(Request $request)
    {
        $validated = $request->validate([
            'semester_id' => 'nullable|exists:semesters,id',
            'student_id' => 'nullable|exists:students,id',
            'class_id' => 'nullable|exists:classes,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $query = AttendanceSession::query();

        if ($request->semester_id) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->date_from) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $sessions = $query->orderBy('date')->get();

        if ($sessions->isEmpty()) {
            return redirect()->back()->with('error', 'Tidak ada sesi absensi pada filter yang dipilih.');
        }

        // Jika ada student_id → export detail per sesi untuk siswa tersebut
        if ($request->student_id) {
            $student = Student::findOrFail($request->student_id);
            $attendances = Attendance::whereIn('attendance_sessions_id', $sessions->pluck('id'))
                ->where('student_id', $student->id)
                ->get()
                ->keyBy('attendance_sessions_id');

            $filename = 'laporan_presensi_siswa_' . $student->nisn . '_' . now()->format('Ymd_His') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function () use ($sessions, $attendances, $student) {
                $output = fopen('php://output', 'w');

                // BOM untuk UTF-8
                fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

                $delimiter = ';';

                // Header
                fputcsv($output, ['NISN', 'Nama', 'Tanggal', 'Judul', 'Status', 'Waktu Pengisian'], $delimiter);

                foreach ($sessions as $session) {
                    $attendance = $attendances->get($session->id);
                    $status = $attendance ? $attendance->status : 'not_submitted';
                    $submittedAt = $attendance && $attendance->submitted_at
                        ? Carbon::parse($attendance->submitted_at)->format('d-m-Y H:i:s')
                        : '-';

                    fputcsv($output, [
                        $student->nisn,
                        $student->name,
                        Carbon::parse($session->date)->format('d-m-Y'),
                        $session->title,
                        $status,
                        $submittedAt,
                    ], $delimiter);
                }

                fclose($output);
            };

            return response()->streamDownload($callback, $filename, $headers);
        }

        // Jika semester_id (tanpa student_id) → export rekap per siswa di semester (opsional per kelas)
        if ($request->semester_id) {
            $semester = Semester::findOrFail($request->semester_id);

            // Untuk kesederhanaan, gunakan semua siswa di sistem (atau hanya satu kelas jika dipilih)
            $studentsQuery = Student::orderBy('name');
            if ($request->class_id) {
                $studentsQuery->filterByClass($request->class_id);
            }
            $students = $studentsQuery->get();

            $filename = 'rekap_presensi_semester_' . $semester->id . '_' . now()->format('Ymd_His') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function () use ($students, $sessions, $semester) {
                $output = fopen('php://output', 'w');

                // BOM UTF-8
                fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

                $delimiter = ';';

                // Header kolom
                fputcsv($output, [
                    'NISN',
                    'Nama',
                    'Total Sesi',
                    'Hadir',
                    'Sakit',
                    'Izin',
                    'Alpha',
                    'Belum Mengisi',
                    'Persentase Hadir (%)',
                ], $delimiter);

                foreach ($students as $student) {
                    $attendances = Attendance::whereIn('attendance_sessions_id', $sessions->pluck('id'))
                        ->where('student_id', $student->id)
                        ->get();

                    $totalSessions = $sessions->count();
                    $presentCount = $attendances->where('status', 'hadir')->count();
                    $sickCount = $attendances->where('status', 'sakit')->count();
                    $excusedCount = $attendances->where('status', 'izin')->count();
                    $absentCount = $attendances->where('status', 'alpha')->count();
                    $notSubmittedCount = $totalSessions - $attendances->count();

                    $attendanceRate = $totalSessions > 0
                        ? round(($presentCount / $totalSessions) * 100, 1)
                        : 0;

                    fputcsv($output, [
                        $student->nisn,
                        $student->name,
                        $totalSessions,
                        $presentCount,
                        $sickCount,
                        $excusedCount,
                        $absentCount,
                        $notSubmittedCount,
                        $attendanceRate,
                    ], $delimiter);
                }

                fclose($output);
            };

            return response()->streamDownload($callback, $filename, $headers);
        }

        return redirect()->back()->with('error', 'Pilih minimal semester atau siswa sebelum melakukan export.');
    }

    public function extendSession(Request $request, AttendanceSession $session)
    {
        // Validate input
        $validated = $request->validate([
            'minutes' => 'required|integer|min:5|max:1440', // Durasi dalam menit
        ]);

        DB::beginTransaction();

        try {
            // Pastikan minutes adalah integer
            $minutes = (int) $request->minutes;

            // Calculate new expiration time
            $newExpiresAt = now()->addMinutes($minutes);

            // Update session
            $session->update([
                'expires_at' => $newExpiresAt,
            ]);

            DB::commit();

            // Log activity
            $this->logActivity(
                auth()->id(),
                'extend',
                "Extended attendance session QR for {$minutes} minutes"
            );

            return redirect()->back()->with('success', 'Attendance session extended successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error extending attendance session: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to extend attendance session: ' . $e->getMessage()]);
        }
    }

    public function closeSession(AttendanceSession $session)
    {
        DB::beginTransaction();

        try {
            // Set expiration time to now
            $session->update([
                'expires_at' => now(),
            ]);

            DB::commit();

            // Log activity
            $this->logActivity(
                auth()->id(),
                'close',
                "Closed attendance session QR"
            );

            return redirect()->back()->with('success', 'Attendance session closed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error closing attendance session: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to close attendance session: ' . $e->getMessage()]);
        }
    }

    public function deleteAttendance(Request $request, AttendanceSession $session, Attendance $attendance)
    {
        try {
            // Verify that the attendance belongs to this session
            if ($attendance->attendance_sessions_id !== $session->id) {
                return redirect()->back()->with('error', 'Attendance record not found in this session.');
            }

            // Delete the attendance record
            $attendance->delete();

            // Log activity
            $this->logActivity(
                auth()->id(),
                'delete_attendance',
                "Deleted attendance for student {$attendance->student->name} in session {$session->title}"
            );

            return redirect()->back()->with('success', 'Attendance record deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting attendance: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete attendance record.');
        }
    }
}
