<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'attendance_sessions_id',
        'student_id',
        'status',
        'submitted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the session that owns the attendance.
     */
    public function session()
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_sessions_id');
    }

    /**
     * Get the student that owns the attendance.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Scope a query to only include present attendances.
     */
    public function scopePresent($query)
    {
        return $query->where('status', 'hadir');
    }

    /**
     * Scope a query to only include sick attendances.
     */
    public function scopeSick($query)
    {
        return $query->where('status', 'sakit');
    }

    /**
     * Scope a query to only include excused attendances.
     */
    public function scopeExcused($query)
    {
        return $query->where('status', 'izin');
    }

    /**
     * Scope a query to only include absent attendances.
     */
    public function scopeAbsent($query)
    {
        return $query->where('status', 'alpha');
    }
}
