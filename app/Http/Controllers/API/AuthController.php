<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login siswa dan mendapatkan token API
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)
            ->where('role', 'siswa')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Revoke previous tokens (optional, hapus jika ingin mempertahankan token lama)
        // $user->tokens()->delete();

        // Create token with ability 'student'
        $token = $user->createToken($request->device_name, ['student'])->plainTextToken;

        $student = Student::where('user_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'student_id' => $student->id,
                'name' => $student->name,
                'nisn' => $student->nisn,
            ],
            'token' => $token
        ], 200);
    }

    /**
     * Logout siswa dan menghapus token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ], 200);
    }

    /**
     * Mendapatkan profil siswa yang sedang login
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Data siswa tidak ditemukan'
            ], 404);
        }

        // Data yang akan dikembalikan
        $data = [
            'id' => $student->id,
            'name' => $student->name,
            'nisn' => $student->nisn,
            'email' => $user->email,
            'gender' => $student->gender,
            'birth_date' => $student->birth_date,
            'birth_place' => $student->birth_place,
            'religion' => $student->religion,
            'current_semester' => null,
            'current_class' => null
        ];

        // Dapatkan semester aktif dan kelas saat ini (jika ada)
        $currentSemester = $student->semesters()->orderBy('start_date', 'desc')->first();
        if ($currentSemester) {
            $data['current_semester'] = [
                'id' => $currentSemester->id,
                'name' => $currentSemester->name
            ];

            $currentClass = $student->getClassesForSemester($currentSemester->id)->first();
            if ($currentClass) {
                $data['current_class'] = [
                    'id' => $currentClass->id,
                    'name' => $currentClass->name
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }
}
