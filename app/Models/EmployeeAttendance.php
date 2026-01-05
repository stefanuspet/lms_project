<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'check_in_at',
        'check_out_at',
        'status',
        'latitude',
        'longitude',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

