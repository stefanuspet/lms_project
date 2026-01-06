<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
    use Inertia\Inertia;
    use Illuminate\Support\Str;
    use App\Models\Extracurricular;

class AttendanceController extends Controller
{
    /**
     * Display a listing of all attendance sessions.
     */
    public function index(Request $request)
    {
        try {
            // Validate request
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
            $sortBy = $request->input('sort_by', 'date');
            $sortOrder = $request->input('sort_order', 'desc');
            $filterDateFrom = $request->input('filter_date_from');
            $filterDateTo = $request->input('filter_date_to');
            $filterStatus = $request->input('filter_status');

            // Get all attendance sessions (no filters for teacher role)
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

            // Return view with data
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
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to load attendance sessions: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display daily view of attendances.
     */
    public function dailyView(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'date' => 'nullable|date',
                'session_id' => 'nullable|exists:attendance_sessions,id',
            ]);

            // Get today's date if not provided
            $date = $request->input('date', Carbon::today()->format('Y-m-d'));

            // Get sessions for the date
            $sessionsQuery = AttendanceSession::whereDate('date', $date)
                ->with(['semester'])
                ->withCount(['attendances']);

            // Get selected session or first session for the day
            $selectedSessionId = $request->input('session_id');
            $sessions = $sessionsQuery->get();

            if ($selectedSessionId) {
                $selectedSession = $sessions->firstWhere('id', $selectedSessionId);
            } else {
                $selectedSession = $sessions->first();
                $selectedSessionId = $selectedSession?->id;
            }

            // Get attendance data for the selected session
            $attendanceData = null;
            $students = collect([]);
            $stats = [
                'total' => 0,
                'present' => 0,
                'sick' => 0,
                'excused' => 0,
                'absent' => 0,
                'not_submitted' => 0,
            ];

            if ($selectedSession) {
                // Get all students
                $allStudents = Student::orderBy('name')->get();

                // Get attendances for this session
                $attendances = Attendance::where('attendance_sessions_id', $selectedSession->id)
                    ->with('student')
                    ->get();

                // Prepare student attendance data
                $students = $allStudents->map(function ($student) use ($attendances) {
                    $attendance = $attendances->where('student_id', $student->id)->first();

                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'nisn' => $student->nisn,
                        'status' => $attendance ? $attendance->status : null,
                        'submitted_at' => $attendance && $attendance->submitted_at ?
                            Carbon::parse($attendance->submitted_at)->format('d-m-Y H:i:s') : null,
                        'attendance_id' => $attendance ? $attendance->id : null,
                    ];
                });

                // Count statistics
                $stats = [
                    'total' => $allStudents->count(),
                    'present' => $attendances->where('status', 'hadir')->count(),
                    'sick' => $attendances->where('status', 'sakit')->count(),
                    'excused' => $attendances->where('status', 'izin')->count(),
                    'absent' => $attendances->where('status', 'alpha')->count(),
                    'not_submitted' => $allStudents->count() - $attendances->count(),
                ];

                // Format session data
                $attendanceData = [
                    'id' => $selectedSession->id,
                    'qr_token' => $selectedSession->qr_token,
                    'title' => $selectedSession->title,
                    'session_type' => $selectedSession->session_type,
                    'description' => $selectedSession->description,
                    'date' => Carbon::parse($selectedSession->date)->format('d-m-Y'),
                    'start_time' => $selectedSession->start_time?->format('H:i'),
                    'semester' => $selectedSession->semester ? $selectedSession->semester->name : '-',
                    'expires_at' => Carbon::parse($selectedSession->expires_at)->format('d-m-Y H:i:s'),
                    'is_active' => Carbon::parse($selectedSession->expires_at)->isFuture(),
                ];
            }

            // Format sessions for dropdown
            $formattedSessions = $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'qr_token' => $session->qr_token,
                    'session_type' => $session->session_type,
                    'start_time' => $session->start_time?->format('H:i'),
                ];
            });

            // Return view with data
            return Inertia::render('Teacher/Attendance/Daily', [
                'date' => $date,
                'sessions' => $formattedSessions,
                'selectedSessionId' => $selectedSessionId,
                'attendanceData' => $attendanceData,
                'students' => $students,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to load daily attendance: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display active attendance sessions.
     */
    public function activeSessions(Request $request)
    {
        try {
            // Get active sessions
            $activeSessions = AttendanceSession::active()
                ->with(['semester'])
                ->withCount(['attendances'])
                ->orderBy('expires_at')
                ->get();

            // Format data for frontend
        $formattedSessions = $activeSessions->map(function ($session) {
            if (empty($session->qr_token)) {
                $session->update(['qr_token' => $this->generateUniqueQrToken()]);
            }
            $presentCount = $session->attendances()->where('status', 'hadir')->count();
            $absentCount = $session->attendances()->whereIn('status', ['izin', 'sakit', 'alpha'])->count();
            $totalStudents = $presentCount + $absentCount;
            $attendanceRate = $totalStudents > 0 ? round(($presentCount / $totalStudents) * 100, 1) : 0;

                // Calculate remaining time
                $expiresAt = Carbon::parse($session->expires_at);
                $now = Carbon::now();
                $diffInMinutes = $now->diffInMinutes($expiresAt, false);

                $remainingTime = '';
                if ($diffInMinutes > 60) {
                    $hours = floor($diffInMinutes / 60);
                    $minutes = $diffInMinutes % 60;
                    $remainingTime = "{$hours}h {$minutes}m";
                } else {
                    $remainingTime = "{$diffInMinutes}m";
                }

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
                    'remaining_time' => $remainingTime,
                    'attendance_count' => $session->attendances_count,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'attendance_rate' => $attendanceRate,
                ];
            });

            // Return view with data
            return Inertia::render('Teacher/Attendance/ActiveSessions', [
                'activeSessions' => $formattedSessions,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Failed to load active sessions: ' . $e->getMessage()
            ]);
        }
    }

    private function generateUniqueQrToken()
    {
        do {
            $token = Str::uuid()->toString() . '-' . bin2hex(random_bytes(6));
            $exists = AttendanceSession::where('qr_token', $token)
                ->where('expires_at', '>', now())
                ->exists();
        } while ($exists);

        return $token;
    }

    /**
     * Create a new attendance session for an extracurricular activity.
     */
    public function createExtracurricularSession(Request $request, Extracurricular $extracurricular)
    {
        $request->validate([
            'session_type' => 'required|string|in:arrival,departure,ekskul_berangkat,ekskul_pulang',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'duration_minutes' => 'required|integer|min:5|max:240',
        ]);

        $expiresAt = now()->addMinutes($request->input('duration_minutes'));

        // Map nilai khusus ekskul ke enum yang disimpan di database
        $rawType = $request->input('session_type');
        $sessionType = $rawType;

        if ($rawType === 'ekskul_berangkat') {
            $sessionType = 'arrival';
        } elseif ($rawType === 'ekskul_pulang') {
            $sessionType = 'departure';
        }

        // Cegah duplikasi sesi ekskul dengan tipe yang sama di hari yang sama
        $today = now()->toDateString();
        $alreadyExists = AttendanceSession::where('extracurricular_id', $extracurricular->id)
            ->where('date', $today)
            ->where('session_type', $sessionType)
            ->exists();

        if ($alreadyExists) {
            return redirect()
                ->route('teacher.extracurriculars.show', $extracurricular->id)
                ->with('error', 'Sesi presensi ' . ($sessionType === 'arrival' ? 'berangkat' : 'pulang') . ' untuk hari ini sudah dibuat.');
        }

        $session = AttendanceSession::create([
            'qr_token' => $this->generateUniqueQrToken(),
            'session_type' => $sessionType,
            'title' => $request->input('title') ?: $extracurricular->name,
            'description' => $request->input('description'),
            'date' => now()->toDateString(),
            'start_time' => now(),
            'semester_id' => $extracurricular->semester_id,
            'extracurricular_id' => $extracurricular->id,
            'expires_at' => $expiresAt,
        ]);

        return redirect()
            ->route('teacher.extracurriculars.show', $extracurricular->id)
            ->with('success', 'Sesi presensi ekskul berhasil dibuat.');
    }
}
