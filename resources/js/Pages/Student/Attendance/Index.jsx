import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    Calendar,
    Chart,
    TickCircle,
    CloseCircle,
    DocumentText,
    Book1,
    Teacher,
    Information,
    CalendarTick,
    Profile2User,
    Clock,
} from "iconsax-reactjs";

const StudentAttendanceIndex = ({
    attendance_summary,
    attendance_by_subject,
    recent_attendances,
}) => {
    // Function to get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case "hadir":
                return "bg-green-100 text-green-800";
            case "sakit":
                return "bg-yellow-100 text-yellow-800";
            case "izin":
                return "bg-blue-100 text-blue-800";
            case "alpha":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Function to get status icon
    const getStatusIcon = (status, size = "16") => {
        switch (status) {
            case "hadir":
                return <TickCircle size={size} className="text-green-600" />;
            case "sakit":
                return <Information size={size} className="text-yellow-600" />;
            case "izin":
                return <Information size={size} className="text-blue-600" />;
            case "alpha":
                return <CloseCircle size={size} className="text-red-600" />;
            default:
                return <Information size={size} className="text-gray-600" />;
        }
    };

    return (
        <StudentLayout title="Ringkasan Presensi">
            <div className="py-6 w-full">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Total Sessions
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {attendance_summary.total_sessions || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Calendar
                                variant="Bold"
                                size="24"
                                className="text-blue-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Present</p>
                            <p className="text-2xl font-bold text-green-600">
                                {attendance_summary.present || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <TickCircle
                                variant="Bold"
                                size="24"
                                className="text-green-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Sick</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {attendance_summary.sick || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <Information
                                variant="Bold"
                                size="24"
                                className="text-yellow-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Excused</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {attendance_summary.permit || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Information
                                variant="Bold"
                                size="24"
                                className="text-blue-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Absent</p>
                            <p className="text-2xl font-bold text-red-600">
                                {attendance_summary.absent || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <CloseCircle
                                variant="Bold"
                                size="24"
                                className="text-red-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Kartu Persentase Presensi */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Chart
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>Ringkasan Presensi</span>
                                </h2>
                                <Link
                                    href={route("student.attendance.history")}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Lihat Riwayat Lengkap
                                </Link>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <div className="relative w-32 h-32">
                                        <svg
                                            className="w-full h-full"
                                            viewBox="0 0 36 36"
                                        >
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#eee"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#4ade80"
                                                strokeWidth="3"
                                                strokeDasharray={`${
                                                    attendance_summary.attendance_rate !==
                                                    "N/A"
                                                        ? parseInt(
                                                              attendance_summary.attendance_rate
                                                          )
                                                        : 0
                                                }, 100`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-gray-800">
                                                {
                                                    attendance_summary.attendance_rate
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium text-gray-700 mt-3">
                                        Persentase Kehadiran
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-blue-800 mb-2">
                                            Present vs Absent
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span className="text-gray-700">
                                                    Present:{" "}
                                                    {attendance_summary.present}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <span className="text-gray-700">
                                                    Absent:{" "}
                                                    {attendance_summary.absent}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full"
                                                style={{
                                                    width: `${
                                                        attendance_summary.total_sessions >
                                                        0
                                                            ? (attendance_summary.present /
                                                                  attendance_summary.total_sessions) *
                                                              100
                                                            : 0
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-blue-800 mb-2">
                                            Excused Absences
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <span className="text-gray-700">
                                                    Sick:{" "}
                                                    {attendance_summary.sick}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span className="text-gray-700">
                                                    Permit:{" "}
                                                    {attendance_summary.permit}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-yellow-500 h-full"
                                                style={{
                                                    width: `${
                                                        attendance_summary.total_sessions >
                                                        0
                                                            ? (attendance_summary.sick /
                                                                  attendance_summary.total_sessions) *
                                                              100
                                                            : 0
                                                    }%`,
                                                }}
                                            ></div>
                                            <div
                                                className="bg-blue-500 h-full ml-auto"
                                                style={{
                                                    width: `${
                                                        attendance_summary.total_sessions >
                                                        0
                                                            ? (attendance_summary.permit /
                                                                  attendance_summary.total_sessions) *
                                                              100
                                                            : 0
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Presensi per Sesi */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Book1
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>Presensi per Sesi</span>
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                {attendance_by_subject &&
                                attendance_by_subject.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Session Title
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Sessions
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Present
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Absent
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Rate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {attendance_by_subject.map(
                                                    (subject, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        subject.subject_name
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {
                                                                        subject.total_sessions
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-green-600 font-medium">
                                                                    {
                                                                        subject.present
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-red-600 font-medium">
                                                                    {
                                                                        subject.absent
                                                                    }
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                        subject.attendance_rate ===
                                                                        "N/A"
                                                                            ? "bg-gray-100 text-gray-800"
                                                                            : parseInt(
                                                                                  subject.attendance_rate
                                                                              ) >=
                                                                              90
                                                                            ? "bg-green-100 text-green-800"
                                                                            : parseInt(
                                                                                  subject.attendance_rate
                                                                              ) >=
                                                                              75
                                                                            ? "bg-yellow-100 text-yellow-800"
                                                                            : "bg-red-100 text-red-800"
                                                                    }`}
                                                                >
                                                                    {
                                                                        subject.attendance_rate
                                                                    }
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>
                                            Tidak ada data presensi untuk
                                            sessions.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Presensi Terbaru */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <CalendarTick
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>Presensi Terbaru</span>
                                </h2>
                                <Link
                                    href={route("student.attendance.history")}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Lihat Semua
                                </Link>
                            </div>
                            <div className="px-6 py-4">
                                {recent_attendances &&
                                recent_attendances.length > 0 ? (
                                    <div className="divide-y">
                                        {recent_attendances.map(
                                            (attendance) => (
                                                <div
                                                    key={attendance.id}
                                                    className="py-3 first:pt-0 last:pb-0"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`p-2 rounded-full ${
                                                                attendance.status ===
                                                                "hadir"
                                                                    ? "bg-green-100"
                                                                    : attendance.status ===
                                                                      "sakit"
                                                                    ? "bg-yellow-100"
                                                                    : attendance.status ===
                                                                      "izin"
                                                                    ? "bg-blue-100"
                                                                    : "bg-red-100"
                                                            }`}
                                                        >
                                                            {getStatusIcon(
                                                                attendance.status,
                                                                "16"
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <p className="font-medium text-gray-900 text-sm">
                                                                    {
                                                                        attendance.subject_name
                                                                    }
                                                                </p>
                                                                <span
                                                                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                                                        attendance.status
                                                                    )}`}
                                                                >
                                                                    {attendance.status ===
                                                                    "hadir"
                                                                        ? "Present"
                                                                        : attendance.status ===
                                                                          "sakit"
                                                                        ? "Sick"
                                                                        : attendance.status ===
                                                                          "izin"
                                                                        ? "Excused"
                                                                        : "Absent"}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                <Calendar
                                                                    size="12"
                                                                    className="text-gray-400"
                                                                />
                                                                {
                                                                    attendance.date
                                                                }
                                                            </p>
                                                            {attendance.submitted_at && (
                                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                    <Clock
                                                                        size="12"
                                                                        className="text-gray-400"
                                                                    />
                                                                    Recorded:{" "}
                                                                    {
                                                                        attendance.submitted_at
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>Tidak ada riwayat presensi terbaru.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-blue-50 rounded-xl shadow-sm p-5 border border-blue-100">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <Information
                                    size="20"
                                    className="text-blue-600"
                                />
                                <span>Informasi Presensi</span>
                            </h3>

                            <div className="space-y-3 text-blue-700 text-sm">
                                <p>
                                    <span className="font-medium">
                                        Present (Hadir):
                                    </span>{" "}
                                    You were present in class.
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Sick (Sakit):
                                    </span>{" "}
                                    Absence with medical documentation.
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Excused (Izin):
                                    </span>{" "}
                                    Absence with prior permission.
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Absent (Alpha):
                                    </span>{" "}
                                    Unexcused absence.
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-blue-200">
                                <p className="text-sm text-blue-700">
                                    Attendance is taken in each class session.
                                    If you believe there's an error in your
                                    attendance record, please contact your
                                    teacher.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentAttendanceIndex;
