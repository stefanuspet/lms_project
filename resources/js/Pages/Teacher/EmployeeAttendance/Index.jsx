import React, { useState } from "react";
import { router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import { TickCircle, Logout, Clock, CloseCircle } from "iconsax-reactjs";

const EmployeeAttendanceIndex = ({
    attendance,
    today,
    history,
    filters = {},
    flash,
    summary,
}) => {
    console.log("HISTORY:", summary);

    /* ===============================
     * STATE FILTER
     =============================== */
    const [status, setStatus] = useState(filters.status || "");
    const [month, setMonth] = useState(filters.month || "");

    /* ===============================
     * ACTIONS
     =============================== */
    const applyFilter = () => {
        router.get(
            route("teacher.employee-attendance.index"),
            { status, month },
            { preserveScroll: true },
        );
    };

    const resetFilter = () => {
        setStatus("");
        setMonth("");
        router.get(
            route("teacher.employee-attendance.index"),
            {},
            { preserveScroll: true },
        );
    };

    const handleCheckIn = () => {
        if (!navigator.geolocation) {
            alert("Browser tidak mendukung GPS");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                router.post(route("teacher.employee-attendance.check-in"), {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => alert("Gagal mendapatkan lokasi. Aktifkan GPS."),
        );
    };

    const handleCheckOut = () => {
        router.post(route("teacher.employee-attendance.check-out"), {
            preserveScroll: true,
        });
    };

    /* ===============================
     * HELPERS
     =============================== */
    const formatDateTime = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const statusBadge = (value) => {
        const map = {
            hadir: "bg-green-100 text-green-700",
            izin: "bg-blue-100 text-blue-700",
            sakit: "bg-orange-100 text-orange-700",
            alpha: "bg-red-100 text-red-700",
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-sm ${
                    map[value] ?? "bg-gray-100 text-gray-700"
                }`}
            >
                {value ? value.toUpperCase() : "BELUM ABSEN"}
            </span>
        );
    };

    /* ===============================
     * RENDER
     =============================== */
    return (
        <TeacherLayout title="Absensi Guru">
            {/* FLASH MESSAGE */}
            {flash?.success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {flash.error}
                </div>
            )}

            {/* ===============================
             * TODAY CARD
             =============================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 max-w-xl">
                    <h1 className="text-xl font-bold text-gray-800 mb-2">
                        Absensi Guru
                    </h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Tanggal: <strong>{today}</strong>
                    </p>

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Status Hari Ini
                            </p>
                            {statusBadge(attendance?.status)}
                        </div>
                        <Clock size="32" className="text-gray-400" />
                    </div>

                    <div className="space-y-3 mb-6 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Check-in</span>
                            <span className="font-medium">
                                {formatDateTime(attendance?.check_in_at)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Check-out</span>
                            <span className="font-medium">
                                {formatDateTime(attendance?.check_out_at)}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleCheckIn}
                            disabled={attendance?.check_in_at}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white
                            ${
                                attendance?.check_in_at
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600"
                            }`}
                        >
                            <TickCircle size="18" />
                            Absen Masuk
                        </button>

                        <button
                            onClick={handleCheckOut}
                            disabled={
                                !attendance?.check_in_at ||
                                attendance?.check_out_at
                            }
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white
                            ${
                                !attendance?.check_in_at ||
                                attendance?.check_out_at
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            <Logout size="18" />
                            Absen Pulang
                        </button>
                    </div>

                    {!attendance?.check_in_at && (
                        <p className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                            <CloseCircle size="14" />
                            Silakan lakukan absen masuk terlebih dahulu
                        </p>
                    )}
                </div>

                <div className="w-full bg-white rounded-xl shadow-sm px-6 py-4 max-w-xl grid place-items-center">
                    <h1 className="w-full text-start text-xl font-bold text-gray-800 mb-2">
                        Summary
                    </h1>
                    <div className="w-full">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Hadir</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {summary?.hadir ?? 0}
                                </p>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Sakit</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {summary?.sakit ?? 0}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Izin</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {summary?.izin ?? 0}
                                </p>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Alpha</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {summary?.alpha ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===============================
             * FILTER
             =============================== */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 max-w-7xl">
                <div className="flex flex-wrap gap-3 mb-6">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Semua Status</option>
                        <option value="hadir">Hadir</option>
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                        <option value="alpha">Alpha</option>
                    </select>

                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    />

                    <button
                        onClick={applyFilter}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    >
                        Terapkan
                    </button>

                    <button
                        onClick={resetFilter}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                        Reset
                    </button>
                </div>

                {/* ===============================
                 * HISTORY TABLE
                 =============================== */}
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Riwayat Absensi
                </h2>

                {history.data.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Tidak ada data absensi.
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="py-2">Tanggal</th>
                                        <th className="py-2">Masuk</th>
                                        <th className="py-2">Pulang</th>
                                        <th className="py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.data.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-2">
                                                {item.date}
                                            </td>
                                            <td className="py-2">
                                                {formatDateTime(
                                                    item.check_in_at,
                                                )}
                                            </td>
                                            <td className="py-2">
                                                {formatDateTime(
                                                    item.check_out_at,
                                                )}
                                            </td>
                                            <td className="py-2">
                                                {statusBadge(item.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex justify-between items-center mt-4 text-sm">
                            <span className="text-gray-500">
                                Halaman {history.current_page} dari{" "}
                                {history.last_page}
                            </span>

                            <div className="flex gap-2">
                                {history.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url &&
                                            router.get(
                                                link.url,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        className={`px-3 py-1 rounded ${
                                            link.active
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </TeacherLayout>
    );
};

export default EmployeeAttendanceIndex;
