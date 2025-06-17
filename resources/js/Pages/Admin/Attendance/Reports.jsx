import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ChartSuccess,
    Calendar,
    Profile2User,
    ArrangeHorizontalSquare,
    Book1,
    DocumentDownload,
    TickCircle,
    CloseCircle,
    Timer,
    ClipboardTick,
} from "iconsax-reactjs";

const AttendanceReports = ({
    filters,
    filterOptions,
    attendanceData,
    sessionDates,
    hasData,
}) => {
    const [semesterId, setSemesterId] = useState(filters.semester_id || "");
    const [classId, setClassId] = useState(filters.class_id || "");
    const [studentId, setStudentId] = useState(filters.student_id || "");
    const [dateFrom, setDateFrom] = useState(filters.date_from || "");
    const [dateTo, setDateTo] = useState(filters.date_to || "");
    const [availableStudents, setAvailableStudents] = useState(
        filterOptions.students || []
    );

    // Update student options when class or semester changes
    useEffect(() => {
        if (classId && semesterId) {
            router.get(
                route("admin.attendance.reports"),
                {
                    class_id: classId,
                    semester_id: semesterId,
                },
                {
                    preserveState: true,
                    only: ["filterOptions"],
                    onSuccess: (page) => {
                        setAvailableStudents(page.props.filterOptions.students);
                        if (
                            studentId &&
                            !page.props.filterOptions.students.some(
                                (s) => s.id == studentId
                            )
                        ) {
                            setStudentId("");
                        }
                    },
                }
            );
        } else {
            setAvailableStudents([]);
        }
    }, [classId, semesterId]);

    const handleGenerateReport = (e) => {
        e.preventDefault();

        router.get(route("admin.attendance.reports"), {
            semester_id: semesterId,
            class_id: classId,
            student_id: studentId,
            date_from: dateFrom,
            date_to: dateTo,
        });
    };

    const handleExport = () => {
        router.post(route("admin.attendance.export-report"), {
            semester_id: semesterId,
            class_id: classId,
            student_id: studentId,
            date_from: dateFrom,
            date_to: dateTo,
        });
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
            case "not_submitted":
                return "bg-gray-100 text-gray-800";
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

    const renderStudentReport = () => {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Student Attendance Report
                        </h2>
                        <p className="text-gray-500">
                            {attendanceData.student.name} (
                            {attendanceData.student.nisn})
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <DocumentDownload size="20" className="mr-2" />
                        Export Report
                    </button>
                </div>

                {/* Attendance Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-500 uppercase font-semibold">
                                Total
                            </p>
                            <p className="text-2xl font-bold text-blue-700">
                                {attendanceData.stats.total}
                            </p>
                        </div>
                        <Profile2User size="32" className="text-blue-400" />
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-500 uppercase font-semibold">
                                Present
                            </p>
                            <p className="text-2xl font-bold text-green-700">
                                {attendanceData.stats.present}
                            </p>
                            <p className="text-xs text-green-600">
                                {attendanceData.stats.total > 0
                                    ? `${Math.round(
                                          (attendanceData.stats.present /
                                              attendanceData.stats.total) *
                                              100
                                      )}%`
                                    : "0%"}
                            </p>
                        </div>
                        <TickCircle size="32" className="text-green-400" />
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-orange-500 uppercase font-semibold">
                                Sick
                            </p>
                            <p className="text-2xl font-bold text-orange-700">
                                {attendanceData.stats.sick}
                            </p>
                        </div>
                        <Timer size="32" className="text-orange-400" />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-500 uppercase font-semibold">
                                Excused
                            </p>
                            <p className="text-2xl font-bold text-blue-700">
                                {attendanceData.stats.excused}
                            </p>
                        </div>
                        <ClipboardTick size="32" className="text-blue-400" />
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-red-500 uppercase font-semibold">
                                Absent
                            </p>
                            <p className="text-2xl font-bold text-red-700">
                                {attendanceData.stats.absent +
                                    attendanceData.stats.not_submitted}
                            </p>
                        </div>
                        <CloseCircle size="32" className="text-red-400" />
                    </div>
                </div>

                {/* Attendance Records Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submission Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceData.attendances.map(
                                (attendance, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {attendance.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {attendance.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {attendance.status !==
                                            "not_submitted" ? (
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                                        attendance.status
                                                    )}`}
                                                >
                                                    <span className="flex items-center">
                                                        {getStatusIcon(
                                                            attendance.status
                                                        )}
                                                        <span className="ml-1 capitalize">
                                                            {attendance.status}
                                                        </span>
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">
                                                    Not submitted
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {attendance.submitted_at}
                                        </td>
                                    </tr>
                                )
                            )}
                            {attendanceData.attendances.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderClassReport = () => {
        // Find class and semester names
        const classObj = filterOptions.classes.find((c) => c.id == classId);
        const semesterObj = filterOptions.semesters.find(
            (s) => s.id == semesterId
        );

        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Class Attendance Report
                        </h2>
                        <p className="text-gray-500">
                            {classObj?.name || "Class"} -{" "}
                            {semesterObj?.name || "Semester"}
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <DocumentDownload size="20" className="mr-2" />
                        Export Report
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500">
                        Total attendance sessions:{" "}
                        <span className="font-semibold">
                            {attendanceData.session_count}
                        </span>
                    </p>
                </div>

                {/* Students Attendance Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    NISN
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Present
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sick
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Excused
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Absent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Attendance Rate
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceData.students.map((studentData) => (
                                <tr
                                    key={studentData.student.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {studentData.student.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {studentData.student.nisn}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <TickCircle
                                                size="16"
                                                className="text-green-500 mr-2"
                                            />
                                            {studentData.stats.present}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <Timer
                                                size="16"
                                                className="text-orange-500 mr-2"
                                            />
                                            {studentData.stats.sick}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <ClipboardTick
                                                size="16"
                                                className="text-blue-500 mr-2"
                                            />
                                            {studentData.stats.excused}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <CloseCircle
                                                size="16"
                                                className="text-red-500 mr-2"
                                            />
                                            {studentData.stats.absent +
                                                studentData.stats.not_submitted}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex flex-col flex-1 max-w-[200px]">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {
                                                        studentData.stats
                                                            .attendance_rate
                                                    }
                                                    %
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                                    <div
                                                        className={`h-2.5 rounded-full ${
                                                            studentData.stats
                                                                .attendance_rate >=
                                                            80
                                                                ? "bg-green-600"
                                                                : studentData
                                                                      .stats
                                                                      .attendance_rate >=
                                                                  60
                                                                ? "bg-yellow-400"
                                                                : "bg-red-600"
                                                        }`}
                                                        style={{
                                                            width: `${studentData.stats.attendance_rate}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {attendanceData.students.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No students found in this class.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout title="Attendance Reports">
            <div className="py-8">
                {/* Filters Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <ChartSuccess
                            size="24"
                            className="text-green-500 mr-2"
                        />
                        <h2 className="text-xl font-bold text-gray-800">
                            Generate Attendance Report
                        </h2>
                    </div>

                    <form onSubmit={handleGenerateReport}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Semester filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Semester
                                </label>
                                <select
                                    value={semesterId}
                                    onChange={(e) =>
                                        setSemesterId(e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                    <option value="">Select Semester</option>
                                    {filterOptions.semesters.map((semester) => (
                                        <option
                                            key={semester.id}
                                            value={semester.id}
                                        >
                                            {semester.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Class filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Class
                                </label>
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    disabled={!semesterId}
                                >
                                    <option value="">Select Class</option>
                                    {filterOptions.classes.map((classItem) => (
                                        <option
                                            key={classItem.id}
                                            value={classItem.id}
                                        >
                                            {classItem.name}
                                        </option>
                                    ))}
                                </select>
                                {!semesterId && (
                                    <p className="mt-1 text-xs text-red-500">
                                        Please select a semester first
                                    </p>
                                )}
                            </div>

                            {/* Student filter (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Student (Optional)
                                </label>
                                <select
                                    value={studentId}
                                    onChange={(e) =>
                                        setStudentId(e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    disabled={
                                        !classId ||
                                        !semesterId ||
                                        availableStudents.length === 0
                                    }
                                >
                                    <option value="">All Students</option>
                                    {availableStudents.map((student) => (
                                        <option
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {student.name} ({student.nisn})
                                        </option>
                                    ))}
                                </select>
                                {classId &&
                                    semesterId &&
                                    availableStudents.length === 0 && (
                                        <p className="mt-1 text-xs text-red-500">
                                            No students enrolled in this class
                                        </p>
                                    )}
                            </div>

                            {/* Date From filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date From (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                                disabled={!semesterId || !classId}
                            >
                                <ChartSuccess size="20" className="mr-2" />
                                Generate Report
                            </button>
                        </div>
                    </form>
                </div>

                {/* Report Display */}
                {hasData ? (
                    studentId ? (
                        renderStudentReport()
                    ) : (
                        renderClassReport()
                    )
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="flex flex-col items-center justify-center py-12">
                            <ChartSuccess
                                size="64"
                                className="text-gray-300 mb-4"
                            />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">
                                No Report Generated Yet
                            </h3>
                            <p className="text-gray-500 max-w-md">
                                Select a semester and class, then click
                                "Generate Report" to view attendance statistics.
                                You can optionally select a specific student to
                                see their detailed attendance records.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default AttendanceReports;
