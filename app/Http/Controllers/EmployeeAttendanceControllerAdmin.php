<?php

namespace App\Http\Controllers;

use App\Models\EmployeeAttendance;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EmployeeAttendanceControllerAdmin extends Controller
{
    /**
     * LIST SEMUA ABSENSI (ADMIN)
     */
    public function index(Request $request)
    {
        $status = $request->get('status');      // hadir | sakit | izin | alpha
        $month  = $request->get('month');       // YYYY-MM
        $userId = $request->get('user_id');     // filter karyawan

        $query = EmployeeAttendance::with('user.teacher')
            ->orderBy('date', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($month) {
            $query->whereMonth('date', substr($month, 5, 2))
                ->whereYear('date', substr($month, 0, 4));
        }

        $attendances = $query
            ->paginate(15)
            ->withQueryString()
            ->through(fn($a) => [
                'id' => $a->id,
                'user' => [
                    'id'   => $a->user->id,
                    'name' => $a->user->teacher?->name ?? '-',
                ],
                'date' => $a->date->format('d-m-Y'),
                'check_in_at'  => $a->check_in_at,
                'check_out_at' => $a->check_out_at,
                'status' => $a->status,
            ]);

        return Inertia::render('Admin/EmployeeAttendance/Index', [
            'attendances' => $attendances,
            'employees' => Teacher::select('user_id as id', 'name')->get(),
            'filters' => [
                'status'  => $status,
                'month'   => $month,
                'user_id' => $userId,
            ],
        ]);
    }

    /**
     * UPDATE STATUS ABSENSI (ADMIN)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:hadir,sakit,izin,alpha',
        ]);

        $attendance = EmployeeAttendance::findOrFail($id);
        $attendance->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Status absensi berhasil diperbarui.');
    }

    /**
     * PRINT / EXPORT REPORT
     */
    public function exportReport(Request $request)
    {
        $validated = $request->validate([
            'user_id'   => 'nullable|exists:users,id',
            'status'    => 'nullable|in:hadir,sakit,izin,alpha',
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date|after_or_equal:date_from',
        ]);

        $query = EmployeeAttendance::with('user.teacher')
            ->orderBy('user_id')
            ->orderBy('date');

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $attendances = $query->get();

        if ($attendances->isEmpty()) {
            return redirect()->back()->with(
                'error',
                'Tidak ada data absensi pada filter yang dipilih.'
            );
        }

        $filename = 'laporan_absensi_karyawan_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($attendances) {
            $output = fopen('php://output', 'w');

            // BOM UTF-8 (penting untuk Excel)
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            $delimiter = ';';

            // HEADER
            fputcsv($output, [
                'Nama Karyawan',
                'Tanggal',
                'Jam Masuk',
                'Jam Pulang',
                'Status',
            ], $delimiter);

            // GROUP PER USER
            $grouped = $attendances->groupBy('user_id');

            foreach ($grouped as $userAttendances) {
                $userName = $userAttendances->first()->user->teacher?->name ?? '-';

                // DETAIL ROWS
                foreach ($userAttendances as $attendance) {
                    fputcsv($output, [
                        $userName,
                        Carbon::parse($attendance->date)->format('d-m-Y'),
                        $attendance->check_in_at
                            ? Carbon::parse($attendance->check_in_at)->format('H:i:s')
                            : '-',
                        $attendance->check_out_at
                            ? Carbon::parse($attendance->check_out_at)->format('H:i:s')
                            : '-',
                        ucfirst($attendance->status),
                    ], $delimiter);
                }

                // SUMMARY
                $hadir = $userAttendances->where('status', 'hadir')->count();
                $sakit = $userAttendances->where('status', 'sakit')->count();
                $izin  = $userAttendances->where('status', 'izin')->count();
                $alpha = $userAttendances->where('status', 'alpha')->count();
                $total = $userAttendances->count();

                fputcsv($output, [
                    'SUMMARY ' . $userName,
                    'Total: ' . $total,
                    'Hadir: ' . $hadir,
                    'Sakit: ' . $sakit,
                    'Izin: ' . $izin,
                    'Alpha: ' . $alpha,
                ], $delimiter);

                // BARIS KOSONG (biar rapi)
                fputcsv($output, [], $delimiter);
            }

            fclose($output);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }
}
