<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionThread extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'semester_id',
        'class_id',
        'created_by',
        'title',
        'body',
        'is_pinned',
        'is_closed',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class, 'class_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function replies()
    {
        return $this->hasMany(DiscussionReply::class, 'thread_id');
    }
}

