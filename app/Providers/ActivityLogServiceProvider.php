<?php

namespace App\Providers;

use App\Models\ActivityLog;
use Illuminate\Support\ServiceProvider;

class ActivityLogServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton('activity-logger', function ($app) {
            return new ActivityLogger();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}

class ActivityLogger
{
    /**
     * Log an activity.
     *
     * @param int|null $userId
     * @param string $action
     * @param string $description
     * @param string|null $ipAddress
     * @return ActivityLog
     */
    public function log($userId, $action, $description, $ipAddress = null)
    {
        return ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }
}
