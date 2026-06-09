<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    private string $gatewayUrl;

    public function __construct()
    {
        $this->gatewayUrl = config('services.wa_gateway.url', 'http://localhost:3001');
    }

    public function send(string $phone, string $message): bool
    {
        try {
            $response = Http::timeout(10)->post("{$this->gatewayUrl}/send", [
                'phone'   => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::warning('WhatsApp send failed', [
                'phone'  => $phone,
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp gateway error', [
                'phone'   => $phone,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
