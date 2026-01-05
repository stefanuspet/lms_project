import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import { ArrowLeft2, Teacher, Calendar, Home2, People, Printer } from "iconsax-reactjs";

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

const TeacherExtracurricularShow = ({ extracurricular }) => {
    const students = extracurricular.students || [];
    const sessions = extracurricular.sessions || [];
    const [creating, setCreating] = useState(false);

    const handleCreateSession = (type) => {
        if (creating) return;
        setCreating(true);
        router.post(
            route("teacher.attendance.extracurriculars.create", extracurricular.id),
            {
                session_type: type,
                duration_minutes: 60,
            },
            {
                preserveScroll: true,
                onFinish: () => setCreating(false),
            }
        );
    };

    return (
        <TeacherLayout title={`Ekstrakurikuler: ${extracurricular.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.extracurriculars.index")}
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
                                    Detail ekstrakurikuler dan daftar siswa
                                    yang Anda bina.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleCreateSession("ekskul_berangkat")}
                                disabled={creating}
                                className="px-3 py-1.5 text-xs rounded-full bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                            >
                                Buat Presensi Berangkat
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCreateSession("ekskul_pulang")}
                                disabled={creating}
                                className="px-3 py-1.5 text-xs rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                            >
                                Buat Presensi Pulang
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    window.location.assign(
                                        route(
                                            "teacher.extracurriculars.export-attendance",
                                            extracurricular.id
                                        )
                                    )
                                }
                                className="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                <Printer size="16" className="inline-block mr-1" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Jadwal
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
                                    Ruangan & Semester
                                </h3>
                                <div className="flex items-center gap-2 mb-1">
                                    <Home2
                                        size="20"
                                        className="text-amber-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {extracurricular.room || "-"}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Semester:{" "}
                                    <span className="font-medium">
                                        {extracurricular.semester_name || "-"}
                                    </span>
                                </p>
                            </div>

                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Deskripsi
                                </h3>
                                <p className="text-gray-900">
                                    {extracurricular.description ||
                                        "Belum ada deskripsi untuk ekstrakurikuler ini."}
                                </p>
                            </div>
                        </div>

                        {/* Daftar Siswa */}
                        <div className="bg-white border rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <People
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>Daftar Siswa</span>
                                </h2>
                                <span className="text-xs text-gray-500">
                                    {students.length} siswa terdaftar
                                </span>
                            </div>
                            {students.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Nama
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    NISN
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {students.map((s) => (
                                                <tr key={s.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        {s.name}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        {s.nisn}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        {s.email}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-6 py-4 text-sm text-gray-500">
                                    Belum ada siswa yang terdaftar pada
                                    ekstrakurikuler ini.
                                </div>
                            )}
                        </div>

                        {/* Rekap Presensi per Siswa */}
                        <div className="bg-white border rounded-lg shadow-sm mt-6">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800">
                                    Rekap Presensi per Siswa
                                </h2>
                                <span className="text-xs text-gray-500">
                                    Berdasarkan semua sesi presensi ekskul ini
                                </span>
                            </div>
                            {extracurricular.attendance_recap &&
                            extracurricular.attendance_recap.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Nama
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Hadir
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Sakit
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Izin
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Alpha
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    % Hadir
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {extracurricular.attendance_recap.map(
                                                (row) => (
                                                    <tr key={row.id}>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900">
                                                                {row.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                NISN:{" "}
                                                                {row.nisn}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {row.present}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {row.sick}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {row.permit}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {row.absent}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {row.total_sessions}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            {row.attendance_rate}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-6 py-4 text-sm text-gray-500">
                                    Belum ada data presensi untuk
                                    ekstrakurikuler ini.
                                </div>
                            )}
                        </div>

                        {/* Sesi Presensi Ekskul */}
                        <div className="bg-white border rounded-lg shadow-sm mt-6">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Calendar size="20" className="text-green-600" />
                                    <span>Sesi Presensi Ekstrakurikuler</span>
                                </h2>
                                <span className="text-xs text-gray-500">
                                    {sessions.length} sesi
                                </span>
                            </div>
                            {sessions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Tanggal
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Judul
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Tipe Sesi
                                                </th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                    Mulai
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
                                                        {s.session_type}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        {s.start_time || "-"}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                s.is_active
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {s.is_active
                                                                ? "Aktif"
                                                                : "Selesai"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-6 py-4 text-sm text-gray-500">
                                    Belum ada sesi presensi yang dibuat untuk
                                    ekstrakurikuler ini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherExtracurricularShow;
