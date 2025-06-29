<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Semester;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Display a listing of attendance sessions.
     */
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
                $q->where('pin', 'like', "%{$search}%")
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
            $isActive = Carbon::parse($session->expires_at)->isFuture();
            $presentCount = $session->attendances()->where('status', 'hadir')->count();
            $absentCount = $session->attendances()->whereIn('status', ['izin', 'sakit', 'alpha'])->count();
            $totalStudents = $presentCount + $absentCount;
            $attendanceRate = $totalStudents > 0 ? round(($presentCount / $totalStudents) * 100, 1) : 0;

            return [
                'id' => $session->id,
                'pin' => $session->pin,
                'title' => $session->title,
                'description' => $session->description,
                'date' => Carbon::parse($session->date)->format('d-m-Y'),
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
        return Inertia::render('Admin/Attendance/Index', [
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

    /**
     * Show the form for creating a new attendance session.
     */
    public function create()
    {
        $semesters = Semester::where('end_date', '>=', now())
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Admin/Attendance/Create', [
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
            'title' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'date' => 'required|date',
            'semester_id' => 'required|exists:semesters,id',
            'duration' => 'required|integer|min:5|max:1440', // Durasi dalam menit
        ]);

        DB::beginTransaction();

        try {
            // Generate random 6-digit PIN
            $pin = $this->generateUniquePin();

            // Calculate expiration time
            $duration = (int) $request->duration;
            $expiresAt = now()->addMinutes($duration);

            // Create new attendance session
            $session = AttendanceSession::create([
                'pin' => $pin,
                'title' => $request->title,
                'description' => $request->description,
                'date' => $request->date,
                'semester_id' => $request->semester_id,
                'expires_at' => $expiresAt,
            ]);

            DB::commit();

            // Log activity
            $this->logActivity(auth()->id(), 'create', 'Created attendance session with PIN: ' . $pin);

            return redirect()->route('admin.attendance.show', $session->id)
                ->with('success', 'Attendance session created successfully with PIN: ' . $pin);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating attendance session: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to create attendance session: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified attendance session.
     */
    public function show(AttendanceSession $session)
    {
        // Load relations
        $session->load(['semester']);

        // Get all students
        $allStudents = Student::orderBy('name')->get();

        // Get attendances for this session
        $attendances = Attendance::where('attendance_sessions_id', $session->id)
            ->with('student')
            ->get();

        // Prepare student attendance data
        $studentAttendances = $allStudents->map(function ($student) use ($attendances) {
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

        // Prepare data for frontend
        $formattedSession = [
            'id' => $session->id,
            'pin' => $session->pin,
            'title' => $session->title,
            'description' => $session->description,
            'date' => Carbon::parse($session->date)->format('d-m-Y'),
            'semester' => $session->semester ? [
                'id' => $session->semester->id,
                'name' => $session->semester->name,
            ] : null,
            'expires_at' => Carbon::parse($session->expires_at)->format('d-m-Y H:i:s'),
            'is_active' => Carbon::parse($session->expires_at)->isFuture(),
            'created_at' => Carbon::parse($session->created_at)->format('d-m-Y H:i:s'),
        ];

        return Inertia::render('Admin/Attendance/Show', [
            'session' => $formattedSession,
            'students' => $studentAttendances,
            'stats' => $stats,
        ]);
    }

    /**
     * Update student attendance status.
     */
    public function updateAttendance(Request $request, AttendanceSession $session)
    {
        // Validate input
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'status' => 'required|in:hadir,izin,sakit,alpha',
        ]);

        DB::beginTransaction();

        try {
            $student = Student::findOrFail($request->student_id);

            // Check if attendance already exists
            $attendance = Attendance::where('attendance_sessions_id', $session->id)
                ->where('student_id', $request->student_id)
                ->first();

            if ($attendance) {
                // Update existing attendance
                $attendance->update([
                    'status' => $request->status,
                    'submitted_at' => now(),
                ]);
            } else {
                // Create new attendance
                $attendance = Attendance::create([
                    'attendance_sessions_id' => $session->id,
                    'student_id' => $request->student_id,
                    'status' => $request->status,
                    'submitted_at' => now(),
                ]);
            }

            DB::commit();

            // Log activity
            $this->logActivity(
                auth()->id(),
                'update',
                "Updated attendance for student {$student->name} to {$request->status}"
            );

            return redirect()->back()->with('success', 'Attendance updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating attendance: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to update attendance: ' . $e->getMessage()]);
        }
    }

    /**
     * Extend attendance session expiration time.
     */
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
                "Extended attendance session PIN {$session->pin} for {$minutes} minutes"
            );

            return redirect()->back()->with('success', 'Attendance session extended successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error extending attendance session: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to extend attendance session: ' . $e->getMessage()]);
        }
    }

    /**
     * Close attendance session (expire it immediately).
     */
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
                "Closed attendance session PIN {$session->pin}"
            );

            return redirect()->back()->with('success', 'Attendance session closed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error closing attendance session: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to close attendance session: ' . $e->getMessage()]);
        }
    }

    /**
     * Show attendance reports page.
     */
    public function reports(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'semester_id' => 'nullable|exists:semesters,id',
            'student_id' => 'nullable|exists:students,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        // Get filter options
        $semesters = Semester::orderBy('start_date', 'desc')->get();
        $students = Student::orderBy('name')->get();

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

        return Inertia::render('Admin/Attendance/Reports', [
            'filters' => [
                'semester_id' => $request->semester_id,
                'student_id' => $request->student_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'filterOptions' => [
                'semesters' => $semesters,
                'students' => $students,
            ],
            'attendanceData' => $attendanceData ?? [],
            'sessionDates' => $sessionDates ?? [],
            'hasData' => !empty($attendanceData ?? []),
        ]);
    }

    /**
     * Export attendance report to CSV.
     */
    public function exportReport(Request $request)
    {
        // Implement CSV export functionality
        // This would be similar to the reports method but outputs CSV instead

        // For example:
        // return (new AttendanceExport($request))->download('attendance_report.csv');

        // You could create a custom export class using Laravel Excel package

        return redirect()->back()->with('success', 'Export functionality will be implemented soon');
    }

    /**
     * Generate a unique 6-digit PIN.
     */
    private function generateUniquePin()
    {
        $pin = null;
        $unique = false;

        while (!$unique) {
            $pin = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Check if PIN is unique
            $exists = AttendanceSession::where('pin', $pin)
                ->where('expires_at', '>', now())
                ->exists();

            if (!$exists) {
                $unique = true;
            }
        }

        return $pin;
    }

    /**
     * Function to log activity
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
