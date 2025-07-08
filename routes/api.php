<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\GradeController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\SemesterController;
use App\Http\Controllers\API\ClassroomController;
use App\Http\Controllers\API\DashboardController;
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

// Protected routes for authenticated students
Route::middleware(['auth:sanctum', 'student'])->group(function () {
    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/subjects', [DashboardController::class, 'subjects']);
    Route::get('/assignments/upcoming', [DashboardController::class, 'upcomingAssignments']);
    Route::get('/materials/recent', [DashboardController::class, 'recentMaterials']);

    // Attendance routes
    Route::prefix('attendance')->group(function () {
        Route::post('/submit', [AttendanceController::class, 'submit']);
        Route::get('/history', [AttendanceController::class, 'history']);
        Route::get('/history/{semester_id}', [AttendanceController::class, 'historySemester']);
    });

    // Grade routes
    Route::prefix('grades')->group(function () {
        Route::get('/', [GradeController::class, 'index']);
        Route::get('/subjects/{subject_id}', [GradeController::class, 'bySubject']);
        Route::get('/assignments/{assignment_id}', [GradeController::class, 'assignmentDetail']);
    });

    // Semester routes
    Route::prefix('semesters')->group(function () {
        Route::get('/', [SemesterController::class, 'index']);
        Route::get('/{id}', [SemesterController::class, 'show']);
    });

    // Class routes
    Route::prefix('classes')->group(function () {
        Route::get('/current', [ClassroomController::class, 'current']);
        Route::get('/{id}', [ClassroomController::class, 'show']);
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::get('/recent', [NotificationController::class, 'recent']);
        Route::get('/{notification}', [NotificationController::class, 'show']);
        Route::post('/mark-as-read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
        Route::delete('/', [NotificationController::class, 'destroyMultiple']);
    });
});
