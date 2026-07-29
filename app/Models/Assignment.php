<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Assignment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'subject_id',
        'semester_id',
        'title',
        'description',
        'file_path',
        'deadline',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'deadline' => 'datetime',
    ];

    /**
     * Get the subject that the assignment belongs to.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the submissions for the assignment.
     */
    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    /**
     * Check if assignment has a file.
     */
    public function hasFile()
    {
        return !empty($this->file_path);
    }

    /**
     * Check if assignment deadline has passed.
     */
    public function isOverdue()
    {
        return now()->gt($this->deadline);
    }

    /**
     * Get the teacher who created the assignment through the subject.
     */
    public function teacher()
    {
        return $this->subject->teacher;
    }

    /**
     * Get the class that the assignment belongs to through the subject.
     */
    public function class()
    {
        return $this->subject->class;
    }
}
