<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();

        $validated = $request->validate([
            'day' => 'nullable|in:' . implode(',', array_keys($this->days)),
        ]);

        $query = Schedule::with(['classroom', 'subject', 'semester'])
            ->where('teacher_id', $teacher->id)
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
                'semester' => $schedule->semester?->name ?? '-',
                'day' => $this->days[$schedule->day_of_week] ?? $schedule->day_of_week,
                'raw_day' => $schedule->day_of_week,
                'time' => $schedule->start_time . ' - ' . $schedule->end_time,
                'room' => $schedule->room ?? '-',
                'meeting_link' => $schedule->meeting_link,
                'notes' => $schedule->notes,
            ];
        });

        $grouped = $schedules->groupBy('raw_day')->sortKeysUsing(function ($a, $b) {
            $order = array_keys($this->days);
            return array_search($a, $order) <=> array_search($b, $order);
        });

        return Inertia::render('Teacher/Schedule/Index', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ],
            'filters' => [
                'day' => $validated['day'] ?? '',
            ],
            'days' => $this->days,
            'scheduleByDay' => $grouped->map(function ($items) {
                return $items->values()->all();
            }),
        ]);
    }
}
