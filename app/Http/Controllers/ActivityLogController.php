<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the activity logs.
     */
    public function index(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:created_at,user_id,action',
            'sort_order' => 'nullable|string|in:asc,desc',
            'filter_user' => 'nullable|integer',
            'filter_action' => 'nullable|string',
            'filter_date_from' => 'nullable|date',
            'filter_date_to' => 'nullable|date|after_or_equal:filter_date_from',
        ]);

        // Set default values if not provided
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 25);
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $filterUser = $request->input('filter_user');
        $filterAction = $request->input('filter_action');
        $filterDateFrom = $request->input('filter_date_from');
        $filterDateTo = $request->input('filter_date_to');

        // Query logs with relationships
        $query = ActivityLog::with('user')
            ->search($search)
            ->when($filterUser, function ($query) use ($filterUser) {
                return $query->ofUser($filterUser);
            })
            ->when($filterAction, function ($query) use ($filterAction) {
                return $query->ofAction($filterAction);
            })
            ->inDateRange($filterDateFrom, $filterDateTo)
            ->orderBy($sortBy, $sortOrder);

        // Execute paginated query
        $logs = $query->paginate($perPage)->withQueryString();

        // Get unique actions for filter
        $actions = ActivityLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        // Get users for filter
        $users = User::select('id', 'email')
            ->whereIn('role', ['admin', 'guru'])
            ->orderBy('email')
            ->get();

        // Format data for frontend
        $formattedLogs = $logs->map(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'email' => $log->user->email,
                    'role' => $log->user->role,
                ] : null,
                'action' => $log->action,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'created_at' => Carbon::parse($log->created_at)->format('d-m-Y H:i:s'),
                'created_at_diff' => Carbon::parse($log->created_at)->diffForHumans(),
            ];
        });

        // Return data to view
        return Inertia::render('Admin/ActivityLog/Index', [
            'logs' => $formattedLogs,
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'filter_user' => $filterUser,
                'filter_action' => $filterAction,
                'filter_date_from' => $filterDateFrom,
                'filter_date_to' => $filterDateTo,
            ],
            'filterOptions' => [
                'users' => $users,
                'actions' => $actions,
            ],
        ]);
    }

    /**
     * Clear all logs older than a specified period.
     */
    public function clearOldLogs(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'period' => 'required|string|in:week,month,year,all',
        ]);

        $period = $request->input('period');
        $count = 0;

        if ($period === 'all') {
            // Delete all logs
            $count = ActivityLog::count();
            ActivityLog::truncate();
        } else {
            // Set date based on period
            $date = null;

            switch ($period) {
                case 'week':
                    $date = Carbon::now()->subWeek();
                    break;
                case 'month':
                    $date = Carbon::now()->subMonth();
                    break;
                case 'year':
                    $date = Carbon::now()->subYear();
                    break;
            }

            // Delete logs older than the specified date
            $count = ActivityLog::where('created_at', '<', $date)->count();
            ActivityLog::where('created_at', '<', $date)->delete();
        }

        // Log this action
        $this->logActivity(
            auth()->id(),
            'clear_logs',
            "Cleared {$count} logs older than 1 {$period}"
        );

        return redirect()->route('admin.activity-logs.index')
            ->with('success', "{$count} logs have been cleared successfully.");
    }

    /**
     * Export logs to CSV.
     */
    public function export(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'sort_by' => 'nullable|string|in:created_at,user_id,action',
            'sort_order' => 'nullable|string|in:asc,desc',
            'filter_user' => 'nullable|integer',
            'filter_action' => 'nullable|string',
            'filter_date_from' => 'nullable|date',
            'filter_date_to' => 'nullable|date|after_or_equal:filter_date_from',
        ]);

        // Set default values if not provided
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $filterUser = $request->input('filter_user');
        $filterAction = $request->input('filter_action');
        $filterDateFrom = $request->input('filter_date_from');
        $filterDateTo = $request->input('filter_date_to');

        // Query logs with relationships
        $query = ActivityLog::with('user')
            ->search($search)
            ->when($filterUser, function ($query) use ($filterUser) {
                return $query->ofUser($filterUser);
            })
            ->when($filterAction, function ($query) use ($filterAction) {
                return $query->ofAction($filterAction);
            })
            ->inDateRange($filterDateFrom, $filterDateTo)
            ->orderBy($sortBy, $sortOrder);

        // Get all logs for export
        $logs = $query->get();

        // Format data for CSV
        $csvData = [];
        $csvData[] = ['ID', 'User', 'Role', 'Action', 'Description', 'IP Address', 'Date Time'];

        foreach ($logs as $log) {
            $csvData[] = [
                $log->id,
                $log->user ? $log->user->email : 'Unknown',
                $log->user ? $log->user->role : 'Unknown',
                $log->action,
                $log->description,
                $log->ip_address,
                Carbon::parse($log->created_at)->format('d-m-Y H:i:s'),
            ];
        }

        // Generate CSV file
        $filename = 'activity_logs_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        // Log this action
        $this->logActivity(
            auth()->id(),
            'export_logs',
            "Exported {$logs->count()} activity logs to CSV"
        );

        // Create CSV response
        $callback = function () use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    /**
     * Function to log activity
     */
    private function logActivity($userId, $action, $description)
    {
        ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
        ]);
    }
}
