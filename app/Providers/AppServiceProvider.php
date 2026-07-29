<?php

namespace App\Providers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        $this->carryForwardTeacherAssignments();
    }

    /**
     * Saat semester aktif baru belum punya assignment guru,
     * salin otomatis dari semester sebelumnya.
     */
    private function carryForwardTeacherAssignments(): void
    {
        try {
            $activeSemester = DB::table('semesters')
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->orderByDesc('start_date')
                ->first();

            if (! $activeSemester) return;

            // Cache per semester — hanya proses sekali
            $cacheKey = "teacher_assignments_carried_{$activeSemester->id}";
            if (Cache::has($cacheKey)) return;

            $hasAssignments = DB::table('teachers_subjects')
                ->where('semester_id', $activeSemester->id)
                ->exists();

            if (! $hasAssignments) {
                // Cari semester terbaru yang punya assignment
                $prevSemesterId = DB::table('teachers_subjects')
                    ->join('semesters', 'teachers_subjects.semester_id', '=', 'semesters.id')
                    ->where('semesters.start_date', '<', $activeSemester->start_date)
                    ->orderByDesc('semesters.start_date')
                    ->value('teachers_subjects.semester_id');

                if ($prevSemesterId) {
                    $rows = DB::table('teachers_subjects')
                        ->where('semester_id', $prevSemesterId)
                        ->get(['teacher_id', 'subject_id']);

                    $now = now();
                    $inserts = $rows->map(fn($r) => [
                        'teacher_id'  => $r->teacher_id,
                        'subject_id'  => $r->subject_id,
                        'semester_id' => $activeSemester->id,
                        'created_at'  => $now,
                        'updated_at'  => $now,
                    ])->toArray();

                    if ($inserts) {
                        DB::table('teachers_subjects')->insertOrIgnore($inserts);
                    }
                }
            }

            // Tandai sudah diproses — cache 12 jam
            Cache::put($cacheKey, true, now()->addHours(12));
        } catch (\Throwable $e) {
            // Jangan sampai crash aplikasi jika ada error
        }
    }
}
