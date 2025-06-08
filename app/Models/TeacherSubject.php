<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class TeacherSubject extends Model
{
    use HasFactory;
    protected $table = 'teachers_subjects';


    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'teacher_id',
        'subject_id',
        'semester_id',
    ];

    /**
     * Get the teacher that the teacher subject belongs to.
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Get the subject that the teacher subject belongs to.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the semester that the teacher subject belongs to.
     */
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }
}
