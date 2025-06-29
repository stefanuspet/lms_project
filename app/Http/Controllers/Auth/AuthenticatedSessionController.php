<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
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

            $request->authenticate();

            // Regenerate session dengan parameter 'true' untuk mempertahankan data sesi
            $request->session()->regenerate(true);

            // Set cookie SameSite attribute untuk menghindari masalah CSRF di browser modern
            config(['session.same_site' => 'lax']);

            $user = Auth::user();

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
            // Regenerate token pada kegagalan login juga
            Session::regenerateToken();

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
        Auth::guard('web')->logout();

        // Invalidate dan regenerate dalam satu langkah
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Clear specific cookies yang mungkin menyebabkan masalah
        $cookieJar = cookie()->forget('laravel_session');

        return redirect('/')->withCookie($cookieJar);
    }
}
