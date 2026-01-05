<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Extracurricular;
use App\Models\Schedule;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $validated = $request->validate([
            'day' => 'nullable|in:' . implode(',', array_keys($this->days)),
            'include_extracurricular' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan',
            ], 404);
        }

        $current = DB::table('semesters_students')
            ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
            ->where('semesters_students.students_id', $student->id)
            ->orderBy('semesters.end_date', 'desc')
            ->select('semesters_students.class_id', 'semesters_students.semesters_id')
            ->first();

        if (!$current) {
            return response()->json([
                'success' => true,
                'class' => null,
                'data' => [],
            ]);
        }

        $query = Schedule::with(['classroom', 'subject', 'teacher', 'semester'])
            ->forClass($current->class_id)
            ->where(function ($q) use ($current) {
                $q->whereNull('semester_id');
                if (!empty($current->semesters_id)) {
                    $q->orWhere('semester_id', $current->semesters_id);
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
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'room' => $schedule->room ?? '-',
                'meeting_link' => $schedule->meeting_link,
                'notes' => $schedule->notes,
                'type' => 'subject',
            ];
        });

        // Optionally include extracurricular schedule entries
        if (!empty($validated['include_extracurricular'])) {
            $extras = Extracurricular::with(['teacher', 'semester'])
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
                        'start_time' => $extra->start_time,
                        'end_time' => $extra->end_time,
                        'room' => $extra->room ?? '-',
                        'meeting_link' => null,
                        'notes' => 'Ekstrakurikuler',
                        'type' => 'extracurricular',
                    ];
                });

            // Jika filter hari digunakan, sesuaikan juga untuk ekstrakurikuler
            if (!empty($validated['day'])) {
                $extras = $extras->where('raw_day', $validated['day']);
            }

            $schedules = $schedules->concat($extras)->values();
        }

        return response()->json([
            'success' => true,
            'class' => [
                'id' => $current->class_id,
                'name' => DB::table('classes')->where('id', $current->class_id)->value('name'),
                'semester_id' => $current->semesters_id,
            ],
            'data' => $schedules,
        ]);
    }
}
