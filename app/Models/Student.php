<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'nisn',
        'gender',
        'birth_date',
        'birth_place',
        'profile_picture',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    /**
     * Get the user that owns the student.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the classes for the student.
     * Through the semesters_students pivot table.
     */
    public function classes()
    {
        return $this->belongsToMany(Classroom::class, 'semesters_students', 'students_id', 'class_id')
            ->withPivot('semesters_id')
            ->withTimestamps();
    }

    /**
     * Get the semesters for the student.
     */
    public function semesters()
    {
        return $this->belongsToMany(Semester::class, 'semesters_students', 'students_id', 'semesters_id')
            ->withPivot('class_id')
            ->withTimestamps();
    }

    /**
     * Get assignment submissions for the student.
     */
    public function assignmentSubmissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    /**
     * Get attendances for the student.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Search students by name, nisn, or email.
     */
    public function scopeSearch($query, $search)
    {
        if (!empty($search)) {
            return $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%")
                    ->orWhere('birth_place', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('email', 'like', "%{$search}%");
                    });
            });
        }
    }

    /**
     * Filter students by gender.
     */
    public function scopeFilterByGender($query, $gender)
    {
        if (!empty($gender)) {
            return $query->where('gender', $gender);
        }
    }

    /**
     * Filter students by class.
     */
    public function scopeFilterByClass($query, $classId)
    {
        if (!empty($classId)) {
            return $query->whereHas('classes', function ($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }
    }

    /**
     * Filter students by semester.
     */
    public function scopeFilterBySemester($query, $semesterId)
    {
        if (!empty($semesterId)) {
            return $query->whereHas('semesters', function ($q) use ($semesterId) {
                $q->where('semesters_id', $semesterId);
            });
        }
    }

    /**
     * Check if student is enrolled in specific class.
     */
    public function isEnrolledIn($classId, $semesterId = null)
    {
        $query = $this->classes()->where('class_id', $classId);

        if ($semesterId) {
            $query->where('semesters_id', $semesterId);
        }

        return $query->exists();
    }

    /**
     * Get class enrollments for a specific semester.
     */
    public function getClassesForSemester($semesterId)
    {
        return $this->classes()
            ->wherePivot('semesters_id', $semesterId)
            ->get();
    }

    /**
     * Get student performance metrics (attendance, assignments, etc).
     */
    public function getPerformanceMetrics()
    {
        // Tingkat kehadiran (persentase)
        $totalAttendanceSessions = $this->attendances()->count();
        $presentAttendances = $this->attendances()->where('status', 'hadir')->count();
        $attendanceRate = $totalAttendanceSessions > 0
            ? round(($presentAttendances / $totalAttendanceSessions) * 100, 2)
            : 0;

        // Nilai rata-rata tugas
        $completedAssignments = $this->assignmentSubmissions()->whereNotNull('grade')->count();
        $averageGrade = $this->assignmentSubmissions()->whereNotNull('grade')->avg('grade') ?? 0;

        // Jumlah tugas terlambat
        $lateSubmissions = $this->assignmentSubmissions()
            ->whereRaw('submitted_at > assignments.deadline')
            ->join('assignments', 'assignment_submissions.assignment_id', '=', 'assignments.id')
            ->count();

        return [
            'attendance_rate' => $attendanceRate,
            'completed_assignments' => $completedAssignments,
            'average_grade' => round($averageGrade, 2),
            'late_submissions' => $lateSubmissions,
        ];
    }
}
