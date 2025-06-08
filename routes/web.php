<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\StudentController;
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
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
