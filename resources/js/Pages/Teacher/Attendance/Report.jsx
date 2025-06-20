import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    Calendar,
    BookSquare,
    People,
    TickCircle,
    CloseCircle,
    InfoCircle,
    DocumentDownload,
    ExportCircle,
} from "iconsax-reactjs";

const TeacherAttendanceReport = ({ subject, sessions, report_data }) => {
    const [filterStatus, setFilterStatus] = useState("all");

    // Filter students based on attendance rate
    const filteredStudents =
        filterStatus === "all"
            ? report_data
            : filterStatus === "excellent"
            ? report_data.filter(
                  (student) => student.stats.attendance_rate >= 90
              )
            : filterStatus === "good"
            ? report_data.filter(
                  (student) =>
                      student.stats.attendance_rate >= 75 &&
                      student.stats.attendance_rate < 90
              )
            : filterStatus === "average"
            ? report_data.filter(
                  (student) =>
                      student.stats.attendance_rate >= 50 &&
                      student.stats.attendance_rate < 75
              )
            : report_data.filter(
                  (student) => student.stats.attendance_rate < 50
              );

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "hadir":
                return <TickCircle size="16" className="text-green-500" />;
            case "izin":
                return <InfoCircle size="16" className="text-yellow-500" />;
            case "sakit":
                return <InfoCircle size="16" className="text-orange-500" />;
            case "alpha":
                return <CloseCircle size="16" className="text-red-500" />;
            default:
                return <CloseCircle size="16" className="text-gray-300" />;
        }
    };

    // Get status text
    const getStatusText = (status) => {
        switch (status) {
            case "hadir":
                return "Present";
            case "izin":
                return "Permission";
            case "sakit":
                return "Sick";
            case "alpha":
                return "Absent";
            default:
                return "Absent";
        }
    };

    // Get attendance rate color
    const getAttendanceRateColor = (rate) => {
        if (rate >= 90) return "text-green-600";
        if (rate >= 75) return "text-blue-600";
        if (rate >= 50) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <TeacherLayout title={`Attendance Report: ${subject.name}`}>
            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
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
                            <h1 className="font-bold text-xl text-gray-800">
                                Attendance Report
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={route(
                                    "teacher.attendance.export",
                                    subject.id
                                )}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                                <ExportCircle size="20" />
                                <span>Export to CSV</span>
                            </a>
                        </div>
                    </div>

                    {/* Subject Info */}
                    <div className="p-6 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Subject
                                </h3>
                                <div className="flex items-center gap-2">
                                    <BookSquare
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.name}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Class
                                </h3>
                                <div className="flex items-center gap-2">
                                    <People
                                        size="20"
                                        className="text-purple-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.class_name}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-500 mb-1">
                                    Attendance Sessions
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {sessions.length > 0 ? (
                                        sessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="px-3 py-1 rounded-full bg-white text-blue-700 text-xs border border-blue-200 flex items-center gap-1"
                                            >
                                                <Calendar size="12" />
                                                <span>{session.date}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-blue-700">
                                            No attendance sessions found.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-3 bg-gray-50 border-b flex items-center space-x-2 overflow-x-auto">
                        <span className="text-sm text-gray-600">
                            Filter by attendance rate:
                        </span>
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "all"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus("excellent")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "excellent"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Excellent (≥90%)
                        </button>
                        <button
                            onClick={() => setFilterStatus("good")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "good"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Good (75-89%)
                        </button>
                        <button
                            onClick={() => setFilterStatus("average")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "average"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Average (50-74%)
                        </button>
                        <button
                            onClick={() => setFilterStatus("poor")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "poor"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Poor (Less Than 50%)
                        </button>
                    </div>

                    {/* Report Table */}
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            NISN
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Gender
                                        </th>
                                        {sessions.map((session) => (
                                            <th
                                                key={session.id}
                                                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {session.date.split(" ")[0]}
                                                <br />
                                                <span className="text-[10px] normal-case">
                                                    {session.date.split(" ")[1]}
                                                </span>
                                            </th>
                                        ))}
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Present
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Absent
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Excused
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-3 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.name}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.nisn}
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.gender}
                                                </td>
                                                {sessions.map((session) => {
                                                    const attendanceRecord =
                                                        student.attendance.find(
                                                            (a) =>
                                                                a.session_id ===
                                                                session.id
                                                        );
                                                    const status =
                                                        attendanceRecord
                                                            ? attendanceRecord.status
                                                            : "alpha";
                                                    return (
                                                        <td
                                                            key={`${student.id}-${session.id}`}
                                                            className="px-2 py-4 whitespace-nowrap text-center"
                                                            title={getStatusText(
                                                                status
                                                            )}
                                                        >
                                                            {getStatusBadge(
                                                                status
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {
                                                        student.stats
                                                            .present_count
                                                    }
                                                    /
                                                    {
                                                        student.stats
                                                            .total_sessions
                                                    }
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {student.stats.absent_count}
                                                    /
                                                    {
                                                        student.stats
                                                            .total_sessions
                                                    }
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {
                                                        student.stats
                                                            .excused_count
                                                    }
                                                    /
                                                    {
                                                        student.stats
                                                            .total_sessions
                                                    }
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-sm font-bold">
                                                    <span
                                                        className={getAttendanceRateColor(
                                                            student.stats
                                                                .attendance_rate
                                                        )}
                                                    >
                                                        {
                                                            student.stats
                                                                .attendance_rate
                                                        }
                                                        %
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7 + sessions.length}
                                                className="px-6 py-4 text-center text-gray-500"
                                            >
                                                No students found matching the
                                                selected filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Legend
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-1">
                                    <TickCircle
                                        size="16"
                                        className="text-green-500"
                                    />
                                    <span className="text-xs text-gray-600">
                                        Present
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <InfoCircle
                                        size="16"
                                        className="text-yellow-500"
                                    />
                                    <span className="text-xs text-gray-600">
                                        Permission
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <InfoCircle
                                        size="16"
                                        className="text-orange-500"
                                    />
                                    <span className="text-xs text-gray-600">
                                        Sick
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CloseCircle
                                        size="16"
                                        className="text-red-500"
                                    />
                                    <span className="text-xs text-gray-600">
                                        Absent
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end">
                            <Link
                                href={route("teacher.attendance.index")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Back to Attendance
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAttendanceReport;
