<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Material extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'subject_id',
        'title',
        'content',
        'file_path',
        'file_type',
    ];

    /**
     * Get the subject that the material belongs to.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Check if material has a file.
     */
    public function hasFile()
    {
        return !empty($this->file_path);
    }

    /**
     * Get the teacher who created the material through the subject.
     */
    public function teacher()
    {
        return $this->subject->teacher;
    }

    /**
     * Get the class that the material belongs to through the subject.
     */
    public function class()
    {
        return $this->subject->class;
    }
}
