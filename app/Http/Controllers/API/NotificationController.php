<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Get paginated notifications for authenticated student
     */
    public function index(Request $request)
    {
        try {
            // Get current user
            $user = Auth::user();

            // Validate input
            $validator = Validator::make($request->all(), [
                'filter_type' => 'nullable|string|in:all,assignment,material,grade,system',
                'filter_read' => 'nullable|string|in:all,read,unread',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Set default values
            $filterType = $request->input('filter_type', 'all');
            $filterRead = $request->input('filter_read', 'all');
            $perPage = $request->input('per_page', 15);

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
            $notifications = $query->paginate($perPage);

            // Format data for frontend
            $formattedNotifications = $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'content' => $notification->content,
                    'is_read' => $notification->is_read,
                    'type' => $notification->type,
                    'related_id' => $notification->related_id,
                    'created_at' => $notification->created_at->toISOString(),
                    'created_at_human' => $notification->created_at->diffForHumans(),
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

            return response()->json([
                'success' => true,
                'message' => 'Notifications retrieved successfully',
                'data' => [
                    'notifications' => $formattedNotifications,
                    'pagination' => [
                        'total' => $notifications->total(),
                        'per_page' => $notifications->perPage(),
                        'current_page' => $notifications->currentPage(),
                        'last_page' => $notifications->lastPage(),
                        'from' => $notifications->firstItem(),
                        'to' => $notifications->lastItem(),
                        'has_more_pages' => $notifications->hasMorePages(),
                    ],
                    'filters' => [
                        'filter_type' => $filterType,
                        'filter_read' => $filterRead,
                    ],
                    'counts' => $counts,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in API student notifications index: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to load notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        try {
            $user = Auth::user();

            $unreadCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'message' => 'Unread count retrieved successfully',
                'data' => [
                    'unread_count' => $unreadCount
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting unread notifications count: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get unread count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent notifications (last 10)
     */
    public function recent()
    {
        try {
            $user = Auth::user();

            $notifications = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'title' => $notification->title,
                        'content' => $notification->content,
                        'is_read' => $notification->is_read,
                        'type' => $notification->type,
                        'related_id' => $notification->related_id,
                        'created_at' => $notification->created_at->toISOString(),
                        'created_at_human' => $notification->created_at->diffForHumans(),
                        'redirect_url' => $this->getRedirectUrl($notification),
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Recent notifications retrieved successfully',
                'data' => $notifications
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting recent notifications: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to get recent notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show specific notification
     */
    public function show(Notification $notification)
    {
        try {
            $user = Auth::user();

            // Ensure notification belongs to current user
            if ($notification->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view this notification'
                ], 403);
            }

            // Mark as read if not already read
            if (!$notification->is_read) {
                $notification->update(['is_read' => true]);
            }

            $formattedNotification = [
                'id' => $notification->id,
                'title' => $notification->title,
                'content' => $notification->content,
                'is_read' => $notification->is_read,
                'type' => $notification->type,
                'related_id' => $notification->related_id,
                'created_at' => $notification->created_at->toISOString(),
                'created_at_human' => $notification->created_at->diffForHumans(),
                'formatted_date' => $notification->created_at->format('d M Y, H:i'),
                'redirect_url' => $this->getRedirectUrl($notification),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Notification retrieved successfully',
                'data' => $formattedNotification
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing notification: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to show notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark notifications as read
     */
    public function markAsRead(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'notification_ids' => 'required_without:mark_all|array',
                'notification_ids.*' => 'integer|exists:notifications,id',
                'mark_all' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $updatedCount = 0;

            if ($request->input('mark_all', false)) {
                // Mark all notifications as read
                $updatedCount = Notification::where('user_id', $user->id)
                    ->where('is_read', false)
                    ->update(['is_read' => true]);

                return response()->json([
                    'success' => true,
                    'message' => 'All notifications marked as read',
                    'data' => [
                        'updated_count' => $updatedCount
                    ]
                ]);
            } else {
                // Mark selected notifications as read
                $updatedCount = Notification::whereIn('id', $request->notification_ids)
                    ->where('user_id', $user->id)
                    ->where('is_read', false)
                    ->update(['is_read' => true]);

                return response()->json([
                    'success' => true,
                    'message' => 'Selected notifications marked as read',
                    'data' => [
                        'updated_count' => $updatedCount
                    ]
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error marking notifications as read: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete notification
     */
    public function destroy(Notification $notification)
    {
        try {
            $user = Auth::user();

            // Ensure notification belongs to current user
            if ($notification->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to delete this notification'
                ], 403);
            }

            // Delete notification
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting notification: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete multiple notifications
     */
    public function destroyMultiple(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'notification_ids' => 'required|array',
                'notification_ids.*' => 'integer|exists:notifications,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Delete notifications that belong to current user
            $deletedCount = Notification::whereIn('id', $request->notification_ids)
                ->where('user_id', $user->id)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notifications deleted successfully',
                'data' => [
                    'deleted_count' => $deletedCount
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting multiple notifications: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to determine redirect URL based on notification type
     */
    private function getRedirectUrl(Notification $notification)
    {
        $type = $notification->type;
        $relatedId = $notification->related_id;

        switch ($type) {
            case 'assignment':
                // Check if related_id is for assignment or submission
                $submission = DB::table('assignment_submissions')->find($relatedId);
                if ($submission) {
                    return "/api/assignments/submissions/{$relatedId}";
                }
                return "/api/assignments/{$relatedId}";

            case 'material':
                return "/api/materials/{$relatedId}";

            case 'grade':
                $submission = DB::table('assignment_submissions')->find($relatedId);
                if ($submission) {
                    return "/api/assignments/submissions/{$relatedId}";
                }
                return "/api/grades";

            case 'system':
            default:
                return null;
        }
    }
}
