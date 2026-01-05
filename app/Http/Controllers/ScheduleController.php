<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Schedule;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Extracurricular;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

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
            'class_id' => 'nullable|integer|exists:classes,id',
            'teacher_id' => 'nullable|integer|exists:teachers,id',
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'semester_id' => 'nullable|integer|exists:semesters,id',
            'day' => 'nullable|in:' . implode(',', array_keys($this->days)),
            'search' => 'nullable|string|max:100',
        ]);

        $query = Schedule::with(['classroom', 'subject.teacher', 'teacher', 'semester', 'extracurricular'])
            ->orderByRaw("FIELD(day_of_week, 'monday','tuesday','wednesday','thursday','friday','saturday','sunday')")
            ->orderBy('start_time');

        if (!empty($validated['class_id'])) {
            $query->where('class_id', $validated['class_id']);
        }

        if (!empty($validated['teacher_id'])) {
            $query->where('teacher_id', $validated['teacher_id']);
        }

        if (!empty($validated['subject_id'])) {
            $query->where('subject_id', $validated['subject_id']);
        }

        if (!empty($validated['semester_id'])) {
            $query->where('semester_id', $validated['semester_id']);
        }

        if (!empty($validated['day'])) {
            $query->where('day_of_week', $validated['day']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('subject', function ($subjectQuery) use ($search) {
                    $subjectQuery->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('classroom', function ($classQuery) use ($search) {
                        $classQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('teacher', function ($teacherQuery) use ($search) {
                        $teacherQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhere('room', 'like', "%{$search}%");
            });
        }

        $schedules = $query->paginate(15)->withQueryString();

        // Format only the collection items so frontend gets a simple array
        // Format jadwal pelajaran reguler
        $formattedRegular = $schedules->getCollection()->map(function (Schedule $schedule) {
            return [
                'id' => $schedule->id,
                'class_name' => $schedule->classroom?->name ?? '-',
                'subject_name' => $schedule->subject?->name ?? '-',
                'teacher_name' => $schedule->teacher?->name ?? ($schedule->subject?->teacher?->name ?? '-'),
                'day' => $this->days[$schedule->day_of_week] ?? $schedule->day_of_week,
                'time' => $schedule->start_time . ' - ' . $schedule->end_time,
                'room' => $schedule->room ?? '-',
                'semester' => $schedule->semester?->name ?? '-',
                'is_extracurricular' => false,
            ];
        });

        // Tambahkan jadwal ekstrakurikuler dari tabel extracurriculars (tanpa perlu input manual di jadwal)
        $extraQuery = Extracurricular::with('teacher')->where('is_active', true);

        if (!empty($validated['teacher_id'])) {
            $extraQuery->where('teacher_id', $validated['teacher_id']);
        }

        if (!empty($validated['day'])) {
            $extraQuery->where('day_of_week', $validated['day']);
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $extraQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $extraFormatted = $extraQuery->get()->map(function (Extracurricular $extra) {
            return [
                'id' => $extra->id,
                'class_name' => 'Ekstrakurikuler',
                'subject_name' => $extra->name,
                'teacher_name' => optional($extra->teacher)->name ?? '-',
                'day' => $this->days[$extra->day_of_week] ?? $extra->day_of_week ?? '-',
                'time' => $extra->start_time && $extra->end_time
                    ? $extra->start_time . ' - ' . $extra->end_time
                    : '-',
                'room' => $extra->room ?? '-',
                'semester' => optional($extra->semester)->name ?? '-',
                'is_extracurricular' => true,
            ];
        });

        $formatted = $formattedRegular->concat($extraFormatted)->values();

        return Inertia::render('Admin/Schedule/Index', [
            'schedules' => $formatted,
            'pagination' => [
                'total' => $schedules->total(),
                'per_page' => $schedules->perPage(),
                'current_page' => $schedules->currentPage(),
                'last_page' => $schedules->lastPage(),
            ],
            'filters' => [
                'class_id' => $validated['class_id'] ?? '',
                'teacher_id' => $validated['teacher_id'] ?? '',
                'subject_id' => $validated['subject_id'] ?? '',
                'semester_id' => $validated['semester_id'] ?? '',
                'day' => $validated['day'] ?? '',
                'search' => $validated['search'] ?? '',
            ],
            'options' => [
                'classes' => Classroom::select('id', 'name')->orderBy('name')->get(),
                'teachers' => Teacher::select('id', 'name')->orderBy('name')->get(),
                'subjects' => Subject::select('id', 'name', 'class_id')->orderBy('name')->get(),
                'extracurriculars' => \App\Models\Extracurricular::select('id', 'name', 'teacher_id')->orderBy('name')->get(),
                'semesters' => Semester::select('id', 'name')->orderByDesc('start_date')->get(),
                'days' => $this->days,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Schedule/Create', [
            'options' => $this->formOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'day_of_week' => 'required|in:' . implode(',', array_keys($this->days)),
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $this->assertSubjectBelongsToClass($validated['subject_id'], $validated['class_id']);

        Schedule::create($validated);

        return redirect()->route('admin.schedules.index')->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function edit(Schedule $schedule)
    {
        return Inertia::render('Admin/Schedule/Edit', [
            'schedule' => [
                'id' => $schedule->id,
                'class_id' => $schedule->class_id,
                'subject_id' => $schedule->subject_id,
                'teacher_id' => $schedule->teacher_id,
                'semester_id' => $schedule->semester_id,
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'room' => $schedule->room,
                'meeting_link' => $schedule->meeting_link,
                'notes' => $schedule->notes,
            ],
            'options' => $this->formOptions(),
            'days' => $this->days,
        ]);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'day_of_week' => 'required|in:' . implode(',', array_keys($this->days)),
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $this->assertSubjectBelongsToClass($validated['subject_id'], $validated['class_id']);

        $schedule->update($validated);

        return redirect()->route('admin.schedules.index')->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()->route('admin.schedules.index')->with('success', 'Jadwal berhasil dihapus.');
    }

    private function formOptions(): array
    {
        return [
            'classes' => Classroom::select('id', 'name')->orderBy('name')->get(),
            'teachers' => Teacher::select('id', 'name')->orderBy('name')->get(),
            'subjects' => Subject::select('id', 'name', 'class_id', 'teacher_id')->orderBy('name')->get(),
            'semesters' => Semester::select('id', 'name')->orderByDesc('start_date')->get(),
            'days' => $this->days,
        ];
    }

    private function assertSubjectBelongsToClass(int $subjectId, int $classId): void
    {
        $subject = Subject::find($subjectId);

        if ($subject && $subject->class_id !== $classId) {
            throw ValidationException::withMessages([
                'subject_id' => ['Mata pelajaran harus sesuai dengan kelas yang dipilih.'],
            ]);
        }
    }
}
