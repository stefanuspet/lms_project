<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


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
     * Get the class that the subject belongs to.
     */
    public function class()
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    /**
     * Get the teacher that created the subject.
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
     * Get the teachers assigned to the subject through teacher_subjects.
     */
    public function assignedTeachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_subjects')
            ->withPivot('semester_id')
            ->withTimestamps();
    }

    /**
     * Get the semesters the subject is taught in.
     */
    public function semesters()
    {
        return $this->belongsToMany(Semester::class, 'teacher_subjects')
            ->withPivot('teacher_id')
            ->withTimestamps();
    }
}
