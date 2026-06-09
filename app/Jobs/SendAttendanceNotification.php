<?php

namespace App\Jobs;

use App\Services\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendAttendanceNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $parentPhone,
        private string $parentName,
        private string $studentName,
        private string $sessionType, // 'arrival' | 'departure'
        private string $time,
    ) {}

    public function handle(WhatsAppService $wa): void
    {
        if (empty($this->parentPhone)) {
            return;
        }

        $action = $this->sessionType === 'arrival'
            ? "telah tiba di sekolah"
            : "telah pulang dari sekolah";

        $message = "Yth. Bpk/Ibu {$this->parentName}, putra/putri Anda *{$this->studentName}* {$action} pada pukul {$this->time}. Terima kasih.";

        $wa->send($this->parentPhone, $message);
    }
}
