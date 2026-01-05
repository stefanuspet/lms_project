import React from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    ArrowLeft2,
    Teacher,
    Calendar,
    Home2,
    DocumentText,
} from "iconsax-reactjs";

const dayLabel = (dayKey) => {
    const map = {
        monday: "Senin",
        tuesday: "Selasa",
        wednesday: "Rabu",
        thursday: "Kamis",
        friday: "Jumat",
        saturday: "Sabtu",
        sunday: "Minggu",
    };
    return map[dayKey] || dayKey || "-";
};

const StudentExtracurricularShow = ({ extracurricular }) => {
    const summary = extracurricular.attendance_summary || {};
    const sessions = extracurricular.attendance_sessions || [];

    const statusLabel = (status) => {
        switch (status) {
            case "hadir":
                return "Hadir";
            case "sakit":
                return "Sakit";
            case "izin":
                return "Izin";
            case "alpha":
                return "Alpha";
            case "belum_absen":
            default:
                return "Belum Absen";
        }
    };

    const statusBadgeClass = (status) => {
        switch (status) {
            case "hadir":
                return "bg-green-100 text-green-700";
            case "sakit":
                return "bg-yellow-100 text-yellow-700";
            case "izin":
                return "bg-blue-100 text-blue-700";
            case "alpha":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <StudentLayout title={`Ekstrakurikuler: ${extracurricular.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("student.extracurriculars.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    {extracurricular.name}
                                </h1>
                                <p className="text-xs text-gray-500 mt-1">
                                    Detail kegiatan ekstrakurikuler yang Anda
                                    ikuti.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Pembina Ekstrakurikuler
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Teacher
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {extracurricular.teacher_name || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Hari & Waktu
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Calendar
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {dayLabel(extracurricular.day_of_week)}{" "}
                                        {extracurricular.start_time &&
                                            extracurricular.end_time &&
                                            `• ${extracurricular.start_time} - ${extracurricular.end_time}`}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Ruangan
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Home2
                                        size="20"
                                        className="text-amber-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {extracurricular.room || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Semester
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {extracurricular.semester_name || "-"}
                                </p>
                            </div>

                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Deskripsi Kegiatan
                                </h3>
                                <p className="text-gray-900">
                                    {extracurricular.description ||
                                        "Belum ada deskripsi untuk ekstrakurikuler ini."}
                                </p>
                            </div>

                            {/* Ringkasan Presensi Ekskul */}
                            <div className="md:col-span-2 bg-white border rounded-lg shadow-sm p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Ringkasan Presensi Ekstrakurikuler
                                </h3>
                                {summary.total_sessions > 0 ? (
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                                        <div>
                                            <span className="font-semibold">
                                                Total Pertemuan:
                                            </span>{" "}
                                            {summary.total_sessions}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Hadir:
                                            </span>{" "}
                                            {summary.present}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Sakit:
                                            </span>{" "}
                                            {summary.sick}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Izin:
                                            </span>{" "}
                                            {summary.permit}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Alpha:
                                            </span>{" "}
                                            {summary.absent}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Belum ada data presensi untuk
                                        ekstrakurikuler ini.
                                    </p>
                                )}
                            </div>

                            {/* Riwayat Presensi */}
                            <div className="md:col-span-2 bg-white border rounded-lg shadow-sm p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Riwayat Presensi Ekstrakurikuler
                                </h3>
                                {sessions.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Tanggal
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Pertemuan
                                                    </th>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {sessions.map((s) => (
                                                    <tr key={s.id}>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            {s.date || "-"}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {s.title}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClass(
                                                                    s.status
                                                                )}`}
                                                            >
                                                                {statusLabel(
                                                                    s.status
                                                                )}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Belum ada riwayat presensi yang
                                        tercatat untuk ekstrakurikuler ini.
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2 mt-4 flex justify-end">
                                <Link
                                    href={route(
                                        "student.extracurriculars.index"
                                    )}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <DocumentText size="18" />
                                    <span>Kembali ke daftar ekskul</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentExtracurricularShow;
