<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response|RedirectResponse
    {
        if (Auth::check()) {
            switch (Auth::user()->role) {
                case 'admin':
                    return redirect()->route('admin.dashboard');
                case 'guru':
                    return redirect()->route('teacher.dashboard');
                case 'siswa':
                    return redirect()->route('student.dashboard');
                default:
                    break;
            }
        }

        // Reset session token untuk memastikan CSRF token baru
        Session::regenerateToken();

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            // Tambahkan CSRF token langsung ke view
            'csrf_token' => csrf_token(),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            // Validasi manual sebelum mencoba authenticate
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            // Menyimpan email yang mencoba login untuk digunakan dalam log
            $email = $request->email;

            try {
                $request->authenticate();

                // Login berhasil - catat aktivitas
                $user = Auth::user();
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'login',
                    'description' => 'User berhasil login ke sistem',
                    'ip_address' => $request->ip()
                ]);

                // Regenerate session dengan parameter 'true' untuk mempertahankan data sesi
                $request->session()->regenerate(true);

                // Set cookie SameSite attribute untuk menghindari masalah CSRF di browser modern
                config(['session.same_site' => 'lax']);

                // Simpan info login di session
                session(['user_id' => $user->id, 'user_role' => $user->role]);

                // Redirect berdasarkan role dengan parameter absolute URL
                $redirectUrl = match ($user->role) {
                    'admin' => route('admin.dashboard', [], true),
                    'guru' => route('teacher.dashboard', [], true),
                    'siswa' => route('student.dashboard', [], true),
                    default => route('dashboard', [], true),
                };

                return redirect()->to($redirectUrl);
            } catch (ValidationException $e) {
                // Login gagal - catat percobaan login gagal
                // Cari user dengan email yang dicoba untuk login
                $user = \App\Models\User::where('email', $email)->first();

                if ($user) {
                    // Jika user ditemukan, catat dengan user_id
                    ActivityLog::create([
                        'user_id' => $user->id,
                        'action' => 'login gagal',
                        'description' => 'Percobaan login gagal: password salah',
                        'ip_address' => $request->ip()
                    ]);
                } else {
                    // Jika user tidak ditemukan, catat tanpa user_id
                    // Karena tabel memerlukan user_id, kita gunakan ID dari user sistem atau admin
                    $adminUser = \App\Models\User::where('role', 'admin')->first();
                    if ($adminUser) {
                        ActivityLog::create([
                            'user_id' => $adminUser->id, // Gunakan ID admin untuk log
                            'action' => 'login gagal',
                            'description' => "Percobaan login gagal: email tidak ditemukan ($email)",
                            'ip_address' => $request->ip()
                        ]);
                    }
                }

                // Regenerate token pada kegagalan login juga
                Session::regenerateToken();

                throw $e; // Re-throw exception untuk penanganan error default
            }
        } catch (ValidationException $e) {
            return back()->withErrors([
                'email' => 'Credentials do not match our records.',
            ])->withInput($request->except('password'));
        } catch (\Exception $e) {
            // Tangkap semua error lainnya
            Session::regenerateToken();

            return back()->withErrors([
                'error' => 'An unexpected error occurred. Please try again.',
            ])->withInput($request->except('password'));
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Catat aktivitas logout sebelum user logout
        if (Auth::check()) {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'logout',
                'description' => 'User logout dari sistem',
                'ip_address' => $request->ip()
            ]);
        }

        Auth::guard('web')->logout();

        // Invalidate dan regenerate dalam satu langkah
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Clear specific cookies yang mungkin menyebabkan masalah
        $cookieJar = cookie()->forget('laravel_session');

        return redirect('/')->withCookie($cookieJar);
    }
}
