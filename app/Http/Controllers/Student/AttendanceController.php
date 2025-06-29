<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index()
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Get current semester for the student
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return Inertia::render('Student/Attendance/Index', [
                    'attendance_summary' => [],
                    'attendance_by_subject' => [],
                    'recent_attendances' => []
                ]);
            }

            $currentSemesterId = $currentSemesterStudent->semesters_id;

            // Get attendance sessions for this semester
            $attendanceSessions = AttendanceSession::where('semester_id', $currentSemesterId)
                ->count();

            // Get attendance records
            $attendanceRecords = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->where('attendances.student_id', $student->id)
                ->where('attendance_sessions.semester_id', $currentSemesterId)
                ->select(
                    'attendances.*',
                    'attendance_sessions.date as session_date',
                    'attendance_sessions.title as session_title'
                )
                ->orderBy('attendance_sessions.date', 'desc')
                ->get();

            // Calculate attendance summary
            $totalPresent = $attendanceRecords->where('status', 'hadir')->count();
            $totalSick = $attendanceRecords->where('status', 'sakit')->count();
            $totalPermit = $attendanceRecords->where('status', 'izin')->count();
            $totalAbsent = $attendanceRecords->where('status', 'alpha')->count();

            $attendanceSummary = [
                'total_sessions' => $attendanceSessions,
                'present' => $totalPresent,
                'sick' => $totalSick,
                'permit' => $totalPermit,
                'absent' => $totalAbsent,
                'attendance_rate' => $attendanceSessions > 0
                    ? round(($totalPresent / $attendanceSessions) * 100) . '%'
                    : 'N/A'
            ];

            // Group sessions by title for attendance by subject/category analysis
            $sessionsByTitle = $attendanceRecords->groupBy('session_title');
            $attendanceBySubject = [];

            foreach ($sessionsByTitle as $title => $records) {
                $sessionCount = $records->count();
                $presentCount = $records->where('status', 'hadir')->count();

                $attendanceBySubject[] = [
                    'subject_id' => null, // No subject_id in new schema
                    'subject_name' => $title,
                    'total_sessions' => $sessionCount,
                    'present' => $presentCount,
                    'absent' => $sessionCount - $presentCount,
                    'attendance_rate' => $sessionCount > 0
                        ? round(($presentCount / $sessionCount) * 100) . '%'
                        : 'N/A'
                ];
            }

            // Get recent attendance records
            $recentAttendances = $attendanceRecords->take(10)->map(function ($record) {
                return [
                    'id' => $record->id,
                    'date' => date('d M Y', strtotime($record->session_date)),
                    'subject_name' => $record->session_title, // Using session title instead of subject
                    'session_title' => $record->session_title,
                    'status' => $record->status,
                    'submitted_at' => $record->submitted_at
                        ? date('d M Y H:i', strtotime($record->submitted_at))
                        : null
                ];
            });

            return Inertia::render('Student/Attendance/Index', [
                'attendance_summary' => $attendanceSummary,
                'attendance_by_subject' => $attendanceBySubject,
                'recent_attendances' => $recentAttendances
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student attendance index: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to load attendance data: ' . $e->getMessage()
            ]);
        }
    }

    public function history(Request $request)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Validate input
            $validated = $request->validate([
                'title' => 'nullable|string',
                'status' => 'nullable|string|in:all,hadir,sakit,izin,alpha',
                'month' => 'nullable|date_format:Y-m',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            // Set default values
            $title = $request->input('title');
            $status = $request->input('status', 'all');
            $month = $request->input('month');
            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);

            // Get current semester
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return Inertia::render('Student/Attendance/History', [
                    'attendances' => [],
                    'pagination' => [
                        'total' => 0,
                        'per_page' => $perPage,
                        'current_page' => 1,
                        'last_page' => 1,
                    ],
                    'filters' => [
                        'title' => $title,
                        'status' => $status,
                        'month' => $month,
                    ],
                    'subjects' => [],
                    'months' => [],
                ]);
            }

            // Get all unique session titles for this student
            $sessionTitles = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->where('attendances.student_id', $student->id)
                ->select('attendance_sessions.title')
                ->distinct()
                ->get()
                ->map(function ($session) {
                    return [
                        'id' => $session->title, // Using title as ID since we don't have subject_id
                        'name' => $session->title,
                    ];
                });

            // Base query for attendance records
            $query = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->where('attendances.student_id', $student->id)
                ->select(
                    'attendances.*',
                    'attendance_sessions.date as session_date',
                    'attendance_sessions.title as session_title'
                );

            // Apply filters
            if ($title) {
                $query->where('attendance_sessions.title', $title);
            }

            if ($status !== 'all') {
                $query->where('attendances.status', $status);
            }

            if ($month) {
                $query->whereRaw("DATE_FORMAT(attendance_sessions.date, '%Y-%m') = ?", [$month]);
            }

            // Apply sorting
            $query->orderBy('attendance_sessions.date', 'desc');

            // Execute paginated query
            $attendances = $query->paginate($perPage)->withQueryString();

            // Format data for frontend
            $formattedAttendances = $attendances->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'date' => date('d M Y', strtotime($attendance->session_date)),
                    'subject_name' => $attendance->session_title, // Using session title instead of subject name
                    'subject_id' => null, // No subject ID in new schema
                    'session_title' => $attendance->session_title,
                    'status' => $attendance->status,
                    'submitted_at' => $attendance->submitted_at
                        ? date('d M Y H:i', strtotime($attendance->submitted_at))
                        : null
                ];
            });

            // Get months for filter options
            $availableMonths = DB::table('attendance_sessions')
                ->join('attendances', 'attendance_sessions.id', '=', 'attendances.attendance_sessions_id')
                ->where('attendances.student_id', $student->id)
                ->selectRaw("DISTINCT DATE_FORMAT(attendance_sessions.date, '%Y-%m') as month")
                ->orderBy('month', 'desc')
                ->pluck('month');

            // Format months for display
            $formattedMonths = $availableMonths->map(function ($month) {
                return [
                    'value' => $month,
                    'label' => date('F Y', strtotime($month . '-01'))
                ];
            });

            return Inertia::render('Student/Attendance/History', [
                'attendances' => $formattedAttendances,
                'pagination' => [
                    'total' => $attendances->total(),
                    'per_page' => $attendances->perPage(),
                    'current_page' => $attendances->currentPage(),
                    'last_page' => $attendances->lastPage(),
                    'from' => $attendances->firstItem(),
                    'to' => $attendances->lastItem(),
                ],
                'filters' => [
                    'title' => $title, // Changed from subject_id to title
                    'status' => $status,
                    'month' => $month,
                ],
                'subjects' => $sessionTitles, // Using session titles instead of subjects
                'months' => $formattedMonths,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student attendance history: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to load attendance history: ' . $e->getMessage()
            ]);
        }
    }

    public function submitAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'session_id' => 'required|exists:attendance_sessions,id',
                'pin' => 'required|string|size:6',
            ]);

            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();
            $session = AttendanceSession::findOrFail($validated['session_id']);

            // Check if session is active
            if (!$session->isActive()) {
                return redirect()->back()->withErrors([
                    'error' => 'This attendance session has expired.'
                ]);
            }

            // Verify PIN
            if ($session->pin !== $validated['pin']) {
                return redirect()->back()->withErrors([
                    'error' => 'Invalid PIN code.'
                ]);
            }

            // Check if student already submitted attendance
            $existingAttendance = Attendance::where('attendance_sessions_id', $session->id)
                ->where('student_id', $student->id)
                ->first();

            if ($existingAttendance) {
                return redirect()->back()->withErrors([
                    'error' => 'You have already submitted attendance for this session.'
                ]);
            }

            // Create new attendance record
            Attendance::create([
                'attendance_sessions_id' => $session->id,
                'student_id' => $student->id,
                'status' => 'hadir',
                'submitted_at' => now(),
            ]);

            // Log activity
            if (class_exists('\App\Models\ActivityLog')) {
                \App\Models\ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'submit_attendance',
                    'description' => "Submitted attendance for session {$session->title}",
                    'ip_address' => $request->ip(),
                ]);
            }

            return redirect()->back()->with('success', 'Attendance submitted successfully!');
        } catch (\Exception $e) {
            Log::error('Error in student attendance submission: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to submit attendance: ' . $e->getMessage()
            ]);
        }
    }

    public function activeSession()
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Get current semester for the student
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return response()->json([
                    'active_sessions' => []
                ]);
            }

            $currentSemesterId = $currentSemesterStudent->semesters_id;

            // Get active sessions for current semester
            $activeSessions = AttendanceSession::where('semester_id', $currentSemesterId)
                ->where('expires_at', '>', now())
                ->get()
                ->map(function ($session) use ($student) {
                    // Check if student already submitted attendance
                    $hasSubmitted = Attendance::where('attendance_sessions_id', $session->id)
                        ->where('student_id', $student->id)
                        ->exists();

                    return [
                        'id' => $session->id,
                        'title' => $session->title,
                        'description' => $session->description,
                        'date' => $session->date->format('d M Y'),
                        'subject_name' => $session->title, // Using session title since we don't have subject
                        'remaining_time' => $session->remaining_time,
                        'has_submitted' => $hasSubmitted,
                    ];
                });

            return response()->json([
                'active_sessions' => $activeSessions
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getting active attendance sessions: ' . $e->getMessage());

            return response()->json([
                'error' => 'Failed to get active sessions: ' . $e->getMessage()
            ], 500);
        }
    }
}
