<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\EmployeeAttendanceControllerAdmin;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\Student\ExtracurricularController as StudentExtracurricularController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ExtracurricularController;
use App\Http\Controllers\Teacher\AttendanceController as TeacherAttendanceController;
use App\Http\Controllers\Teacher\ExtracurricularController as TeacherExtracurricularController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\WhatsAppController;
use App\Http\Controllers\Teacher\ScheduleController as TeacherScheduleController;
use App\Http\Controllers\Student\ScheduleController as StudentScheduleController;
use App\Http\Controllers\Teacher\QuizController as TeacherQuizController;
use App\Http\Controllers\Student\QuizController as StudentQuizController;
use App\Http\Controllers\Teacher\EmployeeAttendanceController;
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
    Route::get('teachers/export', [TeacherController::class, 'export'])->name('teachers.export');

    // Route tambahan untuk operasi CRUD lengkap
    Route::get('teachers/{teacher}', [TeacherController::class, 'show'])->name('teachers.show');        // Untuk melihat detail guru
    Route::get('teachers/{teacher}/edit', [TeacherController::class, 'edit'])->name('teachers.edit');   // Untuk menampilkan form edit
    // Gunakan POST (dan juga PUT) untuk update agar mudah meng-handle upload foto (FormData)
    Route::match(['post', 'put'], 'teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');    // Untuk menyimpan perubahan
    Route::delete('teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.destroy'); // Untuk menghapus guru

    // Staff routes - CRUD lengkap
    Route::get('staff', [StaffController::class, 'index'])->name('staff.index');
    Route::get('staff/create', [StaffController::class, 'create'])->name('staff.create');
    Route::post('staff', [StaffController::class, 'store'])->name('staff.store');
    Route::get('staff/export', [StaffController::class, 'export'])->name('staff.export');
    Route::get('staff/{staff}', [StaffController::class, 'show'])->name('staff.show');
    Route::get('staff/{staff}/edit', [StaffController::class, 'edit'])->name('staff.edit');
    Route::post('staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
    Route::delete('staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');

    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::get('/students/create', [StudentController::class, 'create'])->name('students.create');
    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    // Fitur tambahan yang menggunakan prefix /students harus didefinisikan SEBELUM route {student}
    Route::get('/students/export', [StudentController::class, 'export'])->name('students.export');
    Route::post('/students/bulk-delete', [StudentController::class, 'bulkDelete'])->name('students.bulk-delete');
    Route::get('/students/search/autocomplete', [StudentController::class, 'searchAutocomplete'])->name('students.search.autocomplete');

    Route::get('/students/{student}', [StudentController::class, 'show'])->name('students.show');
    Route::get('/students/{student}/edit', [StudentController::class, 'edit'])->name('students.edit');
    // Izinkan POST (dan PUT) untuk update agar mudah meng-handle upload foto (FormData)
    Route::match(['post', 'put'], '/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

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

    // Academic Year routes - CRUD
    Route::get('/academic-years', [AcademicYearController::class, 'index'])->name('academic-years.index');
    Route::get('/academic-years/create', [AcademicYearController::class, 'create'])->name('academic-years.create');
    Route::post('/academic-years', [AcademicYearController::class, 'store'])->name('academic-years.store');
    Route::get('/academic-years/{academicYear}/edit', [AcademicYearController::class, 'edit'])->name('academic-years.edit');
    Route::put('/academic-years/{academicYear}', [AcademicYearController::class, 'update'])->name('academic-years.update');
    Route::delete('/academic-years/{academicYear}', [AcademicYearController::class, 'destroy'])->name('academic-years.destroy');

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
    Route::get('/subject/export', [SubjectController::class, 'export'])->name('subjects.export');
    Route::get('/subject/{subject}/export-grades', [SubjectController::class, 'exportGrades'])->name('subjects.export-grades');
    Route::get('/subject/{subject}', [SubjectController::class, 'show'])->name('subjects.show');
    Route::get('/subject/{subject}/edit', [SubjectController::class, 'edit'])->name('subjects.edit');
    Route::put('/subject/{subject}', [SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('/subject/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');

    // Extracurricular routes - CRUD
    Route::get('/extracurriculars', [ExtracurricularController::class, 'index'])->name('extracurriculars.index');
    Route::get('/extracurriculars/create', [ExtracurricularController::class, 'create'])->name('extracurriculars.create');
    Route::post('/extracurriculars', [ExtracurricularController::class, 'store'])->name('extracurriculars.store');
    Route::get('/extracurriculars/export', [ExtracurricularController::class, 'export'])->name('extracurriculars.export');
    Route::get('/extracurriculars/{extracurricular}/edit', [ExtracurricularController::class, 'edit'])->name('extracurriculars.edit');
    Route::put('/extracurriculars/{extracurricular}', [ExtracurricularController::class, 'update'])->name('extracurriculars.update');
    Route::delete('/extracurriculars/{extracurricular}', [ExtracurricularController::class, 'destroy'])->name('extracurriculars.destroy');
    Route::get('/extracurriculars/{extracurricular}/members', [ExtracurricularController::class, 'editMembers'])->name('extracurriculars.members.edit');
    Route::post('/extracurriculars/{extracurricular}/members', [ExtracurricularController::class, 'updateMembers'])->name('extracurriculars.members.update');

    Route::get('/classrooms', [ClassroomController::class, 'index'])->name('classrooms.index');
    Route::get('/classrooms/create', [ClassroomController::class, 'create'])->name('classrooms.create');
    Route::post('/classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
    Route::get('/classrooms/export', [ClassroomController::class, 'export'])->name('classrooms.export');
    Route::get('/classrooms/{classroom}', [ClassroomController::class, 'show'])->name('classrooms.show');
    Route::get('/classrooms/{classroom}/edit', [ClassroomController::class, 'edit'])->name('classrooms.edit');
    Route::put('/classrooms/{classroom}', [ClassroomController::class, 'update'])->name('classrooms.update');
    Route::delete('/classrooms/{classroom}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');

    // Additional classroom operations
    Route::post('/classrooms/bulk-delete', [ClassroomController::class, 'bulkDelete'])->name('classrooms.bulk-delete');
    Route::post('/classrooms/{classroom}/add-students', [ClassroomController::class, 'addStudents'])->name('classrooms.add-students');
    Route::post('/classrooms/{classroom}/remove-students', [ClassroomController::class, 'removeStudents'])->name('classrooms.remove-students');
    Route::get('/classrooms/search/students', [ClassroomController::class, 'searchStudents'])->name('classrooms.search-students');

    // Schedules routes
    Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::get('/schedules/create', [ScheduleController::class, 'create'])->name('schedules.create');
    Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');
    Route::get('/schedules/{schedule}/edit', [ScheduleController::class, 'edit'])->name('schedules.edit');
    Route::put('/schedules/{schedule}', [ScheduleController::class, 'update'])->name('schedules.update');
    Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');



    // Attendance routes for admin
    Route::prefix('attendance')->name('attendance.')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->name('index');
        Route::get('/create', [AttendanceController::class, 'create'])->name('create');
        Route::post('/', [AttendanceController::class, 'store'])->name('store');
        Route::get('/reports', [AttendanceController::class, 'reports'])->name('reports');
        // gunakan GET untuk export agar browser langsung mengunduh file
        Route::get('/export-report', [AttendanceController::class, 'exportReport'])->name('export-report');
        Route::get('/{session}', [AttendanceController::class, 'show'])->name('show');
        Route::get('/{session}/edit', [AttendanceController::class, 'edit'])->name('edit');
        Route::put('/{session}', [AttendanceController::class, 'update'])->name('update');
        Route::delete('/{session}', [AttendanceController::class, 'destroy'])->name('destroy');
        Route::post('/{session}/update-attendance', [AttendanceController::class, 'updateAttendance'])->name('update-attendance');
        Route::delete('/{session}/delete-attendance/{attendance}', [AttendanceController::class, 'deleteAttendance'])->name('delete-attendance');
        Route::post('/{session}/extend', [AttendanceController::class, 'extendSession'])->name('extend-session');
        Route::post('/{session}/close', [AttendanceController::class, 'closeSession'])->name('close-session');
        // Hapus route get-subjects-for-class karena sudah tidak digunakan
    });

    // Attendance routes for students
    // Route::prefix('student/attendance')->name('student.attendance.')->middleware(['auth', 'role:siswa'])->group(function () {
    //     Route::get('/', [StudentAttendanceController::class, 'index'])->name('index');
    //     Route::post('/submit', [StudentAttendanceController::class, 'submit'])->name('submit');
    //     Route::get('/history', [StudentAttendanceController::class, 'history'])->name('history');
    // });

    Route::get(
        '/employee-attendance',
        [EmployeeAttendanceControllerAdmin::class, 'index']
    )->name('employee-attendance.index');

    // UPDATE STATUS ABSENSI
    Route::patch(
        '/employee-attendance/{id}/status',
        [EmployeeAttendanceControllerAdmin::class, 'updateStatus']
    )->name('employee-attendance.update-status');

    // PRINT / EXPORT REPORT
    Route::get(
        '/employee-attendance/print',
        [EmployeeAttendanceControllerAdmin::class, 'exportReport']
    )->name('employee-attendance.print');

    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', [ActivityLogController::class, 'index'])->name('index');
        Route::post('/clear-old', [ActivityLogController::class, 'clearOldLogs'])->name('clear-old');
        Route::post('/export', [ActivityLogController::class, 'export'])->name('export');
    });

    // WhatsApp Gateway
    Route::prefix('whatsapp')->name('whatsapp.')->group(function () {
        Route::get('/', [WhatsAppController::class, 'index'])->name('index');
        Route::get('/status', [WhatsAppController::class, 'status'])->name('status');
        Route::get('/qr', [WhatsAppController::class, 'qr'])->name('qr');
        Route::post('/logout', [WhatsAppController::class, 'logout'])->name('logout');
    });
});

Route::prefix('teacher')->middleware(['auth', 'role:guru'])->name("teacher.")->group(function () {
    // Dashboard
    Route::get('dashboard', [App\Http\Controllers\Teacher\DashboardController::class, 'index'])->name('dashboard');

    // Subject routes
    Route::get('subjects', [App\Http\Controllers\Teacher\SubjectController::class, 'index'])->name('subjects.index');
    Route::get('subjects/{subject}', [App\Http\Controllers\Teacher\SubjectController::class, 'show'])->name('subjects.show');
    Route::get('subjects/{subject}/export-grades', [App\Http\Controllers\Teacher\SubjectController::class, 'exportGrades'])->name('subjects.export-grades');

    // Subject discussions (forum)
    Route::get('subjects/{subject}/discussions', [App\Http\Controllers\Teacher\DiscussionController::class, 'index'])->name('discussions.index');
    Route::post('subjects/{subject}/discussions', [App\Http\Controllers\Teacher\DiscussionController::class, 'store'])->name('discussions.store');
    Route::get('subjects/{subject}/discussions/{thread}', [App\Http\Controllers\Teacher\DiscussionController::class, 'show'])->name('discussions.show');
    Route::post('subjects/{subject}/discussions/{thread}/reply', [App\Http\Controllers\Teacher\DiscussionController::class, 'reply'])->name('discussions.reply');

    // Subject-specific materials & assignments
    Route::get('subjects/{subject}/materials', [App\Http\Controllers\Teacher\MaterialController::class, 'subjectMaterials'])->name('subjects.materials');
    Route::get('subjects/{subject}/assignments', [App\Http\Controllers\Teacher\AssignmentController::class, 'subjectAssignments'])->name('subjects.assignments');

    // Material routes - optionally pass subject_id in query parameter
    Route::get('materials', [App\Http\Controllers\Teacher\MaterialController::class, 'index'])->name('materials.index');
    Route::get('materials/create', [App\Http\Controllers\Teacher\MaterialController::class, 'create'])->name('materials.create');
    Route::post('materials', [App\Http\Controllers\Teacher\MaterialController::class, 'store'])->name('materials.store');
    Route::get('materials/{material}', [App\Http\Controllers\Teacher\MaterialController::class, 'show'])->name('materials.show');
    Route::get('materials/{material}/edit', [App\Http\Controllers\Teacher\MaterialController::class, 'edit'])->name('materials.edit');
    Route::put('materials/{material}', [App\Http\Controllers\Teacher\MaterialController::class, 'update'])->name('materials.update');
    Route::delete('materials/{material}', [App\Http\Controllers\Teacher\MaterialController::class, 'destroy'])->name('materials.destroy');

    // Assignment routes - optionally pass subject_id in query parameter
    Route::get('assignments', [App\Http\Controllers\Teacher\AssignmentController::class, 'index'])->name('assignments.index');
    Route::get('assignments/create', [App\Http\Controllers\Teacher\AssignmentController::class, 'create'])->name('assignments.create');
    Route::post('assignments', [App\Http\Controllers\Teacher\AssignmentController::class, 'store'])->name('assignments.store');
    Route::get('assignments/{assignment}', [App\Http\Controllers\Teacher\AssignmentController::class, 'show'])->name('assignments.show');
    Route::get('assignments/{assignment}/edit', [App\Http\Controllers\Teacher\AssignmentController::class, 'edit'])->name('assignments.edit');
    Route::put('assignments/{assignment}', [App\Http\Controllers\Teacher\AssignmentController::class, 'update'])->name('assignments.update');
    Route::delete('assignments/{assignment}', [App\Http\Controllers\Teacher\AssignmentController::class, 'destroy'])->name('assignments.destroy');

    // Submission grading routes
    Route::get('assignments/{assignment}/submissions', [App\Http\Controllers\Teacher\SubmissionController::class, 'index'])->name('submissions.index');
    Route::get('submissions/{submission}', [App\Http\Controllers\Teacher\SubmissionController::class, 'show'])->name('submissions.show');
    Route::post('submissions/{submission}/grade', [App\Http\Controllers\Teacher\SubmissionController::class, 'grade'])->name('submissions.grade');
    Route::get('submissions/export/{assignment}', [App\Http\Controllers\Teacher\SubmissionController::class, 'export'])->name('submissions.export');

    // Schedule
    Route::get('schedule', [TeacherScheduleController::class, 'index'])->name('schedule.index');

    // Attendance routes
    Route::get('attendance', [TeacherAttendanceController::class, 'index'])->name('attendance.index');
    Route::get('attendance/reports', [TeacherAttendanceController::class, 'reports'])->name('attendance.reports');
    Route::get('attendance/export-report', [TeacherAttendanceController::class, 'exportReport'])->name('attendance.export-report');
    Route::get('attendance/create', [TeacherAttendanceController::class, 'create'])->name('attendance.create');
    Route::post('attendance', [TeacherAttendanceController::class, 'store'])->name('attendance.store');
    Route::get('attendance/{session}', [TeacherAttendanceController::class, 'show'])->name('attendance.show');
    Route::get('attendance/{session}/edit', [TeacherAttendanceController::class, 'edit'])->name('attendance.edit');
    Route::put('attendance/{session}', [TeacherAttendanceController::class, 'update'])->name('attendance.update');
    Route::delete('attendance/{session}', [TeacherAttendanceController::class, 'destroy'])->name('attendance.destroy');
    Route::post('attendance/{session}/update-attendance', [TeacherAttendanceController::class, 'updateAttendance'])->name('attendance.update-attendance');
    Route::delete('attendance/{session}/delete-attendance/{attendance}', [TeacherAttendanceController::class, 'deleteAttendance'])->name('attendance.delete-attendance');
    Route::get('attendance/daily', [TeacherAttendanceController::class, 'dailyView'])->name('attendance.daily');
    Route::get('attendance/active-sessions', [TeacherAttendanceController::class, 'activeSessions'])->name('attendance.active_sessions');
    Route::post('attendance/extracurriculars/{extracurricular}', [TeacherAttendanceController::class, 'createExtracurricularSession'])->name('attendance.extracurriculars.create');
    Route::post('/{session}/extend', [TeacherAttendanceController::class, 'extendSession'])->name('attendance.extend-session');
    Route::post('/{session}/close', [TeacherAttendanceController::class, 'closeSession'])->name('attendance.close-session');

    // Quizzes
    Route::get('quizzes', [TeacherQuizController::class, 'index'])->name('quizzes.index');
    Route::get('quizzes/create', [TeacherQuizController::class, 'create'])->name('quizzes.create');
    Route::post('quizzes', [TeacherQuizController::class, 'store'])->name('quizzes.store');

    // Extracurriculars (guru sebagai pembina)
    Route::get('extracurriculars', [TeacherExtracurricularController::class, 'index'])->name('extracurriculars.index');
    Route::get('extracurriculars/{extracurricular}', [TeacherExtracurricularController::class, 'show'])->name('extracurriculars.show');
    Route::get('extracurriculars/{extracurricular}/export-attendance', [TeacherExtracurricularController::class, 'exportAttendance'])->name('extracurriculars.export-attendance');

    // Student Progress routes
    Route::get('progress', [App\Http\Controllers\Teacher\ProgressController::class, 'index'])->name('progress.index');
    Route::get('progress/subjects/{subject}', [App\Http\Controllers\Teacher\ProgressController::class, 'subjectProgress'])->name('progress.subject');
    Route::get('progress/students/{student}', [App\Http\Controllers\Teacher\ProgressController::class, 'studentProgress'])->name('progress.student');

    // Profile route
    Route::get('profile', [App\Http\Controllers\Teacher\ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('profile', [App\Http\Controllers\Teacher\ProfileController::class, 'update'])->name('profile.update');

    // Notifications
    Route::get('notifications', [App\Http\Controllers\Teacher\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/mark-read', [App\Http\Controllers\Teacher\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::delete('notifications/{notification}', [App\Http\Controllers\Teacher\NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::get('employee-attendance', [EmployeeAttendanceController::class, 'index'])
        ->name('employee-attendance.index');

    Route::post('employee-attendance/check-in', [EmployeeAttendanceController::class, 'checkIn'])
        ->name('employee-attendance.check-in');

    Route::post('employee-attendance/check-out', [EmployeeAttendanceController::class, 'checkOut'])
        ->name('employee-attendance.check-out');

    Route::get('employee-attendance/history', [EmployeeAttendanceController::class, 'history'])
        ->name('employee-attendance.history');
});

Route::prefix('student')->middleware(['auth', 'role:siswa'])->name("student.")->group(function () {
    // Dashboard
    Route::get('dashboard', [App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('profile', [App\Http\Controllers\Student\ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('profile', [App\Http\Controllers\Student\ProfileController::class, 'update'])->name('profile.update');

    // Mata Pelajaran
    Route::get('subjects', [App\Http\Controllers\Student\SubjectController::class, 'index'])->name('subjects.index');
    Route::get('subjects/{subject}', [App\Http\Controllers\Student\SubjectController::class, 'show'])->name('subjects.show');

    // Materi Pembelajaran
    Route::get('materials', [App\Http\Controllers\Student\MaterialController::class, 'index'])->name('materials.index');
    Route::get('materials/{material}', [App\Http\Controllers\Student\MaterialController::class, 'show'])->name('materials.show');
    Route::get('materials/download/{material}', [App\Http\Controllers\Student\MaterialController::class, 'download'])->name('materials.download');

    // Tugas
    Route::get('assignments', [App\Http\Controllers\Student\AssignmentController::class, 'index'])->name('assignments.index');
    Route::get('assignments/{assignment}', [App\Http\Controllers\Student\AssignmentController::class, 'show'])->name('assignments.show');
    Route::get('assignments/{assignment}/submit', [App\Http\Controllers\Student\SubmissionController::class, 'create'])->name('assignments.submit');
    Route::post('assignments/{assignment}/submit', [App\Http\Controllers\Student\SubmissionController::class, 'store'])->name('submissions.store');
    Route::get('submissions/{submission}', [App\Http\Controllers\Student\SubmissionController::class, 'show'])->name('submissions.show');

    // Presensi/Absensi
    Route::get('attendance', [App\Http\Controllers\Student\AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('attendance/history', [App\Http\Controllers\Student\AttendanceController::class, 'history'])->name('attendance.history');

    // Notifikasi
    Route::get('notifications', [App\Http\Controllers\Student\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/mark-read', [App\Http\Controllers\Student\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::delete('notifications/{notification}', [App\Http\Controllers\Student\NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Laporan Nilai
    Route::get('grades', [App\Http\Controllers\Student\GradeController::class, 'index'])->name('grades.index');
    Route::get('grades/subjects/{subject}', [App\Http\Controllers\Student\GradeController::class, 'subjectGrades'])->name('grades.subject');

    // Jadwal pelajaran
    Route::get('schedule', [StudentScheduleController::class, 'index'])->name('schedule.index');

    // Quizzes
    Route::get('quizzes', [StudentQuizController::class, 'index'])->name('quizzes.index');
    Route::get('quizzes/{quiz}', [StudentQuizController::class, 'show'])->name('quizzes.show');
    Route::post('quizzes/{quiz}/submit', [StudentQuizController::class, 'submit'])->name('quizzes.submit');

    // Ekstrakurikuler (siswa)
    Route::get('extracurriculars', [StudentExtracurricularController::class, 'index'])->name('extracurriculars.index');
    Route::get('extracurriculars/{extracurricular}', [StudentExtracurricularController::class, 'show'])->name('extracurriculars.show');

    // Diskusi (forum) per mata pelajaran
    Route::get('subjects/{subject}/discussions', [App\Http\Controllers\Student\DiscussionController::class, 'index'])->name('discussions.index');
    Route::post('subjects/{subject}/discussions', [App\Http\Controllers\Student\DiscussionController::class, 'store'])->name('discussions.store');
    Route::get('subjects/{subject}/discussions/{thread}', [App\Http\Controllers\Student\DiscussionController::class, 'show'])->name('discussions.show');
    Route::post('subjects/{subject}/discussions/{thread}/reply', [App\Http\Controllers\Student\DiscussionController::class, 'reply'])->name('discussions.reply');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
