<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Validate input
            $validated = $request->validate([
                'search' => 'nullable|string|max:50',
                'subject_id' => 'nullable|integer',
                'sort_by' => 'nullable|string|in:title,created_at,subject',
                'sort_order' => 'nullable|string|in:asc,desc',
                'file_type' => 'nullable|string',
            ]);

            // Set default values
            $search = $request->input('search', '');
            $subjectId = $request->input('subject_id');
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $fileType = $request->input('file_type');

            // Get current semester and class
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return Inertia::render('Student/Material/Index', [
                    'materials' => [],
                    'filters' => [
                        'search' => $search,
                        'subject_id' => $subjectId,
                        'sort_by' => $sortBy,
                        'sort_order' => $sortOrder,
                        'file_type' => $fileType,
                    ],
                    'subjects' => [],
                ]);
            }

            $currentClassId = $currentSemesterStudent->class_id;

            // Get all subjects for this student's class
            $subjects = Subject::where('class_id', $currentClassId)
                ->get()
                ->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                    ];
                });

            $subjectIds = $subjects->pluck('id')->toArray();

            // Base query for materials
            $query = Material::whereIn('subject_id', $subjectIds);

            // Apply filters
            if (!empty($search)) {
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

            // Apply sorting
            if ($sortBy === 'created_at') {
                $query->orderBy('created_at', $sortOrder);
            } else if ($sortBy === 'title') {
                $query->orderBy('title', $sortOrder);
            } else if ($sortBy === 'subject') {
                $query->join('subjects', 'materials.subject_id', '=', 'subjects.id')
                    ->orderBy('subjects.name', $sortOrder)
                    ->select('materials.*');
            }

            // Execute paginated query
            $materials = $query->with('subject')->paginate(12)->withQueryString();

            // Format data for frontend
            $formattedMaterials = $materials->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'content' => $material->content,
                    'file_path' => $material->file_path,
                    'file_type' => $material->file_type,
                    'subject_id' => $material->subject_id,
                    'subject_name' => $material->subject->name,
                    'created_at' => $material->created_at->format('d M Y'),
                    'has_file' => $material->file_path ? true : false,
                    'file_name' => $material->file_path ? basename($material->file_path) : null,
                    'file_extension' => $material->file_path ? pathinfo($material->file_path, PATHINFO_EXTENSION) : null,
                ];
            });

            // Get available file types for filtering
            $availableFileTypes = Material::whereIn('subject_id', $subjectIds)
                ->whereNotNull('file_type')
                ->distinct('file_type')
                ->pluck('file_type');

            // Return response
            return Inertia::render('Student/Material/Index', [
                'materials' => $formattedMaterials,
                'pagination' => [
                    'total' => $materials->total(),
                    'per_page' => $materials->perPage(),
                    'current_page' => $materials->currentPage(),
                    'last_page' => $materials->lastPage(),
                    'from' => $materials->firstItem(),
                    'to' => $materials->lastItem(),
                ],
                'filters' => [
                    'search' => $search,
                    'subject_id' => $subjectId,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                    'file_type' => $fileType,
                ],
                'subjects' => $subjects,
                'file_types' => $availableFileTypes,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student materials index: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to load materials: ' . $e->getMessage()
            ]);
        }
    }

    public function show(Material $material)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Check if this material is for the student's class
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->first();

            if (!$currentSemesterStudent) {
                return redirect()->route('student.materials.index')
                    ->with('error', 'You do not have access to this material.');
            }

            $subject = Subject::find($material->subject_id);

            if (!$subject || $subject->class_id != $currentSemesterStudent->class_id) {
                return redirect()->route('student.materials.index')
                    ->with('error', 'You do not have access to this material.');
            }

            // Get related materials from the same subject
            $relatedMaterials = Material::where('subject_id', $material->subject_id)
                ->where('id', '!=', $material->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($relatedMaterial) {
                    return [
                        'id' => $relatedMaterial->id,
                        'title' => $relatedMaterial->title,
                        'file_type' => $relatedMaterial->file_type,
                        'created_at' => $relatedMaterial->created_at->format('d M Y'),
                    ];
                });

            // Format data for view
            $formattedMaterial = [
                'id' => $material->id,
                'title' => $material->title,
                'content' => $material->content,
                'file_path' => $material->file_path,
                'file_type' => $material->file_type,
                'file_name' => $material->file_path ? basename($material->file_path) : null,
                'file_extension' => $material->file_path ? pathinfo($material->file_path, PATHINFO_EXTENSION) : null,
                'subject_id' => $material->subject_id,
                'subject_name' => $subject->name,
                'teacher_name' => $subject->teacher ? $subject->teacher->name : 'Unknown',
                'created_at' => $material->created_at->format('d M Y'),
            ];

            return Inertia::render('Student/Material/Show', [
                'material' => $formattedMaterial,
                'related_materials' => $relatedMaterials,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student material show: ' . $e->getMessage());

            return redirect()->route('student.materials.index')
                ->with('error', 'Failed to load material details: ' . $e->getMessage());
        }
    }

    public function download(Material $material)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Check if this material is for the student's class
            $currentSemesterStudent = DB::table('semesters_students')
                ->where('students_id', $student->id)
                ->first();

            $subject = Subject::find($material->subject_id);

            if (!$currentSemesterStudent || !$subject || $subject->class_id != $currentSemesterStudent->class_id) {
                return redirect()->route('student.materials.index')
                    ->with('error', 'You do not have access to this material.');
            }

            // Check if material has a file
            if (!$material->file_path) {
                return redirect()->back()->with('error', 'This material does not have a downloadable file.');
            }

            // Log activity
            $this->logActivity($user->id, 'material_download', 'Downloaded material: ' . $material->title);

            // Return file for download
            return Storage::disk('public')->download($material->file_path, basename($material->file_path));
        } catch (\Exception $e) {
            Log::error('Error in student material download: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to download material: ' . $e->getMessage()
            ]);
        }
    }

    // Function to log activity
    private function logActivity($userId, $action, $description)
    {
        DB::table('activity_logs')->insert([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
