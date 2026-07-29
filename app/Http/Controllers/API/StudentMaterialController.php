<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StudentMaterialController extends Controller
{
    /**
     * List materials for current student with optional filters.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string|max:50',
            'subject_id' => 'nullable|integer',
            'sort_by' => 'nullable|string|in:title,created_at,subject',
            'sort_order' => 'nullable|string|in:asc,desc',
            'file_type' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data yang diberikan tidak valid',
                'errors' => $validator->errors(),
            ], 422);
        }

        $search = $request->input('search', '');
        $subjectId = $request->input('subject_id');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $fileType = $request->input('file_type');

        // Kelas aktif
        $current = DB::table('semesters_students')
            ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
            ->where('semesters_students.students_id', $student->id)
            ->orderBy('semesters.end_date', 'desc')
            ->select('semesters_students.class_id', 'semesters_students.semesters_id')
            ->first();

        if (!$current) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $currentSemesterId = $current->semesters_id;
        $subjectIds = Subject::where('class_id', $current->class_id)->pluck('id')->toArray();

        $query = Material::whereIn('subject_id', $subjectIds)
            ->where(function ($q) use ($currentSemesterId) {
                $q->where('semester_id', $currentSemesterId);
            });

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        if ($fileType) {
            $query->where('file_type', $fileType);
        }

        if ($sortBy === 'title') {
            $query->orderBy('title', $sortOrder);
        } elseif ($sortBy === 'subject') {
            $query->join('subjects', 'materials.subject_id', '=', 'subjects.id')
                ->orderBy('subjects.name', $sortOrder)
                ->select('materials.*');
        } else {
            $query->orderBy('created_at', $sortOrder);
        }

        $materials = $query->with('subject')->get()->map(function (Material $material) {
            return [
                'id' => $material->id,
                'title' => $material->title,
                'content' => $material->content,
                'file_path' => $material->file_path,
                'file_type' => $material->file_type,
                'subject_id' => $material->subject_id,
                'subject_name' => $material->subject->name ?? '-',
                'created_at' => $material->created_at->format('Y-m-d H:i:s'),
                'has_file' => (bool) $material->file_path,
                'file_name' => $material->file_path ? basename($material->file_path) : null,
                'file_extension' => $material->file_path ? pathinfo($material->file_path, PATHINFO_EXTENSION) : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    /**
     * Show material detail for current student.
     */
    public function show(Request $request, Material $material)
    {
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
            ->select('semesters_students.class_id')
            ->first();

        if (!$current) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke materi ini',
            ], 403);
        }

        $subject = Subject::find($material->subject_id);

        if (!$subject || $subject->class_id != $current->class_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke materi ini',
            ], 403);
        }

        $related = Material::where('subject_id', $material->subject_id)
            ->where('id', '!=', $material->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function (Material $m) {
                return [
                    'id' => $m->id,
                    'title' => $m->title,
                    'file_type' => $m->file_type,
                    'created_at' => $m->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $materialData = [
            'id' => $material->id,
            'title' => $material->title,
            'content' => $material->content,
            'file_path' => $material->file_path,
            'file_type' => $material->file_type,
            'file_name' => $material->file_path ? basename($material->file_path) : null,
            'file_extension' => $material->file_path ? pathinfo($material->file_path, PATHINFO_EXTENSION) : null,
            'subject_id' => $material->subject_id,
            'subject_name' => $subject->name,
            'teacher_name' => $subject->teacher->name ?? 'Unknown',
            'created_at' => $material->created_at->format('Y-m-d H:i:s'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'material' => $materialData,
                'related' => $related,
            ],
        ]);
    }
}

