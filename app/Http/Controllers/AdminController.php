<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\Material;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\Schedule;
use App\Models\Extracurricular;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        // Dapatkan data jumlah siswa dan guru
        $studentsCount = Student::count();
        $teachersCount = Teacher::count();
        $boysCount = Student::where('gender', 'male')->count();
        $girlsCount = Student::where('gender', 'female')->count();

        // Dapatkan data jumlah kelas dan mata pelajaran
        $classesCount = Classroom::count();
        $subjectsCount = Subject::count();

        // Dapatkan statistik sistem
        $materialsCount = Material::count();
        $assignmentsCount = Assignment::count();

        // Hitung jumlah login per hari untuk 7 hari terakhir
        $dailyLogins = ActivityLog::where('action', 'login')
            ->where('created_at', '>=', now()->subDays(1))
            ->count();

        // Hitung persentase kehadiran (ratio dari attendance)
        $totalAttendances = DB::table('attendances')->count();
        $presentAttendances = DB::table('attendances')->where('status', 'hadir')->count();
        $attendanceRate = $totalAttendances > 0
            ? round(($presentAttendances / $totalAttendances) * 100, 1)
            : 0;

        // Hitung perubahan dalam statistik (bandingkan dengan bulan lalu)
        $lastMonthMaterials = Material::where('created_at', '<=', now()->subMonth())
            ->count();
        $materialsChange = $lastMonthMaterials > 0
            ? round((($materialsCount - $lastMonthMaterials) / $lastMonthMaterials) * 100, 1)
            : 100;

        $lastMonthAssignments = Assignment::where('created_at', '<=', now()->subMonth())
            ->count();
        $assignmentsChange = $lastMonthAssignments > 0
            ? round((($assignmentsCount - $lastMonthAssignments) / $lastMonthAssignments) * 100, 1)
            : 100;

        $lastWeekLogins = ActivityLog::where('action', 'login')
            ->whereBetween('created_at', [now()->subDays(8), now()->subDays(2)])
            ->count();
        $loginsChange = $lastWeekLogins > 0
            ? round((($dailyLogins - $lastWeekLogins) / $lastWeekLogins) * 100, 1)
            : 100;

        // Hitung perubahan kehadiran
        $lastMonthAttendances = DB::table('attendances')
            ->where('created_at', '<=', now()->subMonth())
            ->count();
        $lastMonthPresents = DB::table('attendances')
            ->where('status', 'hadir')
            ->where('created_at', '<=', now()->subMonth())
            ->count();
        $lastMonthRate = $lastMonthAttendances > 0
            ? round(($lastMonthPresents / $lastMonthAttendances) * 100, 1)
            : 0;
        $attendanceChange = $lastMonthRate > 0
            ? round(($attendanceRate - $lastMonthRate), 1)
            : 0;

        // Informasi periode aktif (Tahun Ajar & Semester) dan ringkasan jadwal hari ini
        $activeYear = AcademicYear::active()
            ->orderByDesc('start_date')
            ->first();

        $today = Carbon::today();

        $activeSemester = Semester::whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderByDesc('start_date')
            ->first();

        $todayDayKey = strtolower(Carbon::now()->englishDayOfWeek);

        $todaySchedulesCount = Schedule::where('day_of_week', $todayDayKey)->count();
        $todayExtracurricularCount = Extracurricular::where('day_of_week', $todayDayKey)
            ->where('is_active', true)
            ->count();

        // Data untuk chart pendaftaran bulanan
        $monthlyStudentRegistrations = Student::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->get()
            ->map(function ($item) {
                $monthNames = [
                    1 => 'Jan',
                    2 => 'Feb',
                    3 => 'Mar',
                    4 => 'Apr',
                    5 => 'Mei',
                    6 => 'Jun',
                    7 => 'Jul',
                    8 => 'Ags',
                    9 => 'Sep',
                    10 => 'Okt',
                    11 => 'Nov',
                    12 => 'Des'
                ];
                return [
                    'name' => $monthNames[$item->month],
                    'jumlah' => $item->count
                ];
            });

        // Pastikan semua bulan ada dalam data (bahkan jika tidak ada registrasi)
        $chartData = [];
        foreach (range(1, 12) as $month) {
            $monthName = date('M', mktime(0, 0, 0, $month, 10));
            $monthNames = [
                1 => 'Jan',
                2 => 'Feb',
                3 => 'Mar',
                4 => 'Apr',
                5 => 'Mei',
                6 => 'Jun',
                7 => 'Jul',
                8 => 'Ags',
                9 => 'Sep',
                10 => 'Okt',
                11 => 'Nov',
                12 => 'Des'
            ];

            $foundMonth = $monthlyStudentRegistrations
                ->firstWhere('name', $monthNames[$month]);

            $chartData[] = [
                'name' => $monthNames[$month],
                'jumlah' => $foundMonth ? $foundMonth['jumlah'] : 0
            ];
        }

        // Dapatkan aktivitas terbaru dari log
        $recentActivities = ActivityLog::with(['user']) // Eager loading user
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                // Ambil informasi user
                $user = $log->user;
                $userName = "User";
                $userRole = "admin"; // Default role

                // Cek peran pengguna dan ambil detail tambahan
                if ($user) {
                    if ($user->role === 'siswa') {
                        $student = Student::where('user_id', $user->id)->first();
                        if ($student) {
                            $userName = $student->name;
                            $userRole = "student";
                        } else {
                            $userName = $user->email;
                        }
                    } elseif ($user->role === 'guru') {
                        $teacher = Teacher::where('user_id', $user->id)->first();
                        if ($teacher) {
                            $userName = $teacher->name;
                            $userRole = "teacher";
                        } else {
                            $userName = $user->email;
                        }
                    } else {
                        // Jika role lainnya (admin)
                        $userName = $user->email;
                    }
                }

                // Tentukan jenis icon berdasarkan aksi yang dilakukan
                $iconType = $this->determineIconType($log->action);

                // Tentukan nama mata pelajaran jika tersedia
                $subjectName = $this->determineSubjectName($log->action, $log->description);

                // Format data untuk ditampilkan di frontend
                return [
                    'id' => $log->id,
                    'user' => $userName,
                    'role' => $userRole,
                    'action' => $log->action,
                    'subject' => $subjectName,
                    'time' => Carbon::parse($log->created_at)->diffForHumans(),
                    'icon_type' => $iconType,
                    'ip_address' => $log->ip_address,
                    'description' => $log->description
                ];
            });

        // Dapatkan notifikasi penting (tugas yang mendekati deadline, dll)
        $urgentAssignments = Assignment::where('deadline', '>=', now())
            ->where('deadline', '<=', now()->addDay())
            ->count();

        $pendingVerifications = User::whereNull('email_verified_at')
            ->where('role', 'guru')
            ->count();

        // Cek apakah ada jadwal maintenance
        $hasScheduledMaintenance = false;  // Ini dapat diatur dari pengaturan sistem

        $notifications = [];

        if ($urgentAssignments > 0) {
            $notifications[] = [
                'message' => "Ada {$urgentAssignments} tugas dengan tenggat waktu hari ini yang belum dikumpulkan oleh lebih dari 30% siswa.",
                'type' => 'warning'
            ];
        }

        if ($hasScheduledMaintenance) {
            $notifications[] = [
                'message' => "Update sistem dijadwalkan pada hari Minggu pukul 01:00 - 03:00 WIB.",
                'type' => 'info'
            ];
        }

        if ($pendingVerifications > 0) {
            $notifications[] = [
                'message' => "{$pendingVerifications} guru baru memerlukan verifikasi akun.",
                'type' => 'sky'
            ];
        }

        // Jika tidak ada notifikasi, tambahkan pesan default
        if (empty($notifications)) {
            $notifications[] = [
                'message' => "Tidak ada notifikasi penting saat ini.",
                'type' => 'success'
            ];
        }

        // Data statistik sistem
        $systemStats = [
            [
                'title' => 'Total Materi',
                'value' => $materialsCount,
                'change' => $materialsChange . '%',
                'period' => 'dari bulan lalu'
            ],
            [
                'title' => 'Total Tugas',
                'value' => $assignmentsCount,
                'change' => $assignmentsChange . '%',
                'period' => 'dari bulan lalu'
            ],
            [
                'title' => 'Login Harian',
                'value' => $dailyLogins,
                'change' => $loginsChange . '%',
                'period' => 'dari minggu lalu'
            ],
            [
                'title' => 'Kehadiran',
                'value' => $attendanceRate . '%',
                'change' => $attendanceChange . '%',
                'period' => 'dari bulan lalu'
            ]
        ];

        return Inertia::render(
            'Admin/Dashboard',
            [
                'studentsCount' => $studentsCount,
                'teachersCount' => $teachersCount,
                'boysCount' => $boysCount,
                'girlsCount' => $girlsCount,
                'classesCount' => $classesCount,
                'subjectsCount' => $subjectsCount,
                'systemStats' => $systemStats,
                'notifications' => $notifications,
                'recentActivities' => $recentActivities,
                'registrationChart' => $chartData,
                'activePeriod' => [
                    'academic_year' => $activeYear ? [
                        'id' => $activeYear->id,
                        'name' => $activeYear->name,
                        'formatted_period' => $activeYear->start_date && $activeYear->end_date
                            ? $activeYear->start_date->format('d M Y') . ' - ' . $activeYear->end_date->format('d M Y')
                            : null,
                    ] : null,
                    'semester' => $activeSemester ? [
                        'id' => $activeSemester->id,
                        'name' => $activeSemester->name,
                        'formatted_period' => $activeSemester->start_date && $activeSemester->end_date
                            ? $activeSemester->start_date->format('d M Y') . ' - ' . $activeSemester->end_date->format('d M Y')
                            : null,
                    ] : null,
                    'today' => [
                        'schedules' => $todaySchedulesCount,
                        'extracurriculars' => $todayExtracurricularCount,
                    ],
                ],
            ]
        );
    }

    // Metode helper untuk menentukan jenis icon
    private function determineIconType($action)
    {
        if (strpos($action, 'login') !== false) {
            return 'login';
        } elseif (strpos($action, 'upload') !== false || strpos($action, 'materi') !== false) {
            return 'material';
        } elseif (strpos($action, 'tugas') !== false || strpos($action, 'assignment') !== false) {
            return 'assignment';
        } elseif (strpos($action, 'nilai') !== false || strpos($action, 'grade') !== false) {
            return 'grade';
        } elseif (strpos($action, 'absen') !== false || strpos($action, 'hadir') !== false || strpos($action, 'attendance') !== false) {
            return 'attendance';
        } elseif (strpos($action, 'kelas') !== false || strpos($action, 'class') !== false) {
            return 'class';
        } elseif (strpos($action, 'pelajaran') !== false || strpos($action, 'subject') !== false) {
            return 'subject';
        } elseif (strpos($action, 'logout') !== false || strpos($action, 'subject') !== false) {
            return 'logout';
        } else {
            return 'system';
        }
    }

    // Metode helper untuk menentukan nama mata pelajaran
    private function determineSubjectName($action, $description)
    {
        // Coba cari ID Materi
        if (strpos($action, 'materi') !== false || strpos($action, 'upload') !== false) {
            preg_match('/ID: (\d+)/', $description, $matches);
            if (isset($matches[1])) {
                $material = Material::find($matches[1]);
                if ($material && $material->subject) {
                    return $material->subject->name;
                }
            }
        }
        // Coba cari ID Tugas
        elseif (strpos($action, 'tugas') !== false) {
            preg_match('/ID: (\d+)/', $description, $matches);
            if (isset($matches[1])) {
                $assignment = Assignment::find($matches[1]);
                if ($assignment && $assignment->subject) {
                    return $assignment->subject->name;
                }
            }
        }
        // Coba cari ID Mata Pelajaran
        elseif (strpos($description, 'Mata Pelajaran ID:') !== false) {
            preg_match('/Mata Pelajaran ID: (\d+)/', $description, $matches);
            if (isset($matches[1])) {
                $subject = Subject::find($matches[1]);
                if ($subject) {
                    return $subject->name;
                }
            }
        }
        // Coba cari ID Kelas
        elseif (strpos($description, 'Kelas ID:') !== false) {
            preg_match('/Kelas ID: (\d+)/', $description, $matches);
            if (isset($matches[1])) {
                $class = Classroom::find($matches[1]);
                if ($class) {
                    return "Kelas " . $class->name;
                }
            }
        }

        return 'Umum';
    }
}
