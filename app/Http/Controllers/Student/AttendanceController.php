<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
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

            // Get current semester and class
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

            $currentClassId = $currentSemesterStudent->class_id;
            $currentSemesterId = $currentSemesterStudent->semesters_id;

            // Get subjects for this student's class
            $subjects = DB::table('subjects')
                ->where('class_id', $currentClassId)
                ->get();

            $subjectIds = $subjects->pluck('id')->toArray();

            // Get attendance sessions for this semester and class
            $attendanceSessions = DB::table('attendance_sessions')
                ->where('semester_id', $currentSemesterId)
                ->where('class_id', $currentClassId)
                ->count();

            // Get attendance records
            $attendanceRecords = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->join('subjects', 'attendance_sessions.subject_id', '=', 'subjects.id')
                ->where('attendances.student_id', $student->id)
                ->where('attendance_sessions.semester_id', $currentSemesterId)
                ->select(
                    'attendances.*',
                    'attendance_sessions.date as session_date',
                    'attendance_sessions.subject_id',
                    'subjects.name as subject_name'
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

            // Get attendance by subject
            $attendanceBySubject = [];

            foreach ($subjects as $subject) {
                $subjectSessions = DB::table('attendance_sessions')
                    ->where('semester_id', $currentSemesterId)
                    ->where('class_id', $currentClassId)
                    ->where('subject_id', $subject->id)
                    ->count();

                $subjectPresent = $attendanceRecords
                    ->where('subject_id', $subject->id)
                    ->where('status', 'hadir')
                    ->count();

                $attendanceBySubject[] = [
                    'subject_id' => $subject->id,
                    'subject_name' => $subject->name,
                    'total_sessions' => $subjectSessions,
                    'present' => $subjectPresent,
                    'absent' => $subjectSessions - $subjectPresent,
                    'attendance_rate' => $subjectSessions > 0
                        ? round(($subjectPresent / $subjectSessions) * 100) . '%'
                        : 'N/A'
                ];
            }

            // Get recent attendance records
            $recentAttendances = $attendanceRecords->take(10)->map(function ($record) {
                return [
                    'id' => $record->id,
                    'date' => date('d M Y', strtotime($record->session_date)),
                    'subject_name' => $record->subject_name,
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
                'subject_id' => 'nullable|integer',
                'status' => 'nullable|string|in:all,hadir,sakit,izin,alpha',
                'month' => 'nullable|date_format:Y-m',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            // Set default values
            $subjectId = $request->input('subject_id');
            $status = $request->input('status', 'all');
            $month = $request->input('month');
            $perPage = $request->input('per_page', 20);
            $page = $request->input('page', 1);

            // Get current semester and class
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
                        'subject_id' => $subjectId,
                        'status' => $status,
                        'month' => $month,
                    ],
                    'subjects' => [],
                ]);
            }

            $currentClassId = $currentSemesterStudent->class_id;

            // Get subjects for this student's class
            $subjects = DB::table('subjects')
                ->where('class_id', $currentClassId)
                ->get()
                ->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                    ];
                });

            // Base query for attendance records
            $query = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                ->join('subjects', 'attendance_sessions.subject_id', '=', 'subjects.id')
                ->where('attendances.student_id', $student->id)
                ->select(
                    'attendances.*',
                    'attendance_sessions.date as session_date',
                    'attendance_sessions.subject_id',
                    'subjects.name as subject_name'
                );

            // Apply filters
            if ($subjectId) {
                $query->where('attendance_sessions.subject_id', $subjectId);
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
                    'subject_name' => $attendance->subject_name,
                    'subject_id' => $attendance->subject_id,
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
                    'subject_id' => $subjectId,
                    'status' => $status,
                    'month' => $month,
                ],
                'subjects' => $subjects,
                'months' => $formattedMonths,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student attendance history: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to load attendance history: ' . $e->getMessage()
            ]);
        }
    }
}
