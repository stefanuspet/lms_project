<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\GradeController;
use App\Http\Controllers\API\SemesterController;
use App\Http\Controllers\API\ClassroomController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Endpoint autentikasi
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes - memerlukan autentikasi
    Route::middleware(['auth:sanctum', 'student'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'profile']);
    });
});

// Endpoint Absensi
Route::middleware(['auth:sanctum', 'student'])->prefix('attendance')->group(function () {
    Route::post('/submit', [AttendanceController::class, 'submit']);
    Route::get('/history', [AttendanceController::class, 'history']);
    Route::get('/history/{semester_id}', [AttendanceController::class, 'historySemester']);
});

// Endpoint Nilai
Route::middleware(['auth:sanctum', 'student'])->prefix('grades')->group(function () {
    Route::get('/', [GradeController::class, 'index']);
    Route::get('/subjects/{subject_id}', [GradeController::class, 'bySubject']);
    Route::get('/assignments/{assignment_id}', [GradeController::class, 'assignmentDetail']);
});

// Endpoint Semester
Route::middleware(['auth:sanctum', 'student'])->prefix('semesters')->group(function () {
    Route::get('/', [SemesterController::class, 'index']);
    Route::get('/{id}', [SemesterController::class, 'show']);
});

// Endpoint Kelas
Route::middleware(['auth:sanctum', 'student'])->prefix('classes')->group(function () {
    Route::get('/current', [ClassroomController::class, 'current']);
    Route::get('/{id}', [ClassroomController::class, 'show']);
});
