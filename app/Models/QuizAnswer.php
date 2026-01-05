<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_submission_id',
        'quiz_question_id',
        'quiz_question_option_id',
        'essay_answer',
        'awarded_points',
    ];

    public function submission()
    {
        return $this->belongsTo(QuizSubmission::class, 'quiz_submission_id');
    }

    public function question()
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }

    public function option()
    {
        return $this->belongsTo(QuizQuestionOption::class, 'quiz_question_option_id');
    }
}
