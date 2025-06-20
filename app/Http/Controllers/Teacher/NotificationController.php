<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display a listing of the notifications.
     */
    public function index(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'filter_type' => 'nullable|string|in:all,unread,assignment,material,grade,system',
                'sort_by' => 'nullable|string|in:created_at',
                'sort_order' => 'nullable|string|in:asc,desc',
            ]);

            // Get current user
            $user = Auth::user();

            // Set default values
            $perPage = $request->input('per_page', 20);
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            $filterType = $request->input('filter_type', 'all');

            // Base query for notifications
            $query = DB::table('notifications')->where('user_id', $user->id);

            // Apply type filter
            if ($filterType === 'unread') {
                $query->where('is_read', false);
            } elseif ($filterType !== 'all') {
                $query->where('type', $filterType);
            }

            // Apply sorting
            $query->orderBy($sortBy, $sortOrder);

            // Get paginated results
            $notifications = $query->paginate($perPage)->withQueryString();

            // Format notifications for frontend
            $formattedNotifications = collect($notifications->items())->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'content' => $notification->content,
                    'is_read' => (bool)$notification->is_read,
                    'type' => $notification->type,
                    'related_id' => $notification->related_id,
                    'created_at' => date('d M Y, H:i', strtotime($notification->created_at)),
                ];
            });

            // Count unread notifications
            $unreadCount = DB::table('notifications')
                ->where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            // Count by type
            $countByType = [
                'all' => DB::table('notifications')->where('user_id', $user->id)->count(),
                'unread' => $unreadCount,
                'assignment' => DB::table('notifications')->where('user_id', $user->id)->where('type', 'assignment')->count(),
                'material' => DB::table('notifications')->where('user_id', $user->id)->where('type', 'material')->count(),
                'grade' => DB::table('notifications')->where('user_id', $user->id)->where('type', 'grade')->count(),
                'system' => DB::table('notifications')->where('user_id', $user->id)->where('type', 'system')->count(),
            ];

            return Inertia::render('Teacher/Notification/Index', [
                'notifications' => $formattedNotifications,
                'unread_count' => $unreadCount,
                'count_by_type' => $countByType,
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
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error in teacher notifications index: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to load notifications: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Mark notifications as read.
     */
    public function markAsRead(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'required|integer|exists:notifications,id',
                'mark_all' => 'nullable|boolean',
            ]);

            // Get current user
            $user = Auth::user();

            // Start transaction
            DB::beginTransaction();

            if ($request->boolean('mark_all')) {
                // Mark all notifications as read
                DB::table('notifications')
                    ->where('user_id', $user->id)
                    ->where('is_read', false)
                    ->update(['is_read' => true, 'updated_at' => now()]);
            } else {
                // Mark specific notifications as read
                DB::table('notifications')
                    ->whereIn('id', $request->notification_ids)
                    ->where('user_id', $user->id)
                    ->update(['is_read' => true, 'updated_at' => now()]);
            }

            DB::commit();

            // Count remaining unread notifications
            $unreadCount = DB::table('notifications')
                ->where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'unread_count' => $unreadCount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in teacher notifications markAsRead: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to mark notifications as read: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified notification.
     */
    public function destroy($id)
    {
        try {
            // Get current user
            $user = Auth::user();

            // Find the notification
            $notification = DB::table('notifications')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$notification) {
                return redirect()->route('teacher.notifications.index')
                    ->with('error', 'Notification not found.');
            }

            // Delete the notification
            DB::table('notifications')
                ->where('id', $id)
                ->delete();

            return redirect()->route('teacher.notifications.index')
                ->with('success', 'Notification deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error in teacher notifications destroy: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Failed to delete notification: ' . $e->getMessage()
            ]);
        }
    }
}
