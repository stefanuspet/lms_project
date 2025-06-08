<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Classroom extends Model
{
    use HasFactory;

    protected $table = 'classes';
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the subjects for the class.
     */
    public function subjects()
    {
        return $this->hasMany(Subject::class, 'class_id');
    }

    /**
     * Get the students for the class through semesters_students.
     */
    public function students()
    {
        return $this->belongsToMany(Student::class, 'semesters_students', 'class_id', 'students_id');
    }

    /**
     * Get the semesters for the class through semesters_students.
     */
    public function semesters()
    {
        return $this->belongsToMany(Semester::class, 'semesters_students', 'class_id', 'semesters_id');
    }

    /**
     * Get a specific semester associated with this class.
     * This is useful when you need to get semester data for a specific class.
     */
    public function semester()
    {
        return $this->belongsToMany(Semester::class, 'semesters_students', 'class_id', 'semesters_id')
            ->withPivot(['students_id'])
            ->orderBy('start_date', 'desc');
    }
}
