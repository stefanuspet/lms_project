<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AttendanceSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'pin',
        'title',
        'description',
        'date',
        'semester_id',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the semester that owns the attendance session.
     */
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the attendances for the session.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'attendance_sessions_id');
    }

    /**
     * Check if the session is active.
     */
    public function isActive()
    {
        return Carbon::parse($this->expires_at)->isFuture();
    }

    /**
     * Get the remaining time until expiration in minutes.
     */
    public function getRemainingTimeAttribute()
    {
        $expiresAt = Carbon::parse($this->expires_at);

        if ($expiresAt->isPast()) {
            return 0;
        }

        return now()->diffInMinutes($expiresAt);
    }

    /**
     * Scope a query to only include active sessions.
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope a query to only include expired sessions.
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Get all students who have attended this session.
     */
    public function students()
    {
        return $this->belongsToMany(Student::class, 'attendances', 'attendance_sessions_id', 'student_id')
            ->withPivot('status', 'submitted_at')
            ->withTimestamps();
    }
}
