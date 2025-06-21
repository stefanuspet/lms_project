<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
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
    public function edit()
    {
        try {
            // Get current student data
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Get current class and semester
            $currentSemesterStudent = DB::table('semesters_students')
                ->join('semesters', 'semesters_students.semesters_id', '=', 'semesters.id')
                ->join('classes', 'semesters_students.class_id', '=', 'classes.id')
                ->where('semesters_students.students_id', $student->id)
                ->orderBy('semesters.end_date', 'desc')
                ->select(
                    'classes.name as class_name',
                    'semesters.name as semester_name',
                    'semesters.start_date',
                    'semesters.end_date'
                )
                ->first();

            return Inertia::render('Student/Profile/Edit', [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $user->email,
                    'nisn' => $student->nisn,
                    'gender' => $student->gender,
                    'birth_date' => $student->birth_date ? date('Y-m-d', strtotime($student->birth_date)) : null,
                    'birth_place' => $student->birth_place,
                    'religion' => $student->religion,
                ],
                'current_class' => $currentSemesterStudent ? [
                    'class_name' => $currentSemesterStudent->class_name,
                    'semester_name' => $currentSemesterStudent->semester_name,
                    'semester_period' => date('d M Y', strtotime($currentSemesterStudent->start_date)) . ' - ' .
                        date('d M Y', strtotime($currentSemesterStudent->end_date))
                ] : null
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student profile edit: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to load profile: ' . $e->getMessage()
            ]);
        }
    }

    public function update(Request $request)
    {
        try {
            // Get current student
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->firstOrFail();

            // Validate basic info
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users')->ignore($user->id),
                ],
                'gender' => 'nullable|in:male,female',
                'birth_date' => 'nullable|date',
                'birth_place' => 'nullable|string|max:255',
                'religion' => 'nullable|string|max:255',
                'current_password' => 'nullable|string',
                'new_password' => 'nullable|string|min:8|confirmed',
            ]);

            // Start transaction
            DB::beginTransaction();

            // Update student data
            $student->name = $validated['name'];
            $student->gender = $validated['gender'];
            $student->birth_date = $validated['birth_date'];
            $student->birth_place = $validated['birth_place'];
            $student->religion = $validated['religion'];
            $student->save();

            // Update user email if changed
            if ($user->email !== $validated['email']) {
                $user->email = $validated['email'];
                $user->save();
            }

            // Update password if provided
            if (!empty($validated['current_password']) && !empty($validated['new_password'])) {
                // Verify current password
                if (!Hash::check($validated['current_password'], $user->password)) {
                    return redirect()->back()->withErrors([
                        'current_password' => 'The current password is incorrect.'
                    ]);
                }

                // Update password
                $user->password = Hash::make($validated['new_password']);
                $user->save();
            }

            // Commit transaction
            DB::commit();

            // Log activity
            $this->logActivity($user->id, 'profile_update', 'Updated profile information');

            return redirect()->back()->with('success', 'Profile updated successfully.');
        } catch (\Exception $e) {
            // Rollback transaction
            DB::rollBack();

            Log::error('Error in student profile update: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to update profile: ' . $e->getMessage()
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
