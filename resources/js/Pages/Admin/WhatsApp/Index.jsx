import { useState, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const POLL_INTERVAL = 4000; // 4 detik

export default function WhatsAppIndex() {
    const [status, setStatus] = useState({
        connected: false,
        has_qr: false,
        phone: null,
        connected_since: null,
        error: null,
    });
    const [qrImage, setQrImage] = useState(null);
    const [qrMessage, setQrMessage] = useState(null);
    const [loadingLogout, setLoadingLogout] = useState(false);
    const [gatewayDown, setGatewayDown] = useState(false);

    // ── Fetch status ──────────────────────────────────────────────────────────
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/admin/whatsapp/status");
            const data = await res.json();
            setGatewayDown(res.status === 503 && !!data.error?.includes("Gateway"));
            setStatus(data);
        } catch {
            setGatewayDown(true);
        }
    }, []);

    // ── Fetch QR ──────────────────────────────────────────────────────────────
    const fetchQR = useCallback(async () => {
        try {
            const res = await fetch("/admin/whatsapp/qr");
            const data = await res.json();
            if (data.connected) {
                setQrImage(null);
                setQrMessage(null);
            } else if (data.qr) {
                setQrImage(data.qr);
                setQrMessage(null);
            } else {
                setQrImage(null);
                setQrMessage(data.message ?? "Menunggu QR dari gateway...");
            }
        } catch {
            setQrImage(null);
        }
    }, []);

    // ── Polling ───────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchStatus();
        fetchQR();

        const interval = setInterval(async () => {
            await fetchStatus();
            // Hanya fetch QR jika belum connected
            setStatus((prev) => {
                if (!prev.connected) fetchQR();
                return prev;
            });
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchStatus, fetchQR]);

    // ── Logout ────────────────────────────────────────────────────────────────
    const handleLogout = async () => {
        if (!confirm("Putuskan koneksi WhatsApp?")) return;
        setLoadingLogout(true);
        try {
            await fetch("/admin/whatsapp/logout", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                },
            });
            setStatus((s) => ({ ...s, connected: false }));
            setQrImage(null);
            setTimeout(fetchQR, 3000);
        } finally {
            setLoadingLogout(false);
        }
    };

    // ── Format tanggal ────────────────────────────────────────────────────────
    const formatDate = (iso) => {
        if (!iso) return "-";
        return new Date(iso).toLocaleString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AuthenticatedLayout title="WhatsApp Gateway">
            <div className="p-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">
                        WhatsApp Gateway
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola koneksi WhatsApp untuk notifikasi absensi orang tua
                    </p>
                </div>

                {/* Gateway down warning */}
                {gatewayDown && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <span className="text-red-500 text-lg">⚠️</span>
                        <div>
                            <p className="font-semibold text-red-700 text-sm">
                                WA Gateway tidak berjalan
                            </p>
                            <p className="text-red-600 text-xs mt-1">
                                Jalankan <code className="bg-red-100 px-1 rounded">composer run dev</code> atau pastikan proses{" "}
                                <code className="bg-red-100 px-1 rounded">wa-gateway</code> aktif.
                            </p>
                        </div>
                    </div>
                )}

                {/* Status card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-600">
                            Status Koneksi
                        </span>
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                status.connected
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    status.connected
                                        ? "bg-green-500 animate-pulse"
                                        : "bg-slate-400"
                                }`}
                            />
                            {status.connected ? "Terhubung" : "Tidak Terhubung"}
                        </span>
                    </div>

                    {status.connected && (
                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Nomor WA</span>
                                <span className="font-medium">
                                    {status.phone
                                        ? `+${status.phone}`
                                        : "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">
                                    Terhubung sejak
                                </span>
                                <span className="font-medium">
                                    {formatDate(status.connected_since)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* QR / Connected panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    {status.connected ? (
                        /* ── Connected state ── */
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800 mb-1">
                                WhatsApp Terhubung
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Sistem siap mengirim notifikasi absensi ke orang tua siswa.
                            </p>
                            <button
                                onClick={handleLogout}
                                disabled={loadingLogout}
                                className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold
                                           hover:bg-red-100 transition disabled:opacity-50"
                            >
                                {loadingLogout
                                    ? "Memutuskan..."
                                    : "Putuskan Koneksi"}
                            </button>
                        </div>
                    ) : qrImage ? (
                        /* ── QR available ── */
                        <div className="text-center">
                            <h2 className="text-base font-semibold text-slate-700 mb-1">
                                Scan QR dengan WhatsApp Sekolah
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">
                                Buka WhatsApp → Perangkat Tertaut → Tautkan Perangkat
                            </p>
                            <div className="inline-block p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
                                <img
                                    src={qrImage}
                                    alt="QR WhatsApp"
                                    className="w-64 h-64"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-3">
                                QR otomatis refresh setiap beberapa detik
                            </p>
                        </div>
                    ) : (
                        /* ── Waiting for QR ── */
                        <div className="text-center py-8">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-slate-500">
                                {qrMessage ?? "Menghubungi gateway..."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Info box */}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl text-xs text-blue-700 space-y-1">
                    <p className="font-semibold">Cara kerja:</p>
                    <p>1. Scan QR di atas menggunakan WhatsApp nomor sekolah.</p>
                    <p>2. Setelah terhubung, sistem otomatis kirim notifikasi WA ke orang tua setiap siswa scan QR absensi.</p>
                    <p>3. Sesi tersimpan — tidak perlu scan ulang kecuali logout.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
