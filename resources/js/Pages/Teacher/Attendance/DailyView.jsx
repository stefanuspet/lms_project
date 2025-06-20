import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    Calendar,
    BookSquare,
    People,
    TickCircle,
    CloseCircle,
    InfoCircle,
    Clock,
    ExportCircle,
    Filter,
} from "iconsax-reactjs";

const TeacherAttendanceDailyView = ({
    attendance_data,
    overall_stats,
    selected_date,
    formatted_date,
    flash,
}) => {
    const [expandedClass, setExpandedClass] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");

    // Handle expand/collapse class
    const toggleClass = (classId) => {
        if (expandedClass === classId) {
            setExpandedClass(null);
        } else {
            setExpandedClass(classId);
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case "hadir":
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <TickCircle size="14" className="mr-1" />
                        Present
                    </span>
                );
            case "izin":
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        <InfoCircle size="14" className="mr-1" />
                        Permission
                    </span>
                );
            case "sakit":
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        <InfoCircle size="14" className="mr-1" />
                        Sick
                    </span>
                );
            case "alpha":
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        <CloseCircle size="14" className="mr-1" />
                        Absent
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Unknown
                    </span>
                );
        }
    };

    // Filter students by status
    const getFilteredStudents = (students) => {
        if (filterStatus === "all") return students;
        return students.filter((student) => student.status === filterStatus);
    };

    return (
        <TeacherLayout title={`Daily Attendance: ${formatted_date}`}>
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

            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.attendance.index", {
                                    date: selected_date,
                                })}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Daily Attendance Detail
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {formatted_date}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Overall Statistics */}
                    <div className="p-6 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Classes
                                </h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    {overall_stats.classes_count}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Total Students
                                </h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    {overall_stats.total_students}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-green-500 mb-1">
                                    Present
                                </h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {overall_stats.present_count}
                                </p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-red-500 mb-1">
                                    Absent
                                </h3>
                                <p className="text-2xl font-bold text-red-600">
                                    {overall_stats.absent_count}
                                </p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-orange-500 mb-1">
                                    Excused
                                </h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    {overall_stats.excused_count}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-500">
                                    Attendance Rate
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                    {overall_stats.attendance_rate}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{
                                        width: `${overall_stats.attendance_rate}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Filter by status */}
                    <div className="px-6 py-3 bg-gray-50 border-b flex items-center space-x-2 overflow-x-auto">
                        <span className="text-sm text-gray-600">
                            Filter by status:
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
                            onClick={() => setFilterStatus("hadir")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "hadir"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Present
                        </button>
                        <button
                            onClick={() => setFilterStatus("alpha")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "alpha"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Absent
                        </button>
                        <button
                            onClick={() => setFilterStatus("izin")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "izin"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Permission
                        </button>
                        <button
                            onClick={() => setFilterStatus("sakit")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "sakit"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Sick
                        </button>
                    </div>

                    {/* Class Attendance Details */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            Attendance by Class
                        </h2>

                        {attendance_data && attendance_data.length > 0 ? (
                            <div className="space-y-6">
                                {attendance_data.map((classData) => (
                                    <div
                                        key={classData.class_id}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        {/* Class Header */}
                                        <div
                                            className="bg-gray-50 px-4 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                                            onClick={() =>
                                                toggleClass(classData.class_id)
                                            }
                                        >
                                            <div>
                                                <h3 className="font-medium text-gray-800">
                                                    {classData.class_name}
                                                </h3>
                                                <div className="flex items-center mt-1">
                                                    <span className="text-xs text-gray-500 mr-2">
                                                        Present:{" "}
                                                        {
                                                            classData.present_count
                                                        }
                                                        /
                                                        {
                                                            classData.total_students
                                                        }
                                                    </span>
                                                    <span className="text-xs text-gray-500 mr-2">
                                                        Absent:{" "}
                                                        {classData.absent_count}
                                                        /
                                                        {
                                                            classData.total_students
                                                        }
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Excused:{" "}
                                                        {
                                                            classData.excused_count
                                                        }
                                                        /
                                                        {
                                                            classData.total_students
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="mr-4">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {
                                                            classData.attendance_rate
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                                <svg
                                                    className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                                        expandedClass ===
                                                        classData.class_id
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Student List */}
                                        {expandedClass ===
                                            classData.class_id && (
                                            <div className="p-4">
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
                                                                    Submitted At
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {getFilteredStudents(
                                                                classData.students
                                                            ).length > 0 ? (
                                                                getFilteredStudents(
                                                                    classData.students
                                                                ).map(
                                                                    (
                                                                        student
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                student.id
                                                                            }
                                                                            className="hover:bg-gray-50"
                                                                        >
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="text-sm font-medium text-gray-900">
                                                                                    {
                                                                                        student.name
                                                                                    }
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                {
                                                                                    student.nisn
                                                                                }
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                {student.gender ===
                                                                                "male"
                                                                                    ? "Male"
                                                                                    : "Female"}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                {getStatusBadge(
                                                                                    student.status
                                                                                )}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                {student.submitted_at ||
                                                                                    "-"}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                )
                                                            ) : (
                                                                <tr>
                                                                    <td
                                                                        colSpan="5"
                                                                        className="px-6 py-4 text-center text-gray-500"
                                                                    >
                                                                        No
                                                                        students
                                                                        match
                                                                        the
                                                                        selected
                                                                        filter.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-8 rounded-lg text-center">
                                <Calendar
                                    size="48"
                                    className="text-gray-300 mx-auto mb-2"
                                />
                                <p className="text-gray-600 font-medium">
                                    No attendance data found
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    There are no attendance records for this
                                    date.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAttendanceDailyView;
