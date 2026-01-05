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
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke semesters (jika nanti semester dihubungkan dengan tahun ajaran).
     */
    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }

    /**
     * Scope helper untuk mengambil tahun ajaran aktif.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
