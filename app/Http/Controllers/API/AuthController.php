<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
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
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
                'device_name' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data yang diberikan tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Cari user berdasarkan email
            $user = User::where('email', $request->email)
                ->where('role', 'siswa')
                ->first();

            // Validasi credentials
            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password tidak valid'
                ], 401);
            }

            // Hapus token lama (opsional)
            $user->tokens()->delete();

            // Buat token baru
            $token = $user->createToken($request->device_name, ['student'])->plainTextToken;

            // Ambil data siswa
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data siswa tidak ditemukan'
                ], 404);
            }

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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan internal server',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error'
            ], 500);
        }
    }

    /**
     * Logout siswa dan menghapus token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // Revoke the current token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat logout',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error'
            ], 500);
        }
    }

    /**
     * Mendapatkan profil siswa yang sedang login
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile(Request $request)
    {
        try {
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
            $currentSemesterStudent = $student->semesters()
                ->orderBy('start_date', 'desc')
                ->first();

            if ($currentSemesterStudent) {
                $data['current_semester'] = [
                    'id' => $currentSemesterStudent->id,
                    'name' => $currentSemesterStudent->name
                ];

                // Cari kelas untuk semester ini
                $currentClassRelation = $student->semesters()
                    ->where('semesters.id', $currentSemesterStudent->id)
                    ->first();

                if ($currentClassRelation && $currentClassRelation->pivot) {
                    $class = Classroom::find($currentClassRelation->pivot->class_id);
                    if ($class) {
                        $data['current_class'] = [
                            'id' => $class->id,
                            'name' => $class->name
                        ];
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil profil',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error'
            ], 500);
        }
    }

    /**
     * Ubah password
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data yang diberikan tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            // Cek password lama
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password lama tidak benar'
                ], 400);
            }

            // Update password
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diubah'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengubah password',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal Server Error'
            ], 500);
        }
    }
}
