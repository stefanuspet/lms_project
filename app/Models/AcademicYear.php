<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    /**
     * is_active dihitung otomatis dari tanggal, bukan dari kolom DB.
     * Kolom is_active di DB tidak lagi digunakan untuk pembacaan.
     */
    public function getIsActiveAttribute(): bool
    {
        return now()->between($this->start_date, $this->end_date);
    }

    /**
     * Relasi ke semesters.
     */
    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }

    /**
     * Scope untuk tahun ajaran yang sedang aktif berdasarkan tanggal.
     */
    public function scopeActive($query)
    {
        return $query->where('start_date', '<=', now())
                     ->where('end_date', '>=', now());
    }
}
