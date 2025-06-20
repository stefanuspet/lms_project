<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Display a listing of attendance by day.
     */
    public function index(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'date' => 'nullable|date',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get classes taught by this teacher
            $classIds = Subject::where('teacher_id', $teacher->id)
                ->distinct('class_id')
                ->pluck('class_id');

            // Set default date to today if not provided
            $date = $request->input('date', now()->toDateString());
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);

            // Get attendance records for the specified date and teacher's classes
            $attendanceSessions = DB::table('attendance_sessions')
                ->whereIn('class_id', $classIds)
                ->whereDate('date', $date)
                ->orderBy('class_id')
                ->paginate($perPage)
                ->withQueryString();

            // Format data for frontend
            $formattedSessions = collect($attendanceSessions->items())->map(function ($session) {
                $totalStudents = DB::table('semesters_students')
                    ->where('class_id', $session->class_id)
                    ->distinct('students_id')
                    ->count('students_id');

                $presentCount = DB::table('attendances')
                    ->where('attendance_sessions_id', $session->id)
                    ->where('status', 'hadir')
                    ->count();

                $absentCount = DB::table('attendances')
                    ->where('attendance_sessions_id', $session->id)
                    ->where('status', 'alpha')
                    ->count();

                $excusedCount = DB::table('attendances')
                    ->where('attendance_sessions_id', $session->id)
                    ->whereIn('status', ['izin', 'sakit'])
                    ->count();

                $className = DB::table('classes')
                    ->where('id', $session->class_id)
                    ->value('name');

                $subjectName = DB::table('subjects')
                    ->where('id', $session->subject_id)
                    ->value('name');

                return [
                    'id' => $session->id,
                    'date' => date('d M Y', strtotime($session->date)),
                    'pin' => $session->pin,
                    'class_id' => $session->class_id,
                    'class_name' => $className,
                    'subject_id' => $session->subject_id,
                    'subject_name' => $subjectName,
                    'is_expired' => $session->expires_at && now() > $session->expires_at,
                    'expires_at' => $session->expires_at ? date('d M Y, H:i', strtotime($session->expires_at)) : null,
                    'total_students' => $totalStudents,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'excused_count' => $excusedCount,
                    'attendance_rate' => $totalStudents > 0 ? round(($presentCount / $totalStudents) * 100) : 0,
                ];
            });

            // Get daily summary
            $dailySummary = [
                'total_students' => 0,
                'present_count' => 0,
                'absent_count' => 0,
                'excused_count' => 0,
                'classes_with_sessions' => 0,
            ];

            foreach ($formattedSessions as $session) {
                $dailySummary['total_students'] += $session['total_students'];
                $dailySummary['present_count'] += $session['present_count'];
                $dailySummary['absent_count'] += $session['absent_count'];
                $dailySummary['excused_count'] += $session['excused_count'];
                $dailySummary['classes_with_sessions']++;
            }

            $dailySummary['attendance_rate'] = $dailySummary['total_students'] > 0
                ? round(($dailySummary['present_count'] / $dailySummary['total_students']) * 100)
                : 0;

            // Get active sessions for today
            $activeSessions = DB::table('attendance_sessions')
                ->join('classes', 'attendance_sessions.class_id', '=', 'classes.id')
                ->join('subjects', 'attendance_sessions.subject_id', '=', 'subjects.id')
                ->whereIn('attendance_sessions.class_id', $classIds)
                ->whereDate('date', now()->toDateString())
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->select(
                    'attendance_sessions.id',
                    'attendance_sessions.pin',
                    'attendance_sessions.expires_at',
                    'classes.name as class_name',
                    'subjects.name as subject_name'
                )
                ->get();

            return Inertia::render('Teacher/Attendance/Index', [
                'sessions' => $formattedSessions,
                'daily_summary' => $dailySummary,
                'active_sessions' => $activeSessions,
                'selected_date' => $date,
                'pagination' => [
                    'total' => $attendanceSessions->total(),
                    'per_page' => $attendanceSessions->perPage(),
                    'current_page' => $attendanceSessions->currentPage(),
                    'last_page' => $attendanceSessions->lastPage(),
                    'from' => $attendanceSessions->firstItem(),
                    'to' => $attendanceSessions->lastItem(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher attendance index: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load attendance records: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display the specified attendance session (daily view).
     */
    public function dailyView(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'date' => 'required|date',
                'class_id' => 'nullable|exists:classes,id',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get classes taught by this teacher
            $classIds = Subject::where('teacher_id', $teacher->id)
                ->distinct('class_id')
                ->pluck('class_id');

            // Apply class filter if provided
            if ($request->has('class_id')) {
                // Verify the teacher teaches this class
                if (!$classIds->contains($request->class_id)) {
                    return redirect()->route('teacher.attendance.index')
                        ->with('error', 'You do not have permission to view attendance for this class.');
                }
                $classIds = [$request->class_id];
            }

            // Get date
            $date = $request->date;

            // Get attendance sessions for the date
            $attendanceSessions = DB::table('attendance_sessions')
                ->whereIn('class_id', $classIds)
                ->whereDate('date', $date)
                ->get();

            $sessionIds = $attendanceSessions->pluck('id');

            // Get class information
            $classes = DB::table('classes')
                ->whereIn('id', $classIds)
                ->get(['id', 'name']);

            // Prepare data structure
            $attendanceData = [];
            foreach ($classes as $class) {
                $sessions = $attendanceSessions->where('class_id', $class->id);

                if ($sessions->isEmpty()) {
                    continue; // Skip classes with no sessions
                }

                $sessionIds = $sessions->pluck('id');

                // Get students in the class
                $students = DB::table('students')
                    ->join('semesters_students', 'students.id', '=', 'semesters_students.students_id')
                    ->where('semesters_students.class_id', $class->id)
                    ->distinct('students.id')
                    ->select('students.id', 'students.name', 'students.nisn', 'students.gender')
                    ->get();

                // Get attendance records
                $attendanceRecords = DB::table('attendances')
                    ->whereIn('attendance_sessions_id', $sessionIds)
                    ->get();

                // Prepare student data with attendance status
                $studentData = [];
                foreach ($students as $student) {
                    $record = $attendanceRecords->where('student_id', $student->id)->first();

                    $studentData[] = [
                        'id' => $student->id,
                        'name' => $student->name,
                        'nisn' => $student->nisn,
                        'gender' => $student->gender,
                        'status' => $record ? $record->status : 'alpha',
                        'submitted_at' => $record && $record->submitted_at ? date('d M Y, H:i', strtotime($record->submitted_at)) : null,
                    ];
                }

                // Calculate statistics
                $totalStudents = count($studentData);
                $presentCount = collect($studentData)->where('status', 'hadir')->count();
                $absentCount = collect($studentData)->where('status', 'alpha')->count();
                $excusedCount = collect($studentData)->whereIn('status', ['izin', 'sakit'])->count();

                $attendanceData[] = [
                    'class_id' => $class->id,
                    'class_name' => $class->name,
                    'session_id' => $sessions->first()->id,
                    'total_students' => $totalStudents,
                    'present_count' => $presentCount,
                    'absent_count' => $absentCount,
                    'excused_count' => $excusedCount,
                    'attendance_rate' => $totalStudents > 0 ? round(($presentCount / $totalStudents) * 100) : 0,
                    'students' => $studentData,
                ];
            }

            // Get overall statistics
            $overallStats = [
                'total_students' => collect($attendanceData)->sum('total_students'),
                'present_count' => collect($attendanceData)->sum('present_count'),
                'absent_count' => collect($attendanceData)->sum('absent_count'),
                'excused_count' => collect($attendanceData)->sum('excused_count'),
                'classes_count' => count($attendanceData),
            ];

            $overallStats['attendance_rate'] = $overallStats['total_students'] > 0
                ? round(($overallStats['present_count'] / $overallStats['total_students']) * 100)
                : 0;

            return Inertia::render('Teacher/Attendance/DailyView', [
                'attendance_data' => $attendanceData,
                'overall_stats' => $overallStats,
                'selected_date' => $date,
                'formatted_date' => date('d M Y', strtotime($date)),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher attendance daily view: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load daily attendance view: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display active sessions with PIN codes.
     */
    public function activeSessions()
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get classes taught by this teacher
            $classIds = Subject::where('teacher_id', $teacher->id)
                ->distinct('class_id')
                ->pluck('class_id');

            // Get active sessions
            $activeSessions = DB::table('attendance_sessions')
                ->join('classes', 'attendance_sessions.class_id', '=', 'classes.id')
                ->join('subjects', 'attendance_sessions.subject_id', '=', 'subjects.id')
                ->whereIn('attendance_sessions.class_id', $classIds)
                ->whereDate('date', now()->toDateString())
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->select(
                    'attendance_sessions.id',
                    'attendance_sessions.pin',
                    'attendance_sessions.expires_at',
                    'attendance_sessions.date',
                    'classes.id as class_id',
                    'classes.name as class_name',
                    'subjects.id as subject_id',
                    'subjects.name as subject_name'
                )
                ->get();

            // Format data
            $formattedSessions = $activeSessions->map(function ($session) {
                $totalStudents = DB::table('semesters_students')
                    ->where('class_id', $session->class_id)
                    ->distinct('students_id')
                    ->count('students_id');

                $presentCount = DB::table('attendances')
                    ->where('attendance_sessions_id', $session->id)
                    ->where('status', 'hadir')
                    ->count();

                return [
                    'id' => $session->id,
                    'pin' => $session->pin,
                    'date' => date('d M Y', strtotime($session->date)),
                    'expires_at' => $session->expires_at ? date('d M Y, H:i', strtotime($session->expires_at)) : null,
                    'time_remaining' => $session->expires_at ? now()->diffInMinutes($session->expires_at, false) : null,
                    'class_id' => $session->class_id,
                    'class_name' => $session->class_name,
                    'subject_id' => $session->subject_id,
                    'subject_name' => $session->subject_name,
                    'total_students' => $totalStudents,
                    'present_count' => $presentCount,
                    'present_rate' => $totalStudents > 0 ? round(($presentCount / $totalStudents) * 100) : 0,
                ];
            });

            return Inertia::render('Teacher/Attendance/ActiveSessions', [
                'active_sessions' => $formattedSessions,
                'today_date' => now()->format('d M Y'),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher active sessions: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load active sessions: ' . $e->getMessage()
            ]);
        }
    }
}
