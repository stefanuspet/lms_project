<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'thread_id',
        'user_id',
        'parent_reply_id',
        'body',
    ];

    public function thread()
    {
        return $this->belongsTo(DiscussionThread::class, 'thread_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(DiscussionReply::class, 'parent_reply_id');
    }

    public function children()
    {
        return $this->hasMany(DiscussionReply::class, 'parent_reply_id');
    }
}

