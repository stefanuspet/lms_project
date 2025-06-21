<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get current user
            $user = Auth::user();

            // Validate input
            $validated = $request->validate([
                'filter_type' => 'nullable|string|in:all,assignment,material,grade,system',
                'filter_read' => 'nullable|string|in:all,read,unread',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            // Set default values
            $filterType = $request->input('filter_type', 'all');
            $filterRead = $request->input('filter_read', 'all');
            $perPage = $request->input('per_page', 15);
            $page = $request->input('page', 1);

            // Base query for notifications
            $query = Notification::where('user_id', $user->id);

            // Apply filters
            if ($filterType !== 'all') {
                $query->where('type', $filterType);
            }

            if ($filterRead !== 'all') {
                $query->where('is_read', $filterRead === 'read');
            }

            // Apply sorting
            $query->orderBy('created_at', 'desc');

            // Execute paginated query
            $notifications = $query->paginate($perPage)->withQueryString();

            // Format data for frontend
            $formattedNotifications = $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'content' => $notification->content,
                    'is_read' => $notification->is_read,
                    'type' => $notification->type,
                    'related_id' => $notification->related_id,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'formatted_date' => $notification->created_at->format('d M Y, H:i'),
                    'redirect_url' => $this->getRedirectUrl($notification),
                ];
            });

            // Get notification counts by type
            $counts = [
                'all' => Notification::where('user_id', $user->id)->count(),
                'unread' => Notification::where('user_id', $user->id)->where('is_read', false)->count(),
                'assignment' => Notification::where('user_id', $user->id)->where('type', 'assignment')->count(),
                'material' => Notification::where('user_id', $user->id)->where('type', 'material')->count(),
                'grade' => Notification::where('user_id', $user->id)->where('type', 'grade')->count(),
                'system' => Notification::where('user_id', $user->id)->where('type', 'system')->count(),
            ];

            return Inertia::render('Student/Notification/Index', [
                'notifications' => $formattedNotifications,
                'pagination' => [
                    'total' => $notifications->total(),
                    'per_page' => $notifications->perPage(),
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'from' => $notifications->firstItem(),
                    'to' => $notifications->lastItem(),
                ],
                'filters' => [
                    'filter_type' => $filterType,
                    'filter_read' => $filterRead,
                ],
                'counts' => $counts,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in student notifications index: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to load notifications: ' . $e->getMessage()
            ]);
        }
    }

    public function markAsRead(Request $request)
    {
        try {
            $validated = $request->validate([
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'integer|exists:notifications,id',
                'mark_all' => 'nullable|boolean',
            ]);

            $user = Auth::user();

            if ($request->input('mark_all', false)) {
                // Mark all notifications as read
                Notification::where('user_id', $user->id)
                    ->where('is_read', false)
                    ->update(['is_read' => true]);

                return redirect()->back()->with('success', 'All notifications marked as read');
            } else {
                // Mark selected notifications as read
                Notification::whereIn('id', $validated['notification_ids'])
                    ->where('user_id', $user->id)
                    ->update(['is_read' => true]);

                return redirect()->back()->with('success', 'Selected notifications marked as read');
            }
        } catch (\Exception $e) {
            Log::error('Error marking notifications as read: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to mark notifications as read: ' . $e->getMessage()
            ]);
        }
    }

    public function destroy(Notification $notification)
    {
        try {
            $user = Auth::user();

            // Ensure notification belongs to current user
            if ($notification->user_id !== $user->id) {
                return redirect()->back()->withErrors([
                    'error' => 'You do not have permission to delete this notification'
                ]);
            }

            // Delete notification
            $notification->delete();

            return redirect()->back()->with('success', 'Notification deleted successfully');
        } catch (\Exception $e) {
            Log::error('Error deleting notification: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'error' => 'Failed to delete notification: ' . $e->getMessage()
            ]);
        }
    }

    // Helper method to determine redirect URL based on notification type
    private function getRedirectUrl(Notification $notification)
    {
        $type = $notification->type;
        $relatedId = $notification->related_id;

        switch ($type) {
            case 'assignment':
                // Check if related_id is for assignment or submission
                $submission = DB::table('assignment_submissions')->find($relatedId);
                if ($submission) {
                    return route('student.submissions.show', $relatedId);
                }

                return route('student.assignments.show', $relatedId);

            case 'material':
                return route('student.materials.show', $relatedId);

            case 'grade':
                $submission = DB::table('assignment_submissions')->find($relatedId);
                if ($submission) {
                    return route('student.submissions.show', $relatedId);
                }

                return route('student.grades.index');

            case 'system':
            default:
                return null;
        }
    }
}
