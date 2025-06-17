<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'class_id',
        'teacher_id',
        'name',
        'description',
    ];

    /**
     * Get the class that owns the subject.
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    /**
     * Get the teacher that owns the subject.
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the materials for the subject.
     */
    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    /**
     * Get the assignments for the subject.
     */
    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Search subjects by name or description.
     */
    public function scopeSearch($query, $search)
    {
        if (!empty($search)) {
            return $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
    }

    /**
     * Filter subjects by class.
     */
    public function scopeFilterByClass($query, $classId)
    {
        if (!empty($classId)) {
            return $query->where('class_id', $classId);
        }
    }

    /**
     * Filter subjects by teacher.
     */
    public function scopeFilterByTeacher($query, $teacherId)
    {
        if (!empty($teacherId)) {
            return $query->where('teacher_id', $teacherId);
        }
    }
}
