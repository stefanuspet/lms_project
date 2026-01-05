import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    Calendar,
    DocumentText,
    TickCircle,
    CloseCircle,
    Timer1,
    ClipboardTick,
    People,
    MessageEdit,
    Timer,
} from "iconsax-reactjs";

const TeacherAttendanceDaily = ({
    date,
    sessions,
    selectedSessionId,
    attendanceData,
    students,
    stats,
    flash,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Handle date change
    const handleDateChange = (e) => {
        router.get(route("teacher.attendance.daily"), {
            date: e.target.value,
        });
    };

    // Handle session change
    const handleSessionChange = (e) => {
        router.get(route("teacher.attendance.daily"), {
            date: date,
            session_id: e.target.value,
        });
    };

    // Function to filter students by search term
    const filteredStudents = students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nisn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group students by attendance status
    const groupedStudents = {
        present: filteredStudents.filter(
            (student) => student.status === "hadir"
        ),
        absent: filteredStudents.filter(
            (student) => student.status === "alpha"
        ),
        sick: filteredStudents.filter((student) => student.status === "sakit"),
        excused: filteredStudents.filter(
            (student) => student.status === "izin"
        ),
        not_submitted: filteredStudents.filter(
            (student) => student.status === null
        ),
    };

    // Function to get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "hadir":
                return "bg-green-100 text-green-800";
            case "alpha":
                return "bg-red-100 text-red-800";
            case "sakit":
                return "bg-orange-100 text-orange-800";
            case "izin":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Function to get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "hadir":
                return <TickCircle size="16" className="text-green-500" />;
            case "alpha":
                return <CloseCircle size="16" className="text-red-500" />;
            case "sakit":
                return <Timer size="16" className="text-orange-500" />;
            case "izin":
                return <ClipboardTick size="16" className="text-blue-500" />;
            default:
                return null;
        }
    };

    return (
        <TeacherLayout title="Absensi Harian">
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
                {/* Header with Date Selection */}
                <div className="w-full bg-white rounded-xl shadow-sm mb-6">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
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
                                    Absensi Harian
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {formatDate(date)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={handleDateChange}
                                    className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                            </div>
                            <Link
                                href={route(
                                    "teacher.attendance.active_sessions"
                                )}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <Timer1 size="20" />
                                <span>Sesi Aktif</span>
                            </Link>
                        </div>
                    </div>

                    {/* Session Selection */}
                    <div className="p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pilih Sesi Absensi
                            </label>
                            <select
                                value={selectedSessionId || ""}
                                onChange={handleSessionChange}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                disabled={sessions.length === 0}
                            >
                                {sessions.length === 0 ? (
                                    <option value="">
                                        Tidak ada sesi absensi pada tanggal ini
                                    </option>
                                ) : (
                                    <>
                                        <option value="">
                                            Pilih sesi absensi
                                        </option>
                                        {sessions.map((session) => (
                                            <option
                                                key={session.id}
                                                value={session.id}
                                            >
                                                {session.title} ({session.session_type === "arrival" ? "Berangkat" : "Pulang"}) -{" "}
                                                {session.start_time || "??"} (QR: {session.qr_token})
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Session Details and Attendance List */}
                {attendanceData ? (
                    <>
                        {/* Session Info Card */}
                        <div className="w-full bg-white rounded-xl shadow-sm mb-6">
                            <div className="px-6 py-5 border-b">
                                <h2 className="font-bold text-lg text-gray-800">
                                    Detail Sesi
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Session Details */}
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-4">
                                            Informasi Sesi
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start">
                                                <DocumentText
                                                    size="20"
                                                    className="text-amber-500 mr-3 mt-0.5"
                                                />
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Judul
                                                    </p>
                                                    <p className="text-gray-900">
                                                        {attendanceData.title}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Calendar
                                                    size="20"
                                                    className="text-blue-500 mr-3 mt-0.5"
                                                />
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Tanggal
                                                    </p>
                                                    <p className="text-gray-900">
                                                        {attendanceData.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Timer1
                                                    size="20"
                                                    className="text-green-500 mr-3 mt-0.5"
                                                />
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Status & Waktu
                                                    </p>
                                                    <p
                                                        className={`${
                                                            attendanceData.is_active
                                                                ? "text-green-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {attendanceData.session_type === "arrival"
                                                            ? "Berangkat"
                                                            : "Pulang"}{" "}
                                                        {attendanceData.start_time
                                                            ? `${attendanceData.start_time} - ${attendanceData.expires_at}`
                                                            : `hingga ${attendanceData.expires_at}`}
                                                        {attendanceData.is_active
                                                            ? " (Aktif)"
                                                            : " (Berakhir)"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                                                    {attendanceData.qr_token}
                                                </div>
                                                <div className="ml-2 text-sm text-gray-500">
                                                    QR Token
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance Statistics */}
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-4">
                                            Statistik Kehadiran
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-blue-500 uppercase font-semibold">
                                                        Total
                                                    </p>
                                                    <p className="text-2xl font-bold text-blue-700">
                                                        {stats.total}
                                                    </p>
                                                </div>
                                                <People
                                                    size="32"
                                                    className="text-blue-400"
                                                />
                                            </div>

                                            <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-green-500 uppercase font-semibold">
                                                        Hadir
                                                    </p>
                                                    <p className="text-2xl font-bold text-green-700">
                                                        {stats.present}
                                                    </p>
                                                </div>
                                                <TickCircle
                                                    size="32"
                                                    className="text-green-400"
                                                />
                                            </div>

                                            <div className="bg-orange-50 p-4 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-orange-500 uppercase font-semibold">
                                                        Sakit
                                                    </p>
                                                    <p className="text-2xl font-bold text-orange-700">
                                                        {stats.sick}
                                                    </p>
                                                </div>
                                                <Timer
                                                    size="32"
                                                    className="text-orange-400"
                                                />
                                            </div>

                                            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-blue-500 uppercase font-semibold">
                                                        Izin
                                                    </p>
                                                    <p className="text-2xl font-bold text-blue-700">
                                                        {stats.excused}
                                                    </p>
                                                </div>
                                                <ClipboardTick
                                                    size="32"
                                                    className="text-blue-400"
                                                />
                                            </div>

                                            <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-red-500 uppercase font-semibold">
                                                        Absen
                                                    </p>
                                                    <p className="text-2xl font-bold text-red-700">
                                                        {stats.absent +
                                                            stats.not_submitted}
                                                    </p>
                                                </div>
                                                <CloseCircle
                                                    size="32"
                                                    className="text-red-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Students Attendance Card */}
                        <div className="w-full bg-white rounded-xl shadow-sm">
                            <div className="flex justify-between items-center px-6 py-5 border-b">
                                <h2 className="font-bold text-lg text-gray-800">
                                    Daftar Kehadiran Siswa
                                </h2>

                                {/* Search Box */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari berdasarkan nama atau NISN"
                                        className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 placeholder:text-sm"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="px-6 pt-4 border-b">
                                <div className="flex overflow-x-auto">
                                    <button
                                        className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                            selectedStatus === "all"
                                                ? "bg-gray-100 text-gray-900 border-b-2 border-gray-500"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() => setSelectedStatus("all")}
                                    >
                                        Semua ({filteredStudents.length})
                                    </button>
                                    <button
                                        className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                            selectedStatus === "hadir"
                                                ? "bg-green-100 text-green-800 border-b-2 border-green-500"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            setSelectedStatus("hadir")
                                        }
                                    >
                                        Hadir ({groupedStudents.present.length})
                                    </button>
                                    <button
                                        className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                            selectedStatus === "sakit"
                                                ? "bg-orange-100 text-orange-800 border-b-2 border-orange-500"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            setSelectedStatus("sakit")
                                        }
                                    >
                                        Sakit ({groupedStudents.sick.length})
                                    </button>
                                    <button
                                        className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                            selectedStatus === "izin"
                                                ? "bg-blue-100 text-blue-800 border-b-2 border-blue-500"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            setSelectedStatus("izin")
                                        }
                                    >
                                        Izin ({groupedStudents.excused.length})
                                    </button>
                                    <button
                                        className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                            selectedStatus === "alpha"
                                                ? "bg-red-100 text-red-800 border-b-2 border-red-500"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            setSelectedStatus("alpha")
                                        }
                                    >
                                        Alpha ({groupedStudents.absent.length})
                                    </button>
                                    <button
                                        className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                                            selectedStatus === "not_submitted"
                                                ? "bg-gray-100 text-gray-800 border-b-2 border-gray-500"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }`}
                                        onClick={() =>
                                            setSelectedStatus("not_submitted")
                                        }
                                    >
                                        Belum Mengisi (
                                        {groupedStudents.not_submitted.length})
                                    </button>
                                </div>
                            </div>

                            {/* Students List */}
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Siswa
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    NISN
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Waktu Pengisian
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredStudents
                                                .filter(
                                                    (student) =>
                                                        selectedStatus ===
                                                            "all" ||
                                                        (selectedStatus ===
                                                            "not_submitted" &&
                                                            student.status ===
                                                                null) ||
                                                        student.status ===
                                                            selectedStatus
                                                )
                                                .map((student) => (
                                                    <tr
                                                        key={student.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.nisn}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {student.status ? (
                                                                <span
                                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                                                        student.status
                                                                    )}`}
                                                                >
                                                                    <span className="flex items-center">
                                                                        {getStatusIcon(
                                                                            student.status
                                                                        )}
                                                                        <span className="ml-1 capitalize">
                                                                            {
                                                                                student.status
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-500">
                                                                    Belum
                                                                    mengisi
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.submitted_at ||
                                                                "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            {filteredStudents.filter(
                                                (student) =>
                                                    selectedStatus === "all" ||
                                                    (selectedStatus ===
                                                        "not_submitted" &&
                                                        student.status ===
                                                            null) ||
                                                    student.status ===
                                                        selectedStatus
                                            ).length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan="4"
                                                        className="px-6 py-4 text-center text-gray-500"
                                                    >
                                                        Tidak ada siswa dengan
                                                        status ini
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="py-12">
                            <div className="flex justify-center mb-4">
                                <Calendar size="64" className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-700 mb-2">
                                Tidak Ada Sesi Absensi
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {sessions.length === 0
                                    ? "Tidak ada sesi absensi pada tanggal ini. Silakan pilih tanggal lain atau hubungi admin untuk membuat sesi absensi baru."
                                    : "Silakan pilih sesi absensi dari dropdown di atas untuk melihat data kehadiran."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
};

export default TeacherAttendanceDaily;
