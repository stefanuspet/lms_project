<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class AssignmentSubmission extends Model
{
    use HasFactory;
    protected $table = 'assignment_submissions';


    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'assignment_id',
        'student_id',
        'submission_text',
        'file_path',
        'grade',
        'message_eval',
        'submitted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'submitted_at' => 'datetime',
        'grade' => 'integer',
    ];

    /**
     * Get the assignment that the submission belongs to.
     */
    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the student that made the submission.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Check if submission has been graded.
     */
    public function isGraded()
    {
        return !is_null($this->grade);
    }

    /**
     * Check if submission was submitted late.
     */
    public function isLate()
    {
        return $this->submitted_at > $this->assignment->deadline;
    }

    /**
     * Check if submission has a file.
     */
    public function hasFile()
    {
        return !empty($this->file_path);
    }
}
