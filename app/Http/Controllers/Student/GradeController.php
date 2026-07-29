<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Subject;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GradeController extends Controller
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
                return Inertia::render('Student/Grade/Index', [
                    'grade_summary' => [],
                    'subjects' => [],
                    'recent_grades' => []
                ]);
            }
            
            $currentClassId = $currentSemesterStudent->class_id;
            $currentSemesterId = $currentSemesterStudent->semesters_id;
            
            // Get subjects for this student's class
            $subjects = DB::table('subjects')
                ->join('teachers', 'subjects.teacher_id', '=', 'teachers.id')
                ->where('subjects.class_id', $currentClassId)
                ->select(
                    'subjects.id',
                    'subjects.name',
                    'subjects.description',
                    'teachers.name as teacher_name'
                )
                ->get();
            
            $subjectIds = $subjects->pluck('id')->toArray();
            
            // Get graded assignments for each subject
            $subjectsWithGrades = [];
            $totalAssignments = 0;
            $totalGradedAssignments = 0;
            $sumGrades = 0;
            
            foreach ($subjects as $subject) {
                // Get assignments for this subject scoped to current semester
                $assignments = DB::table('assignments')
                    ->where('subject_id', $subject->id)
                    ->where('semester_id', $currentSemesterId)
                    ->get();

                $assignmentIds = $assignments->pluck('id')->toArray();
                $totalAssignments += count($assignmentIds);

                // Get submissions for this student
                $submissions = DB::table('assignment_submissions')
                    ->whereIn('assignment_id', $assignmentIds)
                    ->where('student_id', $student->id)
                    ->whereNotNull('grade')
                    ->get();
                
                $gradedCount = $submissions->count();
                $totalGradedAssignments += $gradedCount;
                
                // Calculate average grade
                $sumSubjectGrades = $submissions->sum('grade');
                $sumGrades += $sumSubjectGrades;
                
                $averageGrade = $gradedCount > 0 ? round($sumSubjectGrades / $gradedCount, 1) : null;
                
                $subjectsWithGrades[] = [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'teacher_name' => $subject->teacher_name,
                    'total_assignments' => count($assignmentIds),
                    'graded_assignments' => $gradedCount,
                    'average_grade' => $averageGrade,
                    'highest_grade' => $gradedCount > 0 ? $submissions->max('grade') : null,
                    'lowest_grade' => $gradedCount > 0 ? $submissions->min('grade') : null,
                ];
            }
            
            // Calculate overall average
            $overallAverage = $totalGradedAssignments > 0 ? round($sumGrades / $totalGradedAssignments, 1) : null;
            
            // Get grade summary
            $gradeSummary = [
                'total_subjects' => count($subjects),
                'total_assignments' => $totalAssignments,
                'graded_assignments' => $totalGradedAssignments,
                'average_grade' => $overallAverage,
            ];
            
            // Get recent grades — scoped to current semester
            $recentGrades = DB::table('assignment_submissions')
                ->join('assignments', 'assignment_submissions.assignment_id', '=', 'assignments.id')
                ->join('subjects', 'assignments.subject_id', '=', 'subjects.id')
                ->where('assignment_submissions.student_id', $student->id)
                ->where('assignments.semester_id', $currentSemesterId)
                ->whereNotNull('assignment_submissions.grade')
                ->select(
                    'assignment_submissions.id',
                    'assignment_submissions.grade',
                    'assignment_submissions.message_eval',
                    'assignment_submissions.updated_at',
                    'assignments.id as assignment_id',
                    'assignments.title as assignment_title',
                    'subjects.id as subject_id',
                    'subjects.name as subject_name'
                )
                ->orderBy('assignment_submissions.updated_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($grade) {
                    return [
                        'id' => $grade->id,
                        'assignment_id' => $grade->assignment_id,
                        'assignment_title' => $grade->assignment_title,
                        'subject_id' => $grade->subject_id,
                        'subject_name' => $grade->subject_name,
                        'grade' => $grade->grade,
                        'feedback' => $grade->message_eval,
                        'graded_at' => date('d M Y', strtotime($grade->updated_at)),
                    ];
                });
            
            return Inertia::render('Student/Grade/Index', [
                'grade_summary' => $gradeSummary,
                'subjects' => $subjectsWithGrades,
                'recent_grades' => $recentGrades
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in student grades index: ' . $e->getMessage());
            
            return redirect()->back()->withErrors([
                'error' => 'Failed to load grades data: ' . $e->getMessage()
            ]);
        }
    }
    
    public function subjectGrades(Subject $subject)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();
            
            // Check if student has access to this subject
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();
                
            if (!$currentSemesterStudent || $subject->class_id != $currentSemesterStudent->class_id) {
                return redirect()->route('student.grades.index')
                    ->with('error', 'You do not have access to this subject.');
            }
            
            // Get subject details
            $subjectDetails = [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                'teacher_name' => $subject->teacher ? $subject->teacher->name : 'Unknown',
            ];
            
            // Get assignments for this subject scoped to current semester
            $assignments = DB::table('assignments')
                ->where('subject_id', $subject->id)
                ->where('semester_id', $currentSemesterStudent->semesters_id)
                ->orderBy('deadline')
                ->get();
            
            // Get submissions for this student
            $submissions = DB::table('assignment_submissions')
                ->whereIn('assignment_id', $assignments->pluck('id')->toArray())
                ->where('student_id', $student->id)
                ->get()
                ->keyBy('assignment_id');
            
            // Format assignments with submission data
            $assignmentsWithGrades = $assignments->map(function($assignment) use ($submissions) {
                $submission = $submissions->get($assignment->id);
                
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'deadline' => date('d M Y', strtotime($assignment->deadline)),
                    'has_submission' => $submission ? true : false,
                    'submission_id' => $submission ? $submission->id : null,
                    'grade' => $submission && $submission->grade !== null ? $submission->grade : null,
                    'feedback' => $submission ? $submission->message_eval : null,
                    'submitted_at' => $submission && $submission->submitted_at 
                        ? date('d M Y', strtotime($submission->submitted_at)) 
                        : null,
                    'is_late' => $submission && $submission->submitted_at 
                        ? strtotime($submission->submitted_at) > strtotime($assignment->deadline) 
                        : false,
                ];
            });
            
            // Calculate grade statistics
            $gradedAssignments = $assignmentsWithGrades->filter(function($assignment) {
                return $assignment['grade'] !== null;
            });
            
            $totalAssignments = $assignments->count();
            $totalGraded = $gradedAssignments->count();
            $averageGrade = $totalGraded > 0 
                ? round($gradedAssignments->sum('grade') / $totalGraded, 1) 
                : null;
            $highestGrade = $totalGraded > 0 
                ? $gradedAssignments->max('grade') 
                : null;
            $lowestGrade = $totalGraded > 0 
                ? $gradedAssignments->min('grade') 
                : null;
            
            $gradeStatistics = [
                'total_assignments' => $totalAssignments,
                'graded_assignments' => $totalGraded,
                'average_grade' => $averageGrade,
                'highest_grade' => $highestGrade,
                'lowest_grade' => $lowestGrade,
            ];
            
            return Inertia::render('Student/Grade/SubjectGrades', [
                'subject' => $subjectDetails,
                'assignments' => $assignmentsWithGrades,
                'grade_statistics' => $gradeStatistics,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in student subject grades: ' . $e->getMessage());
            
            return redirect()->route('student.grades.index')
                ->with('error', 'Failed to load subject grades: ' . $e->getMessage());
        }
    }
}