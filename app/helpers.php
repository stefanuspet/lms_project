<?php

use App\Facades\ActivityLogger;

if (!function_exists('log_activity')) {
    /**
     * Log an activity.
     *
     * @param string $action
     * @param string $description
     * @param int|null $userId
     * @return \App\Models\ActivityLog
     */
    function log_activity($action, $description, $userId = null)
    {
        if ($userId === null && auth()->check()) {
            $userId = auth()->id();
        }

        return ActivityLogger::log($userId, $action, $description);
    }
}
