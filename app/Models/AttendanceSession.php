<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


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
     * Get the semester that the attendance session belongs to.
     */
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the attendance records for the session.
     */
    public function attendanceRecords()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Check if attendance session is active.
     */
    public function isActive()
    {
        return now()->lt($this->expires_at);
    }

    /**
     * Generate a random PIN.
     */
    public static function generatePin()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
