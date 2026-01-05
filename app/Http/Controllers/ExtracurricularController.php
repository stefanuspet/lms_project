<?php

namespace App\Http\Controllers;

use App\Models\Extracurricular;
use App\Models\Teacher;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ExtracurricularController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);

        $query = Extracurricular::with('teacher');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $query->orderBy('name', 'asc');

        $extracurriculars = $query->paginate($perPage)->withQueryString();

        $formatted = $extracurriculars->map(function (Extracurricular $item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'teacher_name' => optional($item->teacher)->name,
                 'semester_name' => optional($item->semester)->name,
                'day_of_week' => $item->day_of_week,
                'start_time' => $item->start_time,
                'end_time' => $item->end_time,
                'room' => $item->room,
                'is_active' => (bool) $item->is_active,
            ];
        });

        return Inertia::render('Admin/Extracurricular/Index', [
            'extracurriculars' => $formatted,
            'pagination' => [
                'total' => $extracurriculars->total(),
                'per_page' => $extracurriculars->perPage(),
                'current_page' => $extracurriculars->currentPage(),
                'last_page' => $extracurriculars->lastPage(),
                'from' => $extracurriculars->firstItem(),
                'to' => $extracurriculars->lastItem(),
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Export extracurriculars as CSV (bisa dibuka di Excel).
     */
    public function export(Request $request)
    {
        $items = Extracurricular::with(['teacher', 'semester'])->get();

        $filename = 'data_ekstrakurikuler_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($items) {
            $output = fopen('php://output', 'w');

            // Tambah BOM supaya Excel membaca UTF-8 dengan benar
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            $delimiter = ';';

            // Header kolom
            fputcsv($output, ['Nama Ekskul', 'Pembina', 'Semester', 'Hari', 'Jam', 'Ruangan', 'Status'], $delimiter);

            $dayMap = [
                'monday' => 'Senin',
                'tuesday' => 'Selasa',
                'wednesday' => 'Rabu',
                'thursday' => 'Kamis',
                'friday' => 'Jumat',
                'saturday' => 'Sabtu',
                'sunday' => 'Minggu',
            ];

            foreach ($items as $item) {
                $hari = $dayMap[$item->day_of_week] ?? $item->day_of_week;
                $jam = $item->start_time && $item->end_time
                    ? $item->start_time . ' - ' . $item->end_time
                    : '';
                $status = $item->is_active ? 'Aktif' : 'Nonaktif';

                fputcsv($output, [
                    $item->name,
                    optional($item->teacher)->name,
                    optional($item->semester)->name,
                    $hari,
                    $jam,
                    $item->room,
                    $status,
                ], $delimiter);
            }

            fclose($output);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    public function create()
    {
        return Inertia::render('Admin/Extracurricular/Create', [
            'teachers' => Teacher::orderBy('name')->get(['id', 'name']),
            'semesters' => Semester::orderByDesc('start_date')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'teacher_id' => 'required|exists:teachers,id',
            'semester_id' => 'required|exists:semesters,id',
            'day_of_week' => 'nullable|string|max:20',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            $extracurricular = Extracurricular::create([
                'name' => $request->name,
                'description' => $request->description,
                'teacher_id' => $request->teacher_id,
                'semester_id' => $request->semester_id,
                'day_of_week' => $request->day_of_week,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'room' => $request->room,
                'is_active' => $request->boolean('is_active', true),
            ]);

            DB::commit();

            return redirect()
                ->route('admin.extracurriculars.index')
                ->with('success', 'Ekstrakurikuler berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating extracurricular: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal menambahkan ekstrakurikuler: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function edit(Extracurricular $extracurricular)
    {
        return Inertia::render('Admin/Extracurricular/Edit', [
            'extracurricular' => [
                'id' => $extracurricular->id,
                'name' => $extracurricular->name,
                'description' => $extracurricular->description,
                'teacher_id' => $extracurricular->teacher_id,
                'semester_id' => $extracurricular->semester_id,
                'day_of_week' => $extracurricular->day_of_week,
                'start_time' => $extracurricular->start_time,
                'end_time' => $extracurricular->end_time,
                'room' => $extracurricular->room,
                'is_active' => (bool) $extracurricular->is_active,
            ],
            'teachers' => Teacher::orderBy('name')->get(['id', 'name']),
            'semesters' => Semester::orderByDesc('start_date')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Extracurricular $extracurricular)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'teacher_id' => 'required|exists:teachers,id',
            'semester_id' => 'required|exists:semesters,id',
            'day_of_week' => 'nullable|string|max:20',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            $extracurricular->update([
                'name' => $request->name,
                'description' => $request->description,
                'teacher_id' => $request->teacher_id,
                'semester_id' => $request->semester_id,
                'day_of_week' => $request->day_of_week,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'room' => $request->room,
                'is_active' => $request->boolean('is_active', $extracurricular->is_active),
            ]);

            DB::commit();

            return redirect()
                ->route('admin.extracurriculars.index')
                ->with('success', 'Ekstrakurikuler berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating extracurricular: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal memperbarui ekstrakurikuler: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function destroy(Extracurricular $extracurricular)
    {
        try {
            $extracurricular->delete();

            return redirect()
                ->route('admin.extracurriculars.index')
                ->with('success', 'Ekstrakurikuler berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting extracurricular: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal menghapus ekstrakurikuler: ' . $e->getMessage()]);
        }
    }
}
