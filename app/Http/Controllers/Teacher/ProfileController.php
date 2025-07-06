<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Show the teacher's profile for editing.
     */
    public function edit()
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Format teacher data
            $formattedTeacher = [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'nip' => $teacher->nip,
                'phone' => $teacher->phone ?? '',
                'address' => $teacher->address ?? '',
                'email' => $user->email,
            ];

            // Get statistics
            $stats = $this->getTeacherStats($teacher);

            return Inertia::render('Teacher/Profile/Edit', [
                'teacher' => $formattedTeacher,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher profile edit: ' . $e->getMessage());
            return redirect()->route('teacher.dashboard')->withErrors([
                'error' => 'Failed to load profile: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update the teacher's profile information.
     */
    public function update(Request $request)
    {
        try {
            // Get current teacher
            $user = Auth::user();
            $teacher = Teacher::where('user_id', $user->id)->firstOrFail();

            // Check if this is a password update request
            if ($request->filled('current_password') || $request->filled('password')) {
                return $this->updatePassword($request, $user);
            }

            // Validate profile update request
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:1000', // Increased max length for address
            ]);

            // Start transaction
            DB::beginTransaction();

            // Update teacher information
            $teacher->update([
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);

            // Update user email if changed
            if ($user->email !== $validated['email']) {
                $user->update([
                    'email' => $validated['email'],
                ]);
            }

            DB::commit();

            // Log activity
            $this->logActivity($user, 'update_profile', 'Updated profile information', $request->ip());

            return redirect()->route('teacher.profile.edit')
                ->with('success', 'Profile updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher profile update: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to update profile: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Update teacher password
     */
    private function updatePassword(Request $request, User $user)
    {
        try {
            // Validate password update request
            $validated = $request->validate([
                'current_password' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ]);

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'The provided password does not match your current password.',
                    'errors' => [
                        'current_password' => ['The provided password does not match your current password.']
                    ]
                ], 422);
            }

            // Update password
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);

            // Log activity
            $this->logActivity($user, 'update_password', 'Updated password', $request->ip());

            return redirect()->route('teacher.profile.edit')
                ->with('success', 'Password updated successfully');
        } catch (\Exception $e) {
            Log::error('Error in teacher password update: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'current_password' => 'Failed to update password: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get teacher statistics for the profile page.
     */
    private function getTeacherStats($teacher)
    {
        try {
            // Get subjects count
            $subjectsCount = DB::table('subjects')
                ->where('teacher_id', $teacher->id)
                ->count();

            // Get unique classes count
            $classesCount = DB::table('subjects')
                ->where('teacher_id', $teacher->id)
                ->distinct('class_id')
                ->count('class_id');

            // Get class IDs for this teacher
            $classIds = DB::table('subjects')
                ->where('teacher_id', $teacher->id)
                ->pluck('class_id')
                ->unique();

            // Get students count - FIX: use correct column name
            $studentsCount = 0;
            if ($classIds->isNotEmpty()) {
                $studentsCount = DB::table('semesters_students')
                    ->whereIn('class_id', $classIds)
                    ->distinct('students_id') // Keep as is if your migration uses students_id
                    ->count('students_id');
            }

            // Get materials count
            $materialsCount = DB::table('materials')
                ->whereIn('subject_id', function ($query) use ($teacher) {
                    $query->select('id')
                        ->from('subjects')
                        ->where('teacher_id', $teacher->id);
                })
                ->count();

            // Get assignments count
            $assignmentsCount = DB::table('assignments')
                ->whereIn('subject_id', function ($query) use ($teacher) {
                    $query->select('id')
                        ->from('subjects')
                        ->where('teacher_id', $teacher->id);
                })
                ->count();

            return [
                'subjects_count' => $subjectsCount,
                'classes_count' => $classesCount,
                'students_count' => $studentsCount,
                'materials_count' => $materialsCount,
                'assignments_count' => $assignmentsCount,
            ];
        } catch (\Exception $e) {
            Log::error('Error getting teacher stats: ' . $e->getMessage());

            // Return default values if there's an error
            return [
                'subjects_count' => 0,
                'classes_count' => 0,
                'students_count' => 0,
                'materials_count' => 0,
                'assignments_count' => 0,
            ];
        }
    }

    /**
     * Log user activity
     */
    private function logActivity($user, $action, $description, $ipAddress)
    {
        try {
            DB::table('activity_logs')->insert([
                'user_id' => $user->id,
                'action' => $action,
                'description' => $description,
                'ip_address' => $ipAddress,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error logging activity: ' . $e->getMessage());
        }
    }
}
