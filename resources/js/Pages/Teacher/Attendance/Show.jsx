import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    Calendar,
    Clock,
    BookSquare,
    People,
    TickCircle,
    CloseCircle,
    InfoCircle,
    Save2,
    DocumentDownload,
} from "iconsax-reactjs";

const TeacherAttendanceShow = ({ session, students }) => {
    const [attendanceData, setAttendanceData] = useState(
        students.map((student) => ({
            student_id: student.id,
            status: student.attendance_status || "alpha", // Default to absent if no status
        }))
    );
    const [processing, setProcessing] = useState(false);

    // Handle attendance status change
    const handleStatusChange = (studentId, status) => {
        setAttendanceData(
            attendanceData.map((item) =>
                item.student_id === studentId
                    ? { ...item, status: status }
                    : item
            )
        );
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(
            route("teacher.attendance.updateAttendance", session.id),
            { attendance: attendanceData },
            {
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            }
        );
    };

    // Get status color classes
    const getStatusColor = (status) => {
        switch (status) {
            case "hadir":
                return "bg-green-100 text-green-800";
            case "izin":
                return "bg-yellow-100 text-yellow-800";
            case "sakit":
                return "bg-orange-100 text-orange-800";
            case "alpha":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

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
                return null;
        }
    };

    return (
        <TeacherLayout title={`Attendance Session: ${session.date}`}>
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
                                Attendance Session Details
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={route(
                                    "teacher.attendance.report",
                                    session.subject_id
                                )}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                                <DocumentDownload size="20" />
                                <span>View Report</span>
                            </Link>
                        </div>
                    </div>

                    {/* Session Info */}
                    <div className="p-6 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        {session.subject_name}
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
                                        {session.class_name}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Date
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Calendar
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {session.date}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-1 bg-purple-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-purple-500 mb-1">
                                    PIN Code
                                </h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-purple-700">
                                        {session.pin}
                                    </p>
                                </div>
                                <p className="text-xs text-purple-600 mt-1">
                                    {session.is_expired
                                        ? "Expired"
                                        : `Expires at ${session.expires_at}`}
                                </p>
                            </div>

                            <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-500 mb-1">
                                    Attendance Statistics
                                </h3>
                                <div className="grid grid-cols-4 gap-4 mt-2">
                                    <div className="col-span-1 text-center">
                                        <p className="text-xs text-blue-700">
                                            Total
                                        </p>
                                        <p className="text-xl font-bold text-blue-800">
                                            {session.stats.total_students}
                                        </p>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <p className="text-xs text-green-700">
                                            Present
                                        </p>
                                        <p className="text-xl font-bold text-green-800">
                                            {session.stats.present_count}
                                        </p>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <p className="text-xs text-red-700">
                                            Absent
                                        </p>
                                        <p className="text-xl font-bold text-red-800">
                                            {session.stats.absent_count}
                                        </p>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <p className="text-xs text-orange-700">
                                            Excused
                                        </p>
                                        <p className="text-xl font-bold text-orange-800">
                                            {session.stats.excused_count}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-blue-700 mb-1">
                                        Attendance Rate:{" "}
                                        {session.stats.attendance_rate}%
                                    </p>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{
                                                width: `${session.stats.attendance_rate}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Attendance List */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            Student Attendance
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                NISN
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Gender
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student) => (
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.gender}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    student.id,
                                                                    "hadir"
                                                                )
                                                            }
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                attendanceData.find(
                                                                    (item) =>
                                                                        item.student_id ===
                                                                        student.id
                                                                ).status ===
                                                                "hadir"
                                                                    ? "bg-green-100 text-green-800 ring-2 ring-green-500"
                                                                    : "bg-gray-100 text-gray-800 hover:bg-green-50"
                                                            }`}
                                                        >
                                                            Present
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    student.id,
                                                                    "izin"
                                                                )
                                                            }
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                attendanceData.find(
                                                                    (item) =>
                                                                        item.student_id ===
                                                                        student.id
                                                                ).status ===
                                                                "izin"
                                                                    ? "bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500"
                                                                    : "bg-gray-100 text-gray-800 hover:bg-yellow-50"
                                                            }`}
                                                        >
                                                            Permission
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    student.id,
                                                                    "sakit"
                                                                )
                                                            }
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                attendanceData.find(
                                                                    (item) =>
                                                                        item.student_id ===
                                                                        student.id
                                                                ).status ===
                                                                "sakit"
                                                                    ? "bg-orange-100 text-orange-800 ring-2 ring-orange-500"
                                                                    : "bg-gray-100 text-gray-800 hover:bg-orange-50"
                                                            }`}
                                                        >
                                                            Sick
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    student.id,
                                                                    "alpha"
                                                                )
                                                            }
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                attendanceData.find(
                                                                    (item) =>
                                                                        item.student_id ===
                                                                        student.id
                                                                ).status ===
                                                                "alpha"
                                                                    ? "bg-red-100 text-red-800 ring-2 ring-red-500"
                                                                    : "bg-gray-100 text-gray-800 hover:bg-red-50"
                                                            }`}
                                                        >
                                                            Absent
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.submitted_at ||
                                                        "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("teacher.attendance.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Back
                                </Link>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                    disabled={processing}
                                >
                                    <Save2 size="20" />
                                    <span>
                                        {processing
                                            ? "Saving..."
                                            : "Save Attendance"}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAttendanceShow;
