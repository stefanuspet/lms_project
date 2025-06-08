<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Teacher extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'nip',
        'phone',
        'address'
    ];

    /**
     * Get the user that owns the teacher.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subjects taught by the teacher.
     */
    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    /**
     * Get the subjects assigned to the teacher through teacher_subjects.
     */
    public function assignedSubjects()
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects')
            ->withPivot('semester_id')
            ->withTimestamps();
    }

    /**
     * Get the semesters the teacher has taught.
     */
    public function semesters()
    {
        return $this->belongsToMany(Semester::class, 'teacher_subjects')
            ->withPivot('subject_id')
            ->withTimestamps();
    }
}
