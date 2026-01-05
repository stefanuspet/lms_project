<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\Extracurricular;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    private array $days = [
        'monday' => 'Senin',
        'tuesday' => 'Selasa',
        'wednesday' => 'Rabu',
        'thursday' => 'Kamis',
        'friday' => 'Jumat',
        'saturday' => 'Sabtu',
        'sunday' => 'Minggu',
    ];

    public function index(Request $request)
    {
        $student = Student::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'day' => 'nullable|in:' . implode(',', array_keys($this->days)),
        ]);

        $current = DB::table('semesters_students')
            ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
            ->where('semesters_students.students_id', $student->id)
            ->orderBy('semesters.end_date', 'desc')
            ->select('semesters_students.class_id', 'semesters_students.semesters_id')
            ->first();

        if (!$current) {
            return Inertia::render('Student/Schedule/Index', [
                'student' => [
                    'name' => $student->name,
                    'nisn' => $student->nisn,
                ],
                'class_name' => 'Belum terdaftar kelas',
                'scheduleByDay' => [],
                'days' => $this->days,
                'filters' => ['day' => $validated['day'] ?? ''],
            ]);
        }

        $classId = $current->class_id;
        $semesterId = $current->semesters_id;

        $query = Schedule::with(['classroom', 'subject', 'teacher', 'semester'])
            ->forClass($classId)
            ->where(function ($q) use ($semesterId) {
                $q->whereNull('semester_id');
                if (!empty($semesterId)) {
                    $q->orWhere('semester_id', $semesterId);
                }
            })
            ->orderByRaw("FIELD(day_of_week, 'monday','tuesday','wednesday','thursday','friday','saturday','sunday')")
            ->orderBy('start_time');

        if (!empty($validated['day'])) {
            $query->where('day_of_week', $validated['day']);
        }

        $schedules = $query->get()->map(function (Schedule $schedule) {
            return [
                'id' => $schedule->id,
                'class_name' => $schedule->classroom?->name ?? '-',
                'subject_name' => $schedule->subject?->name ?? '-',
                'teacher_name' => $schedule->teacher?->name ?? ($schedule->subject?->teacher?->name ?? '-'),
                'semester' => $schedule->semester?->name ?? '-',
                'day' => $this->days[$schedule->day_of_week] ?? $schedule->day_of_week,
                'raw_day' => $schedule->day_of_week,
                'time' => $schedule->start_time . ' - ' . $schedule->end_time,
                'room' => $schedule->room ?? '-',
                'meeting_link' => $schedule->meeting_link,
                'notes' => $schedule->notes,
                'type' => 'subject',
            ];
        });

        // Tambahkan jadwal ekstrakurikuler yang diikuti siswa
        $extras = Extracurricular::with('teacher')
            ->where('is_active', true)
            ->whereHas('students', function ($q) use ($student) {
                $q->where('students.id', $student->id);
            })
            ->get()
            ->map(function (Extracurricular $extra) {
                return [
                    'id' => 'extra-' . $extra->id,
                    'extracurricular_id' => $extra->id,
                    'class_name' => 'Ekstrakurikuler',
                    'subject_name' => $extra->name,
                    'teacher_name' => optional($extra->teacher)->name ?? '-',
                    'semester' => $extra->semester?->name ?? '-',
                    'day' => $this->days[$extra->day_of_week] ?? $extra->day_of_week,
                    'raw_day' => $extra->day_of_week,
                    'time' => ($extra->start_time && $extra->end_time)
                        ? $extra->start_time . ' - ' . $extra->end_time
                        : '',
                    'room' => $extra->room ?? '-',
                    'meeting_link' => null,
                    'notes' => 'Ekstrakurikuler',
                    'type' => 'extracurricular',
                ];
            });

        $combined = $schedules->concat($extras);

        $grouped = $combined->groupBy('raw_day')->sortKeysUsing(function ($a, $b) {
            $order = array_keys($this->days);
            return array_search($a, $order) <=> array_search($b, $order);
        });

        $className = DB::table('classes')->where('id', $classId)->value('name') ?? '-';

        return Inertia::render('Student/Schedule/Index', [
            'student' => [
                'name' => $student->name,
                'nisn' => $student->nisn,
            ],
            'class_name' => $className,
            'scheduleByDay' => $grouped->map(function ($items) {
                return $items->values()->all();
            }),
            'days' => $this->days,
            'filters' => ['day' => $validated['day'] ?? ''],
        ]);
    }
}
