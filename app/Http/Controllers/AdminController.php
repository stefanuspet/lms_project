<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $studentsCount = Student::count();
        $teachersCount = Teacher::count();
        $boysCount = Student::where('gender', 'male')->count();
        $girlsCount = Student::where('gender', 'female')->count();

        return Inertia::render(
            'Admin/Dashboard',
            [
                'studentsCount' => $studentsCount,
                'teachersCount' => $teachersCount,
                'boysCount' => $boysCount,
                'girlsCount' => $girlsCount
            ]
        );
    }
}
