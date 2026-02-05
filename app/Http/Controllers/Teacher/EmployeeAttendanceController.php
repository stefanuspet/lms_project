<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\EmployeeAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EmployeeAttendanceController extends Controller
{
    /* =====================================================
     |  INDEX – STATUS ABSENSI HARI INI
     ===================================================== */
    public function index(Request $request)
    {
        $user = auth()->user();
        $today = now()->toDateString();

        // =========================
        // ABSENSI HARI INI (EXISTING)
        // =========================
        $attendanceToday = EmployeeAttendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        // =========================
        // FILTER (EXISTING)
        // =========================
        $status = $request->get('status'); // hadir | izin | sakit | alpha
        $month  = $request->get('month');  // YYYY-MM

        // =========================
        // HISTORY QUERY (EXISTING)
        // =========================
        $historyQuery = EmployeeAttendance::where('user_id', $user->id)
            ->where('date', '<', $today);

        if ($status) {
            $historyQuery->where('status', $status);
        }

        if ($month) {
            $historyQuery->whereMonth('date', substr($month, 5, 2))
                ->whereYear('date', substr($month, 0, 4));
        }

        $history = $historyQuery
            ->orderBy('date', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn($a) => [
                'id' => $a->id,
                'date' => $a->date->format('d-m-Y'),
                'check_in_at' => $a->check_in_at,
                'check_out_at' => $a->check_out_at,
                'status' => $a->status,
            ]);

        // =========================
        // SUMMARY BULANAN (NEW)
        // =========================
        $summary = [
            'hadir' => 0,
            'sakit' => 0,
            'izin'  => 0,
            'alpha' => 0,
        ];

        $summaryData = EmployeeAttendance::where('user_id', $user->id)
            ->where('date', '<=', $today)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->selectRaw("
        SUM(status = 'hadir') as hadir,
        SUM(status = 'sakit') as sakit,
        SUM(status = 'izin')  as izin,
        SUM(status = 'alpha') as alpha
    ")
            ->first();

        $summary = [
            'hadir' => (int) ($summaryData->hadir ?? 0),
            'sakit' => (int) ($summaryData->sakit ?? 0),
            'izin'  => (int) ($summaryData->izin ?? 0),
            'alpha' => (int) ($summaryData->alpha ?? 0),
        ];

        // =========================
        // RESPONSE (EXISTING + NEW)
        // =========================
        return Inertia::render('Teacher/EmployeeAttendance/Index', [
            'attendance' => $attendanceToday,
            'today' => now()->format('d-m-Y'),
            'history' => $history,

            // NEW
            'summary' => $summary,

            // EXISTING
            'filters' => [
                'status' => $status,
                'month'  => $month,
            ],
        ]);
    }



    /* =====================================================
     |  CHECK-IN
     ===================================================== */
    public function checkIn(Request $request)
    {
        $user = auth()->user();
        $today = Carbon::today();

        $data = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // Koordinat kampus (FIX)
        $campusLat = -6.3545659531203675;
        $campusLng = 106.83503758829629;

        // Hitung jarak (meter)
        $distance = $this->distanceInMeters(
            $data['latitude'],
            $data['longitude'],
            $campusLat,
            $campusLng
        );

        // Radius maksimal (meter)
        if ($distance > 100) {
            return back()->with('error', 'Anda berada di luar area kampus.');
        }

        EmployeeAttendance::updateOrCreate(
            [
                'user_id' => $user->id,
                'date' => $today,
            ],
            [
                'check_in_at' => now(),
                'status' => 'hadir',
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ]
        );

        return back()->with('success', 'Berhasil absen masuk.');
    }

    private function distanceInMeters($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // meter

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a =
            sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) *
            cos(deg2rad($lat2)) *
            sin($dLon / 2) *
            sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /* =====================================================
     |  CHECK-OUT
     ===================================================== */
    public function checkOut(Request $request)
    {
        $user = auth()->user();
        $today = today();

        $attendance = EmployeeAttendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance || !$attendance->check_in_at) {
            return back()->with('error', 'Anda belum melakukan check-in.');
        }

        if ($attendance->check_out_at) {
            return back()->with('error', 'Anda sudah melakukan check-out.');
        }

        $attendance->update([
            'check_out_at' => now(),
        ]);

        return back()->with('success', 'Check-out berhasil.');
    }

    /* =====================================================
     |  RIWAYAT ABSENSI (OPSIONAL)
     ===================================================== */
    public function history(Request $request)
    {
        $user = auth()->user();

        $attendances = EmployeeAttendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->paginate(15);

        return Inertia::render('Teacher/EmployeeAttendance/History', [
            'attendances' => $attendances,
        ]);
    }
}
