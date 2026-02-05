import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const EmployeeAttendanceIndex = () => {
    const { attendances, employees, filters, flash } = usePage().props;

    // FILTER TABLE
    const [userId, setUserId] = useState(filters.user_id || "");
    const [status, setStatus] = useState(filters.status || "");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");

    // PRINT MODAL
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printUserId, setPrintUserId] = useState(filters.user_id || "");
    const [printStatus, setPrintStatus] = useState(filters.status || "");
    const [printStartDate, setPrintStartDate] = useState(
        filters.start_date || "",
    );
    const [printEndDate, setPrintEndDate] = useState(filters.end_date || "");

    const applyFilter = () => {
        router.get(
            route("admin.employee-attendance.index"),
            {
                user_id: userId,
                status,
                start_date: startDate,
                end_date: endDate,
            },
            { preserveScroll: true },
        );
    };

    const resetFilter = () => {
        setUserId("");
        setStatus("");
        setStartDate("");
        setEndDate("");
        router.get(route("admin.employee-attendance.index"));
    };

    const updateStatus = (id, value) => {
        router.patch(
            route("admin.employee-attendance.update-status", id),
            { status: value },
            { preserveScroll: true },
        );
    };

    const handlePrint = () => {
        const url = route("admin.employee-attendance.print", {
            user_id: printUserId,
            status: printStatus,
            start_date: printStartDate,
            end_date: printEndDate,
        });

        window.open(url, "_blank");
        setShowPrintModal(false);
    };

    return (
        <AuthenticatedLayout title="Absensi Karyawan">
            {/* FLASH MESSAGE */}
            {flash?.success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                    {flash.success}
                </div>
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Absensi Karyawan
                </h1>

                <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-black"
                >
                    Print Report
                </button>
            </div>

            {/* FILTER */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-wrap gap-3 items-end">
                    <select
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Semua Karyawan</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Semua Status</option>
                        <option value="hadir">Hadir</option>
                        <option value="sakit">Sakit</option>
                        <option value="izin">Izin</option>
                        <option value="alpha">Alpha</option>
                    </select>

                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        onClick={applyFilter}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
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
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                {attendances.data.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Tidak ada data absensi.
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="py-2">Nama</th>
                                        <th className="py-2">Tanggal</th>
                                        <th className="py-2">Masuk</th>
                                        <th className="py-2">Pulang</th>
                                        <th className="py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="py-2 font-medium">
                                                {item.user.name}
                                            </td>
                                            <td className="py-2">
                                                {item.date}
                                            </td>
                                            <td className="py-2">
                                                {item.check_in_at
                                                    ? new Date(
                                                          item.check_in_at,
                                                      ).toLocaleTimeString(
                                                          "id-ID",
                                                          {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          },
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="py-2">
                                                {item.check_out_at
                                                    ? new Date(
                                                          item.check_out_at,
                                                      ).toLocaleTimeString(
                                                          "id-ID",
                                                          {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          },
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="py-2">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) =>
                                                        updateStatus(
                                                            item.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border rounded px-2 py-1 text-sm"
                                                >
                                                    <option value="hadir">
                                                        Hadir
                                                    </option>
                                                    <option value="sakit">
                                                        Sakit
                                                    </option>
                                                    <option value="izin">
                                                        Izin
                                                    </option>
                                                    <option value="alpha">
                                                        Alpha
                                                    </option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* PRINT MODAL */}
            {showPrintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white w-full max-w-md rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-4">
                            Print Laporan Absensi
                        </h2>

                        <div className="space-y-4">
                            <select
                                value={printUserId}
                                onChange={(e) => setPrintUserId(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Semua Karyawan</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={printStatus}
                                onChange={(e) => setPrintStatus(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Semua Status</option>
                                <option value="hadir">Hadir</option>
                                <option value="sakit">Sakit</option>
                                <option value="izin">Izin</option>
                                <option value="alpha">Alpha</option>
                            </select>

                            <input
                                type="date"
                                value={printStartDate}
                                onChange={(e) =>
                                    setPrintStartDate(e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />

                            <input
                                type="date"
                                value={printEndDate}
                                onChange={(e) =>
                                    setPrintEndDate(e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowPrintModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
};

export default EmployeeAttendanceIndex;
