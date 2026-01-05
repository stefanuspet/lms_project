<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_id',
        'subject_id',
        'teacher_id',
        'semester_id',
        'day_of_week',
        'start_time',
        'end_time',
        'room',
        'meeting_link',
        'notes',
    ];

    /**
     * Class that owns the schedule entry.
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    /**
     * Subject taught in this schedule entry.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function extracurricular()
    {
        return $this->belongsTo(Extracurricular::class);
    }

    /**
     * Teacher responsible for this slot.
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Semester for this schedule entry (optional for legacy data).
     */
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Filter by day of week.
     */
    public function scopeForDay($query, $day)
    {
        if (!empty($day)) {
            return $query->where('day_of_week', $day);
        }
    }

    /**
     * Filter by class id.
     */
    public function scopeForClass($query, $classId)
    {
        if (!empty($classId)) {
            return $query->where('class_id', $classId);
        }
    }

    /**
     * Filter by teacher id.
     */
    public function scopeForTeacher($query, $teacherId)
    {
        if (!empty($teacherId)) {
            return $query->where('teacher_id', $teacherId);
        }
    }

    /**
     * Filter by semester id.
     */
    public function scopeForSemester($query, $semesterId)
    {
        if (!empty($semesterId)) {
            return $query->where('semester_id', $semesterId);
        }
    }
}
