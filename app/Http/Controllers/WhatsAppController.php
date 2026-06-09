<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppController extends Controller
{
    private string $gatewayUrl;

    public function __construct()
    {
        $this->gatewayUrl = rtrim(config('services.wa_gateway.url', 'http://localhost:3001'), '/');
    }

    public function index(): Response
    {
        return Inertia::render('Admin/WhatsApp/Index');
    }

    public function status(): JsonResponse
    {
        try {
            $response = Http::timeout(3)->get("{$this->gatewayUrl}/health");
            return response()->json($response->json());
        } catch (\Exception) {
            return response()->json([
                'connected' => false,
                'has_qr'    => false,
                'phone'     => null,
                'error'     => 'Gateway tidak dapat dijangkau. Pastikan wa-gateway berjalan.',
            ], 503);
        }
    }

    public function qr(): JsonResponse
    {
        try {
            $response = Http::timeout(5)->get("{$this->gatewayUrl}/qr");
            return response()->json($response->json());
        } catch (\Exception) {
            return response()->json(['error' => 'Gateway tidak dapat dijangkau.'], 503);
        }
    }

    public function logout(): JsonResponse
    {
        try {
            $response = Http::timeout(5)->post("{$this->gatewayUrl}/logout");
            return response()->json($response->json());
        } catch (\Exception) {
            return response()->json(['error' => 'Gagal logout dari gateway.'], 503);
        }
    }
}
