<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Semester extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'academic_year_id',
        'name',
        'start_date',
        'end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the students for the semester.
     */
    public function students()
    {
        return $this->belongsToMany(Student::class, 'semesters_students', 'semesters_id', 'students_id')
            ->withPivot('class_id')
            ->withTimestamps();
    }

    /**
     * Get the classes for the semester.
     */
    public function classes()
    {
        return $this->belongsToMany(Classroom::class, 'semesters_students', 'semesters_id', 'class_id')
            ->withPivot('students_id')
            ->withTimestamps();
    }

    /**
     * Get the attendance sessions for the semester.
     */
    public function attendanceSessions()
    {
        return $this->hasMany(AttendanceSession::class, 'semester_id');
    }

    /**
     * Get the teacher subjects for the semester.
     */
    public function teacherSubjects()
    {
        return $this->hasMany(TeacherSubject::class, 'semester_id');
    }

    /**
     * Check if semester is active.
     */
    public function isActive()
    {
        $now = now();
        return $now->between($this->start_date, $this->end_date);
    }

    /**
     * Get schedules within this semester.
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Academic year relationship.
     */
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
