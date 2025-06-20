<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MaterialController extends Controller
{
    /**
     * Display a listing of the materials for a subject.
     */
    public function index(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'subject_id' => 'required|exists:subjects,id',
                'search' => 'nullable|string|max:50',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'sort_by' => 'nullable|string|in:title,created_at,file_type',
                'sort_order' => 'nullable|string|in:asc,desc',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get the subject
            $subject = Subject::findOrFail($request->subject_id);

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to view materials for this subject.');
            }

            // Set default values
            $search = $request->input('search', '');
            $perPage = $request->input('per_page', 10);
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $page = $request->input('page', 1);

            // Query materials for this subject
            $query = Material::where('subject_id', $subject->id);

            // Apply search if provided
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $query->orderBy($sortBy, $sortOrder);

            // Get paginated results
            $materials = $query->paginate($perPage)->withQueryString();

            // Format data for frontend
            $formattedMaterials = $materials->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'content' => $material->content,
                    'file_path' => $material->file_path,
                    'file_type' => $material->file_type,
                    'created_at' => $material->created_at->format('d M Y, H:i'),
                    'updated_at' => $material->updated_at->format('d M Y, H:i'),
                ];
            });

            // Get formatted subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_id' => $subject->class_id,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            // Return view with data
            return Inertia::render('Teacher/Material/Index', [
                'materials' => $formattedMaterials,
                'subject' => $formattedSubject,
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
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher materials index: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load materials: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for creating a new material.
     */
    public function create(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'subject_id' => 'required|exists:subjects,id',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get the subject
            $subject = Subject::findOrFail($request->subject_id);

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to add materials to this subject.');
            }

            // Format subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            return Inertia::render('Teacher/Material/Create', [
                'subject' => $formattedSubject,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher materials create: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load create form: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Store a newly created material in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'subject_id' => 'required|exists:subjects,id',
                'title' => 'required|string|max:255',
                'content' => 'nullable|string',
                'file' => 'nullable|file|max:20480', // 20MB max
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Get the subject
            $subject = Subject::findOrFail($request->subject_id);

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to add materials to this subject.');
            }

            // Start transaction
            DB::beginTransaction();

            // Prepare material data
            $materialData = [
                'subject_id' => $subject->id,
                'title' => $request->title,
                'content' => $request->content,
            ];

            // Handle file upload if present
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('materials', $fileName, 'public');
                $materialData['file_path'] = Storage::url($filePath);
                $materialData['file_type'] = $file->getClientMimeType();
            }

            // Create material
            $material = Material::create($materialData);

            // Create notification for students
            $this->createNotificationsForStudents($subject, $material, 'material');

            // Log activity
            $this->logActivity(Auth::id(), 'create_material', "Created new material: {$material->title} for subject: {$subject->name}");

            DB::commit();

            return redirect()->route('teacher.materials.index', ['subject_id' => $subject->id])
                ->with('success', 'Material added successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher materials store: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to create material: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Display the specified material.
     */
    public function show(Material $material)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load subject
            $material->load('subject');
            $subject = $material->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to view this material.');
            }

            // Format material data
            $formattedMaterial = [
                'id' => $material->id,
                'title' => $material->title,
                'content' => $material->content,
                'file_path' => $material->file_path,
                'file_type' => $material->file_type,
                'created_at' => $material->created_at->format('d M Y, H:i'),
                'updated_at' => $material->updated_at->format('d M Y, H:i'),
            ];

            // Format subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            return Inertia::render('Teacher/Material/Show', [
                'material' => $formattedMaterial,
                'subject' => $formattedSubject,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher materials show: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to display material: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for editing the specified material.
     */
    public function edit(Material $material)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load subject
            $material->load('subject');
            $subject = $material->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to edit this material.');
            }

            // Format material data
            $formattedMaterial = [
                'id' => $material->id,
                'title' => $material->title,
                'content' => $material->content,
                'file_path' => $material->file_path,
                'file_type' => $material->file_type,
            ];

            // Format subject data
            $formattedSubject = [
                'id' => $subject->id,
                'name' => $subject->name,
                'class_name' => $subject->classroom ? $subject->classroom->name : '-',
            ];

            return Inertia::render('Teacher/Material/Edit', [
                'material' => $formattedMaterial,
                'subject' => $formattedSubject,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher materials edit: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load edit form: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified material in storage.
     */
    public function update(Request $request, Material $material)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'nullable|string',
                'file' => 'nullable|file|max:20480', // 20MB max
                'remove_file' => 'nullable|boolean',
            ]);

            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load subject
            $material->load('subject');
            $subject = $material->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to edit this material.');
            }

            // Start transaction
            DB::beginTransaction();

            // Prepare update data
            $updateData = [
                'title' => $request->title,
                'content' => $request->content,
            ];

            // Handle file upload or removal
            if ($request->hasFile('file')) {
                // Remove old file if exists
                if ($material->file_path && Storage::exists('public/materials/' . basename($material->file_path))) {
                    Storage::delete('public/materials/' . basename($material->file_path));
                }

                // Store new file
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('materials', $fileName, 'public');
                $updateData['file_path'] = Storage::url($filePath);
                $updateData['file_type'] = $file->getClientMimeType();
            } elseif ($request->boolean('remove_file')) {
                // Remove file if requested
                if ($material->file_path && Storage::exists('public/materials/' . basename($material->file_path))) {
                    Storage::delete('public/materials/' . basename($material->file_path));
                }
                $updateData['file_path'] = null;
                $updateData['file_type'] = null;
            }

            // Update material
            $material->update($updateData);

            // Log activity
            $this->logActivity(Auth::id(), 'update_material', "Updated material: {$material->title} for subject: {$subject->name}");

            DB::commit();

            return redirect()->route('teacher.materials.index', ['subject_id' => $subject->id])
                ->with('success', 'Material updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher materials update: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to update material: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Remove the specified material from storage.
     */
    public function destroy(Material $material)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Load subject
            $material->load('subject');
            $subject = $material->subject;

            // Check if the subject belongs to this teacher
            if ($subject->teacher_id !== $teacher->id) {
                return redirect()->route('teacher.subjects.index')
                    ->with('error', 'You do not have permission to delete this material.');
            }

            // Start transaction
            DB::beginTransaction();

            // Store material info for log
            $materialTitle = $material->title;
            $subjectName = $subject->name;
            $subjectId = $subject->id;

            // Delete file if exists
            if ($material->file_path && Storage::exists('public/materials/' . basename($material->file_path))) {
                Storage::delete('public/materials/' . basename($material->file_path));
            }

            // Delete material
            $material->delete();

            // Log activity
            $this->logActivity(Auth::id(), 'delete_material', "Deleted material: {$materialTitle} from subject: {$subjectName}");

            DB::commit();

            return redirect()->route('teacher.materials.index', ['subject_id' => $subjectId])
                ->with('success', 'Material deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher materials destroy: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to delete material: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Create notifications for students in the subject's class
     */
    private function createNotificationsForStudents($subject, $material, $type)
    {
        try {
            // Get all students in the subject's class
            $studentUserIds = DB::table('semesters_students')
                ->join('students', 'semesters_students.students_id', '=', 'students.id')
                ->where('semesters_students.class_id', $subject->class_id)
                ->pluck('students.user_id');

            // Create notification data
            $notificationData = [
                'title' => 'New Material Available',
                'content' => "A new material '{$material->title}' has been added to {$subject->name}.",
                'is_read' => false,
                'type' => 'material',
                'related_id' => $material->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Insert notifications for each student
            foreach ($studentUserIds as $userId) {
                $notificationData['user_id'] = $userId;
                DB::table('notifications')->insert($notificationData);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Error creating notifications: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Log activity
     */
    private function logActivity($userId, $action, $description)
    {
        try {
            DB::table('activity_logs')->insert([
                'user_id' => $userId,
                'action' => $action,
                'description' => $description,
                'ip_address' => request()->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('Error logging activity: ' . $e->getMessage());
            return false;
        }
    }
}
