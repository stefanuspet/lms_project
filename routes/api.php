<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\GradeController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\SemesterController;
use App\Http\Controllers\API\ClassroomController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\ScheduleController;
use App\Http\Controllers\API\QuizController as ApiQuizController;
use App\Http\Controllers\API\ExtracurricularController as ApiExtracurricularController;
use App\Http\Controllers\API\StudentAssignmentController;
use App\Http\Controllers\API\StudentSubmissionController;
use App\Http\Controllers\API\StudentMaterialController;
use App\Http\Controllers\API\StudentDiscussionController;
use App\Http\Controllers\API\StudentSubjectController;
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
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
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

    // Assignment routes (student-side)
    Route::prefix('assignments')->group(function () {
        Route::get('/', [StudentAssignmentController::class, 'index']);
        Route::get('/{assignment}', [StudentAssignmentController::class, 'show']);
        Route::post('/{assignment}/submit', [StudentSubmissionController::class, 'store']);
    });

    // Material routes (student-side)
    Route::prefix('materials')->group(function () {
        Route::get('/', [StudentMaterialController::class, 'index']);
        Route::get('/{material}', [StudentMaterialController::class, 'show']);
    });

    // Discussion routes (student-side)
    Route::prefix('subjects/{subject}')->group(function () {
        Route::get('/detail', [StudentSubjectController::class, 'show']);
        Route::get('/discussions', [StudentDiscussionController::class, 'index']);
        Route::post('/discussions', [StudentDiscussionController::class, 'store']);
        Route::get('/discussions/{thread}', [StudentDiscussionController::class, 'show']);
        Route::post('/discussions/{thread}/reply', [StudentDiscussionController::class, 'reply']);
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

    // Schedule routes
    Route::get('/schedules', [ScheduleController::class, 'index']);

    // Quiz routes
    Route::get('/quizzes', [ApiQuizController::class, 'index']);
    Route::get('/quizzes/{quiz}', [ApiQuizController::class, 'show']);
    Route::post('/quizzes/{quiz}/submit', [ApiQuizController::class, 'submit']);

    // Extracurricular routes
    Route::get('/extracurriculars', [ApiExtracurricularController::class, 'index']);
    Route::get('/extracurriculars/{extracurricular}', [ApiExtracurricularController::class, 'show']);
});
