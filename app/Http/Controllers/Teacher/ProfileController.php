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
                'phone' => $teacher->phone,
                'address' => $teacher->address,
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

            // Validate request
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'current_password' => 'nullable|required_with:password|string',
                'password' => 'nullable|string|min:8|confirmed',
            ]);

            // Start transaction
            DB::beginTransaction();

            // Update teacher information
            $teacher->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'address' => $request->address,
            ]);

            // Update user email
            if ($user->email !== $request->email) {
                $user->update([
                    'email' => $request->email,
                ]);
            }

            // Update password if provided
            if ($request->filled('password')) {
                // Verify current password
                if (!Hash::check($request->current_password, $user->password)) {
                    return redirect()->back()->withErrors([
                        'current_password' => 'The provided password does not match your current password.'
                    ]);
                }

                $user->update([
                    'password' => Hash::make($request->password),
                ]);
            }

            DB::commit();

            // Log activity
            DB::table('activity_logs')->insert([
                'user_id' => $user->id,
                'action' => 'update_profile',
                'description' => 'Updated profile information',
                'ip_address' => $request->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

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
     * Get teacher statistics for the profile page.
     */
    private function getTeacherStats($teacher)
    {
        // Get subjects count
        $subjectsCount = DB::table('subjects')
            ->where('teacher_id', $teacher->id)
            ->count();

        // Get unique classes count
        $classesCount = DB::table('subjects')
            ->where('teacher_id', $teacher->id)
            ->distinct('class_id')
            ->count('class_id');

        // Get students count across all classes
        $classIds = DB::table('subjects')
            ->where('teacher_id', $teacher->id)
            ->pluck('class_id');

        $studentsCount = DB::table('semesters_students')
            ->whereIn('class_id', $classIds)
            ->distinct('students_id')
            ->count('students_id');

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

        // Get attendance sessions count
        $attendanceCount = DB::table('attendance_sessions')
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
            'attendance_count' => $attendanceCount,
        ];
    }
}
