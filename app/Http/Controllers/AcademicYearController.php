<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AcademicYearController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:name,start_date,end_date,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'start_date');
        $sortOrder = $request->input('sort_order', 'desc');

        $query = AcademicYear::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $query->orderBy($sortBy, $sortOrder);

        $years = $query->paginate($perPage)->withQueryString();

        $formattedYears = $years->map(function (AcademicYear $year) {
            return [
                'id' => $year->id,
                'name' => $year->name,
                'start_date' => $year->start_date,
                'end_date' => $year->end_date,
                'formatted_start_date' => $year->start_date ? $year->start_date->format('d M Y') : null,
                'formatted_end_date' => $year->end_date ? $year->end_date->format('d M Y') : null,
                'is_active' => (bool) $year->is_active,
                'created_at' => $year->created_at ? $year->created_at->format('d-m-Y H:i') : null,
            ];
        });

        return Inertia::render('Admin/AcademicYear/Index', [
            'years' => $formattedYears,
            'pagination' => [
                'total' => $years->total(),
                'per_page' => $years->perPage(),
                'current_page' => $years->currentPage(),
                'last_page' => $years->lastPage(),
                'from' => $years->firstItem(),
                'to' => $years->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/AcademicYear/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            $isActive = $request->boolean('is_active', false);

            if ($isActive) {
                AcademicYear::query()->update(['is_active' => false]);
            }

            $year = AcademicYear::create([
                'name' => $request->name,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_active' => $isActive,
            ]);

            DB::commit();

            return redirect()
                ->route('admin.academic-years.index')
                ->with('success', 'Tahun ajar berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating academic year: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal menambahkan tahun ajar: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function edit(AcademicYear $academicYear)
    {
        return Inertia::render('Admin/AcademicYear/Edit', [
            'year' => [
                'id' => $academicYear->id,
                'name' => $academicYear->name,
                'start_date' => $academicYear->start_date ? $academicYear->start_date->format('Y-m-d') : null,
                'end_date' => $academicYear->end_date ? $academicYear->end_date->format('Y-m-d') : null,
                'is_active' => (bool) $academicYear->is_active,
            ],
        ]);
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name,' . $academicYear->id,
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            $isActive = $request->boolean('is_active', $academicYear->is_active);

            if ($isActive) {
                AcademicYear::where('id', '!=', $academicYear->id)->update(['is_active' => false]);
            }

            $academicYear->update([
                'name' => $request->name,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'is_active' => $isActive,
            ]);

            DB::commit();

            return redirect()
                ->route('admin.academic-years.index')
                ->with('success', 'Tahun ajar berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating academic year: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal memperbarui tahun ajar: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function destroy(AcademicYear $academicYear)
    {
        try {
            $academicYear->delete();

            return redirect()
                ->route('admin.academic-years.index')
                ->with('success', 'Tahun ajar berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting academic year: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal menghapus tahun ajar: ' . $e->getMessage()]);
        }
    }
}
