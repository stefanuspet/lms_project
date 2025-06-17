<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login'); // Render langsung halaman login
});

Route::middleware(['auth'])->group(function () {
    Route::get('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});


Route::prefix('admin')->middleware(['auth', 'role:admin'])->name("admin.")->group(function () {
    Route::get('dashboard', [AdminController::class, 'index'])->name('dashboard');

    // Teacher routes - CRUD lengkap
    Route::get('teachers', [TeacherController::class, 'index'])->name('teachers.index');
    Route::get('teachers/create', [TeacherController::class, 'create'])->name('teachers.create');
    Route::post('teachers/store', [TeacherController::class, 'store'])->name('teachers.store');

    // Route tambahan untuk operasi CRUD lengkap
    Route::get('teachers/{teacher}', [TeacherController::class, 'show'])->name('teachers.show');        // Untuk melihat detail guru
    Route::get('teachers/{teacher}/edit', [TeacherController::class, 'edit'])->name('teachers.edit');   // Untuk menampilkan form edit
    Route::put('teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');    // Untuk menyimpan perubahan
    Route::delete('teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.destroy'); // Untuk menghapus guru

    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::get('/students/create', [StudentController::class, 'create'])->name('students.create');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    Route::get('/students/{student}', [StudentController::class, 'show'])->name('students.show');
    Route::get('/students/{student}/edit', [StudentController::class, 'edit'])->name('students.edit');
    Route::put('/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

    // Fitur tambahan
    Route::post('/students/bulk-delete', [StudentController::class, 'bulkDelete'])->name('students.bulk-delete');
    Route::post('/students/export', [StudentController::class, 'export'])->name('students.export');
    Route::get('/students/search/autocomplete', [StudentController::class, 'searchAutocomplete'])->name('students.search.autocomplete');

    // CRUD Dasar
    Route::get('/semesters', [SemesterController::class, 'index'])->name('semesters.index');
    Route::get('/semesters/create', [SemesterController::class, 'create'])->name('semesters.create');
    Route::post('/semesters', [SemesterController::class, 'store'])->name('semesters.store');
    Route::get('/semesters/{semester}', [SemesterController::class, 'show'])->name('semesters.show');
    Route::get('/semesters/{semester}/edit', [SemesterController::class, 'edit'])->name('semesters.edit');
    Route::put('/semesters/{semester}', [SemesterController::class, 'update'])->name('semesters.update');
    Route::delete('/semesters/{semester}', [SemesterController::class, 'destroy'])->name('semesters.destroy');

    // Fitur tambahan
    Route::post('/semesters/{semester}/set-active', [SemesterController::class, 'setActive'])->name('semesters.set-active');

    Route::get('/enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
    Route::post('/enrollments/enroll', [EnrollmentController::class, 'enroll'])->name('enrollments.enroll');
    Route::post('/enrollments/unenroll', [EnrollmentController::class, 'unenroll'])->name('enrollments.unenroll');
    Route::post('/enrollments/move-class', [EnrollmentController::class, 'moveClass'])->name('enrollments.move-class');
    Route::post('/enrollments/promote', [EnrollmentController::class, 'promote'])->name('enrollments.promote');
    Route::get('/enrollments/history/{student}', [EnrollmentController::class, 'studentHistory'])->name('enrollments.history');

    // Subject routes
    Route::get('/subject', [SubjectController::class, 'index'])->name('subjects.index');
    Route::get('/subject/create', [SubjectController::class, 'create'])->name('subjects.create');
    Route::post('/subject', [SubjectController::class, 'store'])->name('subjects.store');
    Route::get('/subject/{subject}', [SubjectController::class, 'show'])->name('subjects.show');
    Route::get('/subject/{subject}/edit', [SubjectController::class, 'edit'])->name('subjects.edit');
    Route::put('/subject/{subject}', [SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('/subject/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');

    // Additional subject features
    // Route::post('/subjects/bulk-delete', [SubjectController::class, 'bulkDelete'])->name('subjects.bulk-delete');

    Route::get('/classrooms', [ClassroomController::class, 'index'])->name('classrooms.index');
    Route::get('/classrooms/create', [ClassroomController::class, 'create'])->name('classrooms.create');
    Route::post('/classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
    Route::get('/classrooms/{classroom}', [ClassroomController::class, 'show'])->name('classrooms.show');
    Route::get('/classrooms/{classroom}/edit', [ClassroomController::class, 'edit'])->name('classrooms.edit');
    Route::put('/classrooms/{classroom}', [ClassroomController::class, 'update'])->name('classrooms.update');
    Route::delete('/classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');

    // Additional classroom operations
    Route::post('/classrooms/bulk-delete', [ClassroomController::class, 'bulkDelete'])->name('classrooms.bulk-delete');
    Route::post('/classrooms/{classroom}/add-students', [ClassroomController::class, 'addStudents'])->name('classrooms.add-students');
    Route::post('/classrooms/{classroom}/remove-students', [ClassroomController::class, 'removeStudents'])->name('classrooms.remove-students');
    Route::get('/classrooms/search/students', [ClassroomController::class, 'searchStudents'])->name('classrooms.search-students');



    // Attendance routes for admin
    Route::prefix('attendance')->name('attendance.')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->name('index');
        Route::get('/create', [AttendanceController::class, 'create'])->name('create');
        Route::post('/', [AttendanceController::class, 'store'])->name('store');
        Route::get('/reports', [AttendanceController::class, 'reports'])->name('reports');
        Route::post('/export-report', [AttendanceController::class, 'exportReport'])->name('export-report');
        Route::get('/{session}', [AttendanceController::class, 'show'])->name('show');
        Route::post('/{session}/update-attendance', [AttendanceController::class, 'updateAttendance'])->name('update-attendance');
        Route::post('/{session}/extend', [AttendanceController::class, 'extendSession'])->name('extend-session');
        Route::post('/{session}/close', [AttendanceController::class, 'closeSession'])->name('close-session');
        Route::get('/class/{classId}/subjects', [AttendanceController::class, 'getSubjectsForClass'])->name('get-subjects-for-class');
    });

    // Attendance routes for students
    // Route::prefix('student/attendance')->name('student.attendance.')->middleware(['auth', 'role:siswa'])->group(function () {
    //     Route::get('/', [StudentAttendanceController::class, 'index'])->name('index');
    //     Route::post('/submit', [StudentAttendanceController::class, 'submit'])->name('submit');
    //     Route::get('/history', [StudentAttendanceController::class, 'history'])->name('history');
    // });

    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', [ActivityLogController::class, 'index'])->name('index');
        Route::post('/clear-old', [ActivityLogController::class, 'clearOldLogs'])->name('clear-old');
        Route::post('/export', [ActivityLogController::class, 'export'])->name('export');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
