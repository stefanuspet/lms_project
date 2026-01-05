<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Material;
use App\Models\Notification;
use App\Models\Extracurricular;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Add debug information at each step
            $debug = ['step' => 'start'];

            // Get current user with failsafe
            $user = Auth::user();
            $debug['step'] = 'auth_check';
            $debug['user_id'] = $user ? $user->id : null;

            if (!$user) {
                Log::warning('No authenticated user found in student dashboard');
                return redirect()->route('login');
            }

            // Get student with detailed error handling
            $student = Student::where('user_id', $user->id)->first();
            $debug['step'] = 'student_check';
            $debug['student_id'] = $student ? $student->id : null;

            if (!$student) {
                Log::error('Student profile not found for user ID: ' . $user->id);
                return Inertia::render('Student/Dashboard', [
                    'student' => [
                        'name' => 'New Student',
                        'nisn' => '-',
                        'email' => $user->email,
                        'class_name' => 'Not Assigned',
                    ],
                    'stats' => [
                        'total_subjects' => 0,
                        'pending_assignments' => 0,
                        'completed_assignments' => 0,
                        'attendance_rate' => '0%'
                    ],
                    'upcoming_assignments' => [],
                    'recent_materials' => [],
                    'notifications' => [],
                    'current_subjects' => [],
                    'debug_info' => $debug,
                ]);
            }

            // Get current semester and class with detailed tracking
            $debug['step'] = 'semester_check';

            // Check if semesters_students table exists
            if (!Schema::hasTable('semesters_students')) {
                Log::error('semesters_students table does not exist');
                throw new \Exception('Database schema issue: semesters_students table not found');
            }

            // Use raw query first to debug
            $semesterQuery = "SELECT ss.*, s.* FROM semesters_students ss 
                             JOIN semesters s ON ss.semesters_id = s.id
                             WHERE ss.students_id = ?
                             ORDER BY s.end_date DESC
                             LIMIT 1";

            $currentSemesterStudent = DB::select($semesterQuery, [$student->id]);
            $debug['semester_raw_query'] = !empty($currentSemesterStudent);

            if (empty($currentSemesterStudent)) {
                // Check if the student has any semester at all
                $hasAnyRecord = DB::table('semesters_students')
                    ->where('students_id', $student->id)
                    ->exists();

                $debug['has_any_semester'] = $hasAnyRecord;

                // Return with empty data but valid structure
                return Inertia::render('Student/Dashboard', [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'nisn' => $student->nisn,
                        'email' => $user->email,
                        'class_name' => 'Not Assigned',
                    ],
                    'stats' => [
                        'total_subjects' => 0,
                        'pending_assignments' => 0,
                        'completed_assignments' => 0,
                        'attendance_rate' => '0%'
                    ],
                    'upcoming_assignments' => [],
                    'recent_materials' => [],
                    'notifications' => [],
                    'current_subjects' => [],
                    'debug_info' => $debug,
                ]);
            }

            // Convert raw object to expected format
            $currentSemesterStudent = $currentSemesterStudent[0];
            $currentClassId = $currentSemesterStudent->class_id;
            $currentSemesterId = $currentSemesterStudent->semesters_id;

            $debug['step'] = 'subjects_check';
            $debug['class_id'] = $currentClassId;

            // Check subjects table and query
            if (!Schema::hasTable('subjects')) {
                Log::error('subjects table does not exist');
                throw new \Exception('Database schema issue: subjects table not found');
            }

            // Get subjects for this student's class with safer query
            $subjects = Subject::where('class_id', $currentClassId)->get();
            $debug['subjects_found'] = $subjects->count();

            // Explicitly check for empty subjects and handle it gracefully
            if ($subjects->isEmpty()) {
                return Inertia::render('Student/Dashboard', [
                    'student' => [
                        'id' => $student->id,
                        'name' => $student->name,
                        'nisn' => $student->nisn,
                        'email' => $user->email,
                        'class_name' => DB::table('classes')->where('id', $currentClassId)->value('name') ?? 'Unknown Class',
                    ],
                    'stats' => [
                        'total_subjects' => 0,
                        'pending_assignments' => 0,
                        'completed_assignments' => 0,
                        'attendance_rate' => '0%'
                    ],
                    'upcoming_assignments' => [],
                    'recent_materials' => [],
                    'notifications' => [],
                    'current_subjects' => [],
                    'debug_info' => $debug,
                ]);
            }

            $subjectIds = $subjects->pluck('id')->toArray();
            $debug['subject_ids'] = $subjectIds;

            // Check each query step carefully with try/catch blocks

            // Get upcoming assignments safely
            $debug['step'] = 'assignments_check';
            $upcomingAssignments = [];

            try {
                $upcomingAssignments = Assignment::whereIn('subject_id', $subjectIds)
                    ->where('deadline', '>', now())
                    ->where('deadline', '<', now()->addDays(7))
                    ->orderBy('deadline')
                    ->limit(5)
                    ->get()
                    ->map(function ($assignment) use ($student, $debug) {
                        try {
                            // Check if student has submitted
                            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                                ->where('student_id', $student->id)
                                ->first();

                            $subject = Subject::find($assignment->subject_id);

                            return [
                                'id' => $assignment->id,
                                'title' => $assignment->title,
                                'subject_name' => $subject ? $subject->name : 'Unknown Subject',
                                'deadline' => $assignment->deadline->format('d M Y, H:i'),
                                'days_remaining' => now()->diffInDays($assignment->deadline, false),
                                'is_submitted' => $submission ? true : false,
                            ];
                        } catch (\Exception $e) {
                            Log::error('Error in assignment mapping: ' . $e->getMessage());
                            return [
                                'id' => $assignment->id,
                                'title' => $assignment->title,
                                'subject_name' => 'Error loading subject',
                                'deadline' => 'Unknown',
                                'days_remaining' => 0,
                                'is_submitted' => false,
                            ];
                        }
                    });
            } catch (\Exception $e) {
                Log::error('Error loading assignments: ' . $e->getMessage());
                // Continue with empty assignments
            }

            $debug['upcoming_assignments_count'] = count($upcomingAssignments);

            // Get recent materials safely
            $debug['step'] = 'materials_check';
            $recentMaterials = [];

            try {
                $recentMaterials = Material::whereIn('subject_id', $subjectIds)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($material) {
                        try {
                            $subject = Subject::find($material->subject_id);

                            return [
                                'id' => $material->id,
                                'title' => $material->title,
                                'subject_name' => $subject ? $subject->name : 'Unknown Subject',
                                'file_type' => $material->file_type,
                                'created_at' => $material->created_at->format('d M Y'),
                            ];
                        } catch (\Exception $e) {
                            Log::error('Error in material mapping: ' . $e->getMessage());
                            return [
                                'id' => $material->id,
                                'title' => $material->title,
                                'subject_name' => 'Error loading subject',
                                'file_type' => 'Unknown',
                                'created_at' => 'Unknown',
                            ];
                        }
                    });
            } catch (\Exception $e) {
                Log::error('Error loading materials: ' . $e->getMessage());
                // Continue with empty materials
            }

            $debug['recent_materials_count'] = count($recentMaterials);

            // Get notifications safely
            $debug['step'] = 'notifications_check';
            $notifications = [];

            try {
                $notifications = Notification::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($notification) {
                        try {
                            return [
                                'id' => $notification->id,
                                'title' => $notification->title,
                                'content' => $notification->content,
                                'is_read' => $notification->is_read,
                                'type' => $notification->type,
                                'created_at' => $notification->created_at->diffForHumans(),
                            ];
                        } catch (\Exception $e) {
                            Log::error('Error in notification mapping: ' . $e->getMessage());
                            return [
                                'id' => $notification->id,
                                'title' => $notification->title,
                                'content' => $notification->content ?? 'No content',
                                'is_read' => false,
                                'type' => 'system',
                                'created_at' => 'Recently',
                            ];
                        }
                    });
            } catch (\Exception $e) {
                Log::error('Error loading notifications: ' . $e->getMessage());
                // Continue with empty notifications
            }

            $debug['notifications_count'] = count($notifications);

            // Calculate stats safely
            $debug['step'] = 'stats_check';
            $totalSubjects = count($subjects);

            // Calculate pending assignments safely
            $pendingAssignments = 0;
            try {
                $pendingAssignments = Assignment::whereIn('subject_id', $subjectIds)
                    ->where('deadline', '>', now())
                    ->whereDoesntHave('submissions', function ($query) use ($student) {
                        $query->where('student_id', $student->id);
                    })
                    ->count();
            } catch (\Exception $e) {
                Log::error('Error calculating pending assignments: ' . $e->getMessage());
            }

            // Calculate completed assignments safely
            $completedAssignments = 0;
            try {
                $completedAssignments = AssignmentSubmission::where('student_id', $student->id)
                    ->whereHas('assignment', function ($query) use ($subjectIds) {
                        $query->whereIn('subject_id', $subjectIds);
                    })
                    ->count();
            } catch (\Exception $e) {
                Log::error('Error calculating completed assignments: ' . $e->getMessage());
            }

            // Calculate attendance rate safely
            $attendanceRate = '0%';
            try {
                $attendanceSessions = DB::table('attendance_sessions')
                    ->whereIn('subject_id', $subjectIds)
                    ->count();

                $studentAttendances = DB::table('attendances')
                    ->join('attendance_sessions', 'attendances.attendance_sessions_id', '=', 'attendance_sessions.id')
                    ->whereIn('attendance_sessions.subject_id', $subjectIds)
                    ->where('attendances.student_id', $student->id)
                    ->where('attendances.status', 'hadir')
                    ->count();

                $attendanceRate = $attendanceSessions > 0
                    ? round(($studentAttendances / $attendanceSessions) * 100) . '%'
                    : 'N/A';
            } catch (\Exception $e) {
                Log::error('Error calculating attendance rate: ' . $e->getMessage());
                $attendanceRate = 'N/A';
            }

            // Format subjects safely
            $debug['step'] = 'current_subjects_formatting';
            $currentSubjects = [];

            try {
                $currentSubjects = $subjects->map(function ($subject) use ($student) {
                    try {
                        // Get material count
                        $materialCount = Material::where('subject_id', $subject->id)->count();

                        // Get assignment count
                        $assignmentCount = Assignment::where('subject_id', $subject->id)->count();

                        // Get completed assignments
                        $completedAssignments = AssignmentSubmission::where('student_id', $student->id)
                            ->whereHas('assignment', function ($query) use ($subject) {
                                $query->where('subject_id', $subject->id);
                            })
                            ->count();

                        return [
                            'id' => $subject->id,
                            'name' => $subject->name,
                            'teacher_name' => $subject->teacher ? $subject->teacher->name : 'Unknown Teacher',
                            'materials_count' => $materialCount,
                            'assignments_count' => $assignmentCount,
                            'completed_assignments' => $completedAssignments,
                        ];
                    } catch (\Exception $e) {
                        Log::error('Error in subject mapping: ' . $e->getMessage());
                        return [
                            'id' => $subject->id,
                            'name' => $subject->name,
                            'teacher_name' => 'Unknown Teacher',
                            'materials_count' => 0,
                            'assignments_count' => 0,
                            'completed_assignments' => 0,
                        ];
                    }
                })->toArray();
            } catch (\Exception $e) {
                Log::error('Error formatting current subjects: ' . $e->getMessage());
            }

            $debug['current_subjects_count'] = count($currentSubjects);
            $debug['step'] = 'class_name_lookup';

            // Get class name safely
            $className = 'Unknown Class';
            try {
                $className = DB::table('classes')->where('id', $currentClassId)->value('name') ?? 'Unknown Class';
            } catch (\Exception $e) {
                Log::error('Error getting class name: ' . $e->getMessage());
            }

            $debug['class_name'] = $className;
            $debug['step'] = 'extracurricular_summary';

            // Ringkasan ekstrakurikuler (jumlah & yang terdekat)
            $extracurriculars = Extracurricular::with('teacher')
                ->where('is_active', true)
                ->whereHas('students', function ($q) use ($student) {
                    $q->where('students.id', $student->id);
                })
                ->get();

            $totalExtracurriculars = $extracurriculars->count();

            $nextExtracurricular = $extracurriculars
                ->sortBy(function ($extra) {
                    // Urutkan kasar berdasarkan hari & jam (tanpa hitung tanggal)
                    $dayOrder = [
                        'monday' => 1,
                        'tuesday' => 2,
                        'wednesday' => 3,
                        'thursday' => 4,
                        'friday' => 5,
                        'saturday' => 6,
                        'sunday' => 7,
                    ];
                    $dayWeight = $dayOrder[$extra->day_of_week] ?? 99;
                    return $dayWeight . ($extra->start_time ?? '00:00');
                })
                ->first();

            $extracurricularSummary = [
                'total' => $totalExtracurriculars,
                'next' => $nextExtracurricular
                    ? [
                        'name' => $nextExtracurricular->name,
                        'day_of_week' => $nextExtracurricular->day_of_week,
                        'day_label' => $nextExtracurricular->day_of_week, // label bisa diformat di frontend
                        'start_time' => $nextExtracurricular->start_time,
                        'end_time' => $nextExtracurricular->end_time,
                        'teacher_name' => optional($nextExtracurricular->teacher)->name,
                    ]
                    : null,
            ];

            $debug['extracurricular_total'] = $totalExtracurriculars;
            $debug['step'] = 'final_data_preparation';

            // Prepare final data safely
            $studentData = [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'email' => $user->email,
                'class_name' => $className,
            ];

            $statsData = [
                'total_subjects' => $totalSubjects,
                'pending_assignments' => $pendingAssignments,
                'completed_assignments' => $completedAssignments,
                'attendance_rate' => $attendanceRate
            ];

            $debug['step'] = 'render';

            // Return data to view
            return Inertia::render('Student/Dashboard', [
                'student' => $studentData,
                'stats' => $statsData,
                'upcoming_assignments' => $upcomingAssignments,
                'recent_materials' => $recentMaterials,
                'notifications' => $notifications,
                'current_subjects' => $currentSubjects,
                'extracurricular_summary' => $extracurricularSummary,
                'debug_info' => $debug,
            ]);
        } catch (\Exception $e) {
            // Detailed error logging for debugging
            $errorDetails = [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ];

            Log::error('Error in student dashboard with full details: ', $errorDetails);

            // Return error response with minimal error information for production
            return Inertia::render('Student/Dashboard', [
                'student' => [
                    'name' => 'Student',
                    'nisn' => '-',
                    'email' => Auth::user() ? Auth::user()->email : '-',
                    'class_name' => 'Not Available',
                ],
                'stats' => [
                    'total_subjects' => 0,
                    'pending_assignments' => 0,
                    'completed_assignments' => 0,
                    'attendance_rate' => '0%'
                ],
                'upcoming_assignments' => [],
                'recent_materials' => [],
                'notifications' => [],
                'current_subjects' => [],
                'extracurricular_summary' => [
                    'total' => 0,
                    'next' => null,
                ],
                'error' => 'Dashboard data could not be loaded. Error: ' . $e->getMessage(),
                'error_details' => config('app.debug') ? $errorDetails : null,
            ]);
        }
    }
}
