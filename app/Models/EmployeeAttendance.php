<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class EmployeeAttendance extends Model
{
    use HasFactory;

    /**
     * Table name (opsional, tapi aman)
     */
    protected $table = 'employee_attendances';

    /**
     * Mass assignable fields
     */
    protected $fillable = [
        'user_id',
        'date',
        'check_in_at',
        'check_out_at',
        'status',
        'latitude',
        'longitude',
        'notes',
    ];

    /**
     * Cast attributes
     */
    protected $casts = [
        'date' => 'date',
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
    ];

    /* =====================================================
     |  RELATIONSHIPS
     ===================================================== */

    /**
     * Attendance belongs to a user (guru / staff / security)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /* =====================================================
     |  SCOPES (BIAR QUERY ENAK)
     ===================================================== */

    public function scopeToday(Builder $query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeMonth(Builder $query, int $month, int $year)
    {
        return $query
            ->whereMonth('date', $month)
            ->whereYear('date', $year);
    }

    public function scopeHadir(Builder $query)
    {
        return $query->where('status', 'hadir');
    }

    public function scopeAlpha(Builder $query)
    {
        return $query->where('status', 'alpha');
    }

    public function scopeIzin(Builder $query)
    {
        return $query->where('status', 'izin');
    }

    public function scopeSakit(Builder $query)
    {
        return $query->where('status', 'sakit');
    }

    /* =====================================================
     |  HELPERS (LOGIC KECIL TAPI BERGUNA)
     ===================================================== */

    /**
     * Check apakah sudah check-in
     */
    public function hasCheckedIn(): bool
    {
        return !is_null($this->check_in_at);
    }

    /**
     * Check apakah sudah check-out
     */
    public function hasCheckedOut(): bool
    {
        return !is_null($this->check_out_at);
    }

    /**
     * Durasi kerja (menit)
     */
    public function workDurationInMinutes(): ?int
    {
        if (!$this->check_in_at || !$this->check_out_at) {
            return null;
        }

        return $this->check_in_at->diffInMinutes($this->check_out_at);
    }

    /**
     * Auto set alpha jika tidak check-in
     */
    public function markAlphaIfAbsent(): void
    {
        if (!$this->check_in_at && $this->status === 'hadir') {
            $this->update(['status' => 'alpha']);
        }
    }
}
