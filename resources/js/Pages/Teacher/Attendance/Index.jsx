import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    Calendar,
    Clock,
    SearchNormal1,
    Setting4,
    ChartSuccess,
    Eye,
    TickCircle,
    CloseCircle,
    InfoCircle,
    NotificationBing,
} from "iconsax-reactjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TeacherAttendanceIndex = ({
    sessions,
    daily_summary,
    active_sessions,
    selected_date,
    pagination,
    flash,
}) => {
    const [selectedDate, setSelectedDate] = useState(
        selected_date ? new Date(selected_date) : new Date()
    );

    // Handle date change
    const handleDateChange = (date) => {
        setSelectedDate(date);

        router.get(
            route("teacher.attendance.index"),
            {
                date: date.toISOString().split("T")[0],
                page: 1,
                per_page: pagination.per_page,
            },
            {
                preserveState: true,
                preserveScroll: false,
            }
        );
    };

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Pagination
    const goToPage = (page) => {
        router.get(
            route("teacher.attendance.index"),
            {
                date: selectedDate.toISOString().split("T")[0],
                page: page,
                per_page: pagination.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["sessions", "pagination"],
            }
        );
    };

    return (
        <TeacherLayout title="Daily Attendance">
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
                {/* Active Sessions Alert */}
                {active_sessions && active_sessions.length > 0 && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <NotificationBing
                                    size="24"
                                    className="text-blue-500"
                                />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Active Attendance Sessions Today
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        There are {active_sessions.length}{" "}
                                        active attendance sessions for today.
                                    </p>
                                    <Link
                                        href={route(
                                            "teacher.attendance.active_sessions"
                                        )}
                                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs leading-4 font-medium rounded-full text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-blue-50 transition ease-in-out duration-150"
                                    >
                                        <Eye size="14" className="mr-1" />
                                        View Active Sessions
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <h1 className="font-bold text-xl text-gray-800">
                            Daily Attendance Overview
                        </h1>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Calendar
                                    size="20"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Daily Summary */}
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            {formatDate(selectedDate)}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Classes
                                </h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    {daily_summary.classes_with_sessions}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Total Students
                                </h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    {daily_summary.total_students}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-green-500 mb-1">
                                    Present
                                </h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {daily_summary.present_count}
                                </p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-red-500 mb-1">
                                    Absent
                                </h3>
                                <p className="text-2xl font-bold text-red-600">
                                    {daily_summary.absent_count}
                                </p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-orange-500 mb-1">
                                    Excused
                                </h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    {daily_summary.excused_count}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-500">
                                    Attendance Rate
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                    {daily_summary.attendance_rate}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{
                                        width: `${daily_summary.attendance_rate}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        {daily_summary.classes_with_sessions > 0 && (
                            <div className="mt-4">
                                <Link
                                    href={route("teacher.attendance.daily", {
                                        date: selectedDate
                                            .toISOString()
                                            .split("T")[0],
                                    })}
                                    className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm leading-5 font-medium rounded-md text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-blue-50 transition ease-in-out duration-150"
                                >
                                    <Eye size="16" className="mr-2" />
                                    View Detailed Attendance
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Class Sessions List */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            Attendance Sessions by Class
                        </h2>

                        {sessions && sessions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                            <h3 className="font-medium text-gray-800">
                                                {session.class_name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {session.subject_name}
                                            </p>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar
                                                        size="16"
                                                        className="text-gray-400"
                                                    />
                                                    <span className="text-sm text-gray-600">
                                                        {session.date}
                                                    </span>
                                                </div>
                                                {!session.is_expired && (
                                                    <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                        Active
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">
                                                        Present:
                                                    </span>
                                                    <span className="text-sm font-medium text-green-600">
                                                        {session.present_count}/
                                                        {session.total_students}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">
                                                        Absent:
                                                    </span>
                                                    <span className="text-sm font-medium text-red-600">
                                                        {session.absent_count}/
                                                        {session.total_students}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">
                                                        Excused:
                                                    </span>
                                                    <span className="text-sm font-medium text-orange-600">
                                                        {session.excused_count}/
                                                        {session.total_students}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{
                                                            width: `${session.attendance_rate}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        Attendance Rate
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {
                                                            session.attendance_rate
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
                                    No attendance sessions found
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    There are no attendance sessions recorded
                                    for this date.
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.total > 0 && (
                            <div className="mt-6 flex justify-center">
                                <nav
                                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={() =>
                                            goToPage(
                                                pagination.current_page - 1
                                            )
                                        }
                                        disabled={pagination.current_page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">
                                            Previous
                                        </span>
                                        <svg
                                            className="h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>

                                    {/* Page numbers */}
                                    {[
                                        ...Array(pagination.last_page).keys(),
                                    ].map((page) => (
                                        <button
                                            key={page + 1}
                                            onClick={() => goToPage(page + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page + 1 ===
                                                pagination.current_page
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() =>
                                            goToPage(
                                                pagination.current_page + 1
                                            )
                                        }
                                        disabled={
                                            pagination.current_page ===
                                            pagination.last_page
                                        }
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg
                                            className="h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAttendanceIndex;
