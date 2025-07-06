<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProgressController extends Controller
{
    /**
     * Display a listing of student progress for all subjects.
     */
    public function index(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'search' => 'nullable|string|max:50',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'sort_by' => 'nullable|string|in:name,average_grade,assignment_completion,class_name',
                'sort_order' => 'nullable|string|in:asc,desc',
                'filter_class' => 'nullable|integer|exists:classes,id',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get all subjects taught by this teacher
            $teacherSubjects = Subject::where('teacher_id', $teacher->id)
                ->with('classroom')
                ->get();

            // Set default values
            $search = $request->input('search', '');
            $perPage = $request->input('per_page', 10);
            $sortBy = $request->input('sort_by', 'name');
            $sortOrder = $request->input('sort_order', 'asc');
            $page = $request->input('page', 1);
            $filterClass = $request->input('filter_class');

            // Get all classes taught by this teacher
            $classes = $teacherSubjects->pluck('classroom')->unique('id')->filter()->values();

            // Apply class filter if provided
            $filteredSubjects = $teacherSubjects;
            if ($filterClass) {
                $filteredSubjects = $teacherSubjects->where('class_id', $filterClass);
            }

            // Get all students in these classes
            $studentsQuery = Student::whereHas('classes', function ($query) use ($filteredSubjects) {
                $query->whereIn('class_id', $filteredSubjects->pluck('class_id'));
            });

            // Apply search if provided
            if (!empty($search)) {
                $studentsQuery->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('nisn', 'like', "%{$search}%");
                });
            }

            // Get paginated students
            $students = $studentsQuery->paginate($perPage)->withQueryString();

            // Get assignments for these subjects
            $assignmentIds = Assignment::whereIn('subject_id', $filteredSubjects->pluck('id'))->pluck('id');

            // Get submissions for these assignments
            $submissions = AssignmentSubmission::whereIn('assignment_id', $assignmentIds)
                ->with('assignment')
                ->get();

            // Process student progress data
            $studentsProgress = collect();
            foreach ($students as $student) {
                // Get submissions for this student
                $studentSubmissions = $submissions->where('student_id', $student->id);

                // Calculate statistics
                $totalAssignments = count($assignmentIds);
                $submittedAssignments = $studentSubmissions->unique('assignment_id')->count();
                $gradedSubmissions = $studentSubmissions->whereNotNull('grade')->count();

                // Calculate average grade (only for graded submissions)
                $gradesSum = $studentSubmissions->whereNotNull('grade')->sum('grade');
                $averageGrade = $gradedSubmissions > 0 ? round($gradesSum / $gradedSubmissions) : 0;

                // Calculate completion rate
                $completionRate = $totalAssignments > 0 ? round(($submittedAssignments / $totalAssignments) * 100) : 0;

                // Calculate statistics per subject
                $subjectStats = [];
                foreach ($filteredSubjects as $subject) {
                    $subjectAssignmentIds = Assignment::where('subject_id', $subject->id)->pluck('id');
                    $subjectSubmissions = $studentSubmissions->whereIn('assignment_id', $subjectAssignmentIds);

                    $subjectTotalAssignments = count($subjectAssignmentIds);
                    $subjectSubmittedAssignments = $subjectSubmissions->unique('assignment_id')->count();
                    $subjectGradedSubmissions = $subjectSubmissions->whereNotNull('grade')->count();

                    $subjectGradesSum = $subjectSubmissions->whereNotNull('grade')->sum('grade');
                    $subjectAverageGrade = $subjectGradedSubmissions > 0 ? round($subjectGradesSum / $subjectGradedSubmissions) : 0;

                    $subjectCompletionRate = $subjectTotalAssignments > 0 ? round(($subjectSubmittedAssignments / $subjectTotalAssignments) * 100) : 0;

                    $subjectStats[$subject->id] = [
                        'total_assignments' => $subjectTotalAssignments,
                        'submitted_assignments' => $subjectSubmittedAssignments,
                        'graded_submissions' => $subjectGradedSubmissions,
                        'average_grade' => $subjectAverageGrade,
                        'completion_rate' => $subjectCompletionRate,
                    ];
                }

                // Get student's class
                $studentClass = $student->classes->first();

                $studentsProgress->push([
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'gender' => $student->gender,
                    'class_name' => $studentClass ? $studentClass->name : '-',
                    'total_assignments' => $totalAssignments,
                    'submitted_assignments' => $submittedAssignments,
                    'graded_submissions' => $gradedSubmissions,
                    'average_grade' => $averageGrade,
                    'completion_rate' => $completionRate,
                    'subject_stats' => $subjectStats,
                ]);
            }

            // Sort students based on request
            if ($sortBy === 'average_grade') {
                $studentsProgress = $sortOrder === 'asc'
                    ? $studentsProgress->sortBy('average_grade')
                    : $studentsProgress->sortByDesc('average_grade');
            } elseif ($sortBy === 'assignment_completion') {
                $studentsProgress = $sortOrder === 'asc'
                    ? $studentsProgress->sortBy('completion_rate')
                    : $studentsProgress->sortByDesc('completion_rate');
            } elseif ($sortBy === 'class_name') {
                $studentsProgress = $sortOrder === 'asc'
                    ? $studentsProgress->sortBy('class_name')
                    : $studentsProgress->sortByDesc('class_name');
            }

            // Format classes for filter dropdown
            $formattedClasses = $classes->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                ];
            });

            // Format subjects for display
            $formattedSubjects = $filteredSubjects->map(function ($subject) {
                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'class_name' => $subject->classroom ? $subject->classroom->name : '-',
                ];
            });

            return Inertia::render('Teacher/Progress/Index', [
                'students' => $studentsProgress->values(),
                'subjects' => $formattedSubjects,
                'classes' => $formattedClasses,
                'current_class_id' => $filterClass,
                'pagination' => [
                    'total' => $students->total(),
                    'per_page' => $students->perPage(),
                    'current_page' => $students->currentPage(),
                    'last_page' => $students->lastPage(),
                    'from' => $students->firstItem(),
                    'to' => $students->lastItem(),
                ],
                'filters' => [
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                    'filter_class' => $filterClass,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher progress index: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load student progress: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display student progress for a specific subject.
     */
    public function subjectProgress($subjectId)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get the subject
            $subject = Subject::with('classroom')->findOrFail($subjectId);

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.progress.index')
                    ->with('error', 'You do not have permission to view progress for this subject.');
            }

            // Get all students in this class
            $students = Student::whereHas('classes', function ($query) use ($subject) {
                $query->where('class_id', $subject->class_id);
            })->get();

            // Get assignments for this subject
            $assignments = Assignment::where('subject_id', $subject->id)
                ->orderBy('deadline')
                ->get();

            // Get submissions for these assignments
            $submissions = AssignmentSubmission::whereIn('assignment_id', $assignments->pluck('id'))
                ->get()
                ->groupBy('student_id');

            // Process student progress data
            $studentsProgress = [];
            foreach ($students as $student) {
                // Get submissions for this student
                $studentSubmissions = $submissions->get($student->id, collect());

                // Calculate overall statistics
                $totalAssignments = $assignments->count();
                $submittedAssignments = $studentSubmissions->unique('assignment_id')->count();
                $gradedSubmissions = $studentSubmissions->filter(function ($submission) {
                    return $submission->grade !== null;
                })->count();

                // Calculate average grade (only for graded submissions)
                $gradesSum = $studentSubmissions->filter(function ($submission) {
                    return $submission->grade !== null;
                })->sum('grade');
                $averageGrade = $gradedSubmissions > 0 ? round($gradesSum / $gradedSubmissions) : 0;

                // Calculate completion rate
                $completionRate = $totalAssignments > 0 ? round(($submittedAssignments / $totalAssignments) * 100) : 0;

                // Get assignment-specific data
                $assignmentDetails = [];
                foreach ($assignments as $assignment) {
                    $submission = $studentSubmissions->first(function ($submission) use ($assignment) {
                        return $submission->assignment_id === $assignment->id;
                    });

                    $assignmentDetails[] = [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'deadline' => date('d M Y', strtotime($assignment->deadline)),
                        'has_submitted' => $submission ? true : false,
                        'submitted_at' => $submission && $submission->submitted_at
                            ? date('d M Y, H:i', strtotime($submission->submitted_at))
                            : null,
                        'is_late' => $submission && $submission->submitted_at
                            ? strtotime($submission->submitted_at) > strtotime($assignment->deadline)
                            : false,
                        'grade' => $submission ? $submission->grade : null,
                        'submission_id' => $submission ? $submission->id : null,
                    ];
                }

                $studentsProgress[] = [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                    'gender' => $student->gender,
                    'total_assignments' => $totalAssignments,
                    'submitted_assignments' => $submittedAssignments,
                    'graded_submissions' => $gradedSubmissions,
                    'average_grade' => $averageGrade,
                    'completion_rate' => $completionRate,
                    'assignment_details' => $assignmentDetails,
                ];
            }

            // Format subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_id' => $subject->class_id,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            // Format assignments data
            $formattedAssignments = $assignments->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'deadline' => date('d M Y', strtotime($assignment->deadline)),
                    'is_past_deadline' => now() > $assignment->deadline,
                ];
            });

            return Inertia::render('Teacher/Progress/Subject', [
                'subject' => $formattedSubject,
                'assignments' => $formattedAssignments,
                'students' => $studentsProgress,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher subject progress: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return redirect()->route('teacher.progress.index')->withErrors([
                'error' => 'Failed to load subject progress: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Display progress for a specific student.
     */
    public function studentProgress($studentId)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get the student
            $student = Student::with('classes')->findOrFail($studentId);

            // Get all subjects taught by this teacher
            $teacherSubjects = Subject::where('teacher_id', $teacher->id)
                ->with('classroom')
                ->get();

            // Check if the student is in any class taught by this teacher
            $studentClassIds = $student->classes->pluck('id');
            $teacherClassIds = $teacherSubjects->pluck('class_id');

            $hasAccess = $studentClassIds->intersect($teacherClassIds)->isNotEmpty();

            if (!$hasAccess) {
                return redirect()->route('teacher.progress.index')
                    ->with('error', 'You do not have permission to view progress for this student.');
            }

            // Filter subjects to only those relevant to this student
            $relevantSubjects = $teacherSubjects->filter(function ($subject) use ($studentClassIds) {
                return $studentClassIds->contains($subject->class_id);
            });

            // Get assignments for these subjects
            $assignments = Assignment::whereIn('subject_id', $relevantSubjects->pluck('id'))
                ->with('subject')
                ->orderBy('deadline')
                ->get();

            // Get submissions for these assignments
            $submissions = AssignmentSubmission::where('student_id', $student->id)
                ->whereIn('assignment_id', $assignments->pluck('id'))
                ->get();

            // Group assignments by subject
            $subjectAssignments = $assignments->groupBy('subject_id');

            // Process subject progress data
            $subjectsProgress = [];
            foreach ($relevantSubjects as $subject) {
                // Get assignments for this subject
                $subjectAssignmentList = $subjectAssignments->get($subject->id, collect());

                if ($subjectAssignmentList->isEmpty()) {
                    continue; // Skip subjects with no assignments
                }

                // Calculate statistics
                $totalAssignments = $subjectAssignmentList->count();
                $submittedAssignments = $submissions->whereIn('assignment_id', $subjectAssignmentList->pluck('id'))->unique('assignment_id')->count();
                $gradedSubmissions = $submissions->whereIn('assignment_id', $subjectAssignmentList->pluck('id'))->filter(function ($submission) {
                    return $submission->grade !== null;
                })->count();

                // Calculate average grade (only for graded submissions)
                $gradesSum = $submissions->whereIn('assignment_id', $subjectAssignmentList->pluck('id'))->filter(function ($submission) {
                    return $submission->grade !== null;
                })->sum('grade');
                $averageGrade = $gradedSubmissions > 0 ? round($gradesSum / $gradedSubmissions) : 0;

                // Calculate completion rate
                $completionRate = $totalAssignments > 0 ? round(($submittedAssignments / $totalAssignments) * 100) : 0;

                // Get assignment-specific data
                $assignmentDetails = [];
                foreach ($subjectAssignmentList as $assignment) {
                    $submission = $submissions->first(function ($submission) use ($assignment) {
                        return $submission->assignment_id === $assignment->id;
                    });

                    $assignmentDetails[] = [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'deadline' => date('d M Y', strtotime($assignment->deadline)),
                        'has_submitted' => $submission ? true : false,
                        'submitted_at' => $submission && $submission->submitted_at
                            ? date('d M Y, H:i', strtotime($submission->submitted_at))
                            : null,
                        'is_late' => $submission && $submission->submitted_at
                            ? strtotime($submission->submitted_at) > strtotime($assignment->deadline)
                            : false,
                        'grade' => $submission ? $submission->grade : null,
                        'submission_id' => $submission ? $submission->id : null,
                    ];
                }

                $subjectsProgress[] = [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'class_name' => $subject->classroom ? $subject->classroom->name : '-',
                    'total_assignments' => $totalAssignments,
                    'submitted_assignments' => $submittedAssignments,
                    'graded_submissions' => $gradedSubmissions,
                    'average_grade' => $averageGrade,
                    'completion_rate' => $completionRate,
                    'assignment_details' => $assignmentDetails,
                ];
            }

            // Get attendance statistics
            $attendanceStats = [];

            // Mendapatkan semester saat ini
            $currentSemesterId = DB::table('semesters_students')
                ->where('students_id', $student->id)
                ->orderBy('created_at', 'desc')
                ->value('semesters_id');

            if ($currentSemesterId) {
                // Ambil semua sesi kehadiran di semester ini
                $sessions = DB::table('attendance_sessions')
                    ->where('semester_id', $currentSemesterId)
                    ->get();

                if (!$sessions->isEmpty()) {
                    // Get attendance records for this student
                    $attendanceRecords = DB::table('attendances')
                        ->whereIn('attendance_sessions_id', $sessions->pluck('id'))
                        ->where('student_id', $student->id)
                        ->get();

                    // Statistik kehadiran secara keseluruhan (bukan per subjek)
                    $totalSessions = $sessions->count();
                    $presentCount = $attendanceRecords->where('status', 'hadir')->count();
                    $absentCount = $attendanceRecords->where('status', 'alpha')->count();
                    $excusedCount = $attendanceRecords->whereIn('status', ['izin', 'sakit'])->count();
                    $attendanceRate = $totalSessions > 0 ? round(($presentCount / $totalSessions) * 100) : 0;

                    // Simpan dalam format yang kompatibel dengan UI
                    // Menggunakan 'overall' sebagai kunci, bukan subject_id
                    $attendanceStats['overall'] = [
                        'total_sessions' => $totalSessions,
                        'present_count' => $presentCount,
                        'absent_count' => $absentCount,
                        'excused_count' => $excusedCount,
                        'attendance_rate' => $attendanceRate,
                    ];
                }
            }

            // Format student data
            $formattedStudent = [
                'id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
                'gender' => $student->gender,
                'classes' => $student->classes->map(function ($class) {
                    return [
                        'id' => $class->id,
                        'name' => $class->name,
                    ];
                }),
            ];

            // Calculate overall statistics
            $overallStats = [
                'total_assignments' => $assignments->count(),
                'submitted_assignments' => $submissions->unique('assignment_id')->count(),
                'graded_submissions' => $submissions->filter(function ($submission) {
                    return $submission->grade !== null;
                })->count(),
                'average_grade' => $submissions->filter(function ($submission) {
                    return $submission->grade !== null;
                })->count() > 0
                    ? round($submissions->filter(function ($submission) {
                        return $submission->grade !== null;
                    })->sum('grade') / $submissions->filter(function ($submission) {
                        return $submission->grade !== null;
                    })->count())
                    : 0,
                'completion_rate' => $assignments->count() > 0
                    ? round(($submissions->unique('assignment_id')->count() / $assignments->count()) * 100)
                    : 0,
            ];

            return Inertia::render('Teacher/Progress/Student', [
                'student' => $formattedStudent,
                'subjects' => $subjectsProgress,
                'attendance_stats' => $attendanceStats,
                'overall_stats' => $overallStats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher student progress: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return redirect()->route('teacher.progress.index')->withErrors([
                'error' => 'Failed to load student progress: ' . $e->getMessage()
            ]);
        }
    }
}
