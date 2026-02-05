import React, { useRef } from "react";
import { Link } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    Calendar,
    DocumentText,
    TickCircle,
    Timer1,
    People,
    Copy,
    Eye,
    DocumentDownload,
} from "iconsax-reactjs";

const TeacherAttendanceActiveSessions = ({ activeSessions, flash }) => {
    // Function to copy QR token to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(`QR token ${text} berhasil disalin!`);
    };

    // Function to download QR code
    const downloadQRCode = async (qrToken, sessionTitle) => {
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrToken)}`;

            // Fetch the QR code image
            const response = await fetch(qrUrl);
            const blob = await response.blob();

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create and trigger download
            const link = document.createElement("a");
            link.href = url;
            link.download = `QR_${sessionTitle.replace(/\s+/g, "_")}_${qrToken.substring(0, 8)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the temporary URL
            window.URL.revokeObjectURL(url);

            // Show success message
            alert("QR Code berhasil didownload!");
        } catch (error) {
            console.error("Error downloading QR code:", error);
            alert("Gagal mendownload QR Code. Silakan coba lagi.");
        }
    };

    return (
        <TeacherLayout title="Sesi Absensi Aktif">
            {/* Flash message */}
            {flash?.success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.success}</p>
                </div>
            )}

            {flash?.error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.error}</p>
                </div>
            )}

            <div className="py-6 w-full">
                {/* Header */}
                <div className="w-full bg-white rounded-xl shadow-sm mb-6">
                    <div className="flex justify-between items-center px-6 py-5 border-b w-full">
                        <div className="flex gap-4">
                            <Link
                                href={route("teacher.attendance.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Sesi Absensi Aktif
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Menampilkan semua sesi absensi yang sedang
                                    berjalan
                                </p>
                            </div>
                        </div>
                        <div>
                            <Link
                                href={route("teacher.attendance.daily")}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Calendar size="20" />
                                <span>Absensi Harian</span>
                            </Link>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="w-full">
                        {activeSessions && activeSessions.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {activeSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="bg-white rounded-xl shadow-sm overflow-hidden"
                                    >
                                        {/* Session Header */}
                                        <div className="bg-blue-50 px-6 py-4 border-b">
                                            <div className="flex justify-between items-center">
                                                <h2 className="font-bold text-lg text-gray-800">
                                                    {session.title}
                                                </h2>
                                                <div className="flex items-center gap-1">
                                                    <Timer1
                                                        size="18"
                                                        className="text-blue-500"
                                                    />
                                                    <span className="text-blue-700 font-medium text-sm">
                                                        Tersisa:{" "}
                                                        {session.remaining_time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Session Content */}
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 gap-4">
                                                {/* QR Code */}
                                                <div className="bg-amber-50 p-4 rounded-lg flex flex-col items-center gap-3">
                                                    <p className="text-sm text-amber-700 font-medium self-start">
                                                        QR Absensi
                                                    </p>
                                                    <div className="bg-white rounded-lg p-2 border border-amber-100">
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                                                                session.qr_token,
                                                            )}`}
                                                            alt="QR Absensi"
                                                            className="w-40 h-40 object-contain"
                                                        />
                                                    </div>
                                                    <div className="w-full flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 break-all">
                                                            {session.qr_token}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    downloadQRCode(
                                                                        session.qr_token,
                                                                        session.title,
                                                                    )
                                                                }
                                                                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                                                                title="Download QR"
                                                            >
                                                                <DocumentDownload
                                                                    size="18"
                                                                    className="text-blue-700"
                                                                />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    copyToClipboard(
                                                                        session.qr_token,
                                                                    )
                                                                }
                                                                className="p-2 bg-amber-100 rounded-full hover:bg-amber-200 transition-colors"
                                                                title="Salin token"
                                                            >
                                                                <Copy
                                                                    size="18"
                                                                    className="text-amber-700"
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Session Info */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar
                                                                size="18"
                                                                className="text-gray-500"
                                                            />
                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Tanggal /
                                                                    Jenis
                                                                </p>
                                                                <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                                                    <span>
                                                                        {
                                                                            session.date
                                                                        }
                                                                    </span>
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 capitalize">
                                                                        {session.session_type ===
                                                                        "arrival"
                                                                            ? "Berangkat"
                                                                            : "Pulang"}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="flex items-center">
                                                            <DocumentText
                                                                size="18"
                                                                className="text-gray-500 mr-2"
                                                            />
                                                            <div>
                                                                <p className="text-xs text-gray-500">
                                                                    Semester
                                                                </p>
                                                                <p className="text-sm font-medium text-gray-800">
                                                                    {
                                                                        session.semester
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Timer1
                                                            size="18"
                                                            className="text-gray-500"
                                                        />
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Waktu
                                                            </p>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {session.start_time
                                                                    ? `${session.start_time} - ${session.expires_at}`
                                                                    : session.expires_at}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Attendance Stats */}
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <div className="flex items-center mb-2">
                                                        <People
                                                            size="18"
                                                            className="text-blue-500 mr-2"
                                                        />
                                                        <p className="text-sm font-medium text-blue-800">
                                                            Statistik Kehadiran
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-3xl font-bold text-blue-700">
                                                                {
                                                                    session.present_count
                                                                }
                                                                <span className="text-sm text-blue-500 font-normal ml-1">
                                                                    /{" "}
                                                                    {
                                                                        session.attendance_count
                                                                    }
                                                                </span>
                                                            </p>
                                                            <p className="text-xs text-blue-600">
                                                                siswa telah
                                                                mengisi absensi
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <p className="text-sm font-medium text-blue-700">
                                                                {
                                                                    session.attendance_rate
                                                                }
                                                                %
                                                            </p>
                                                            <div className="w-24 bg-blue-200 rounded-full h-2 mt-1">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{
                                                                        width: `${session.attendance_rate}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Session Actions */}
                                                <div className="flex justify-end">
                                                    <Link
                                                        href={route(
                                                            "teacher.attendance.daily",
                                                            {
                                                                date: session.date,
                                                                session_id:
                                                                    session.id,
                                                            },
                                                        )}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                                    >
                                                        <Eye size="18" />
                                                        <span>
                                                            Lihat Detail
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                                <div className="py-12">
                                    <div className="flex justify-center mb-4">
                                        <Timer1
                                            size="64"
                                            className="text-gray-300"
                                        />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                                        Tidak Ada Sesi Aktif
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        Saat ini tidak ada sesi absensi yang
                                        aktif. Sesi absensi baru dapat dibuat
                                        oleh administrator.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAttendanceActiveSessions;
