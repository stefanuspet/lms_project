import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    Calendar,
    ArrowLeft2,
    SearchNormal1,
    Filter,
    Setting4,
    Book1,
    TickCircle,
    CloseCircle,
    Information,
    Clock,
} from "iconsax-reactjs";

const StudentAttendanceHistory = ({
    attendances,
    pagination,
    filters,
    subjects,
    months,
}) => {
    const [titleFilter, setTitleFilter] = useState(filters?.title || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "all");
    const [monthFilter, setMonthFilter] = useState(filters?.month || "");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );

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

    // Function to apply filters
    const applyFilters = () => {
        router.get(
            route("student.attendance.history"),
            {
                title: titleFilter || null,
                status: statusFilter,
                month: monthFilter || null,
                page: 1, // Reset to page 1 when filtering
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["attendances", "pagination", "filters"],
            }
        );
    };

    // Navigate to specific page
    const goToPage = (page) => {
        router.get(
            route("student.attendance.history"),
            {
                page: page,
                title: titleFilter || null,
                status: statusFilter,
                month: monthFilter || null,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["attendances", "pagination"],
            }
        );
    };

    // Generate page numbers
    const generatePageNumbers = (current, total) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 3) {
            return [1, 2, 3, 4, "...", total];
        }

        if (current >= total - 2) {
            return [1, "...", total - 3, total - 2, total - 1, total];
        }

        return [1, "...", current - 1, current, current + 1, "...", total];
    };

    const pageNumbers = generatePageNumbers(
        currentPage,
        pagination?.last_page || 1
    );

    // Update currentPage when pagination changes
    useEffect(() => {
        if (pagination?.current_page) {
            setCurrentPage(pagination.current_page);
        }
    }, [pagination]);

    // Translate status to readable text
    const getStatusText = (status) => {
        switch (status) {
            case "hadir":
                return "Present";
            case "sakit":
                return "Sick";
            case "izin":
                return "Excused";
            case "alpha":
                return "Absent";
            default:
                return status;
        }
    };

    return (
        <StudentLayout title="Attendance History">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("student.attendance.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Attendance History
                            </h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Filter button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                                <Filter size="24" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="px-6 py-4 border-b bg-blue-50">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="w-64">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Filter by Session Title
                                    </label>
                                    <select
                                        value={titleFilter}
                                        onChange={(e) =>
                                            setTitleFilter(e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Sessions</option>
                                        {subjects.map((subject, index) => (
                                            <option
                                                key={index}
                                                value={subject.id}
                                            >
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-64">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Filter by Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="hadir">Present</option>
                                        <option value="sakit">Sick</option>
                                        <option value="izin">Excused</option>
                                        <option value="alpha">Absent</option>
                                    </select>
                                </div>

                                <div className="w-64">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Filter by Month
                                    </label>
                                    <select
                                        value={monthFilter}
                                        onChange={(e) =>
                                            setMonthFilter(e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Months</option>
                                        {months.map((month, index) => (
                                            <option
                                                key={index}
                                                value={month.value}
                                            >
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-grow mt-6">
                                    <button
                                        type="button"
                                        onClick={applyFilters}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTitleFilter("");
                                            setStatusFilter("all");
                                            setMonthFilter("");

                                            router.get(
                                                route(
                                                    "student.attendance.history"
                                                ),
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    only: [
                                                        "attendances",
                                                        "pagination",
                                                        "filters",
                                                    ],
                                                }
                                            );
                                        }}
                                        className="px-4 py-2 ml-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendance List */}
                    <div className="p-6">
                        {attendances && attendances.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Session Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Recorded Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {attendances.map((attendance) => (
                                            <tr key={attendance.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Calendar
                                                            size="18"
                                                            className="text-blue-600 mr-2"
                                                        />
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {attendance.date}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {
                                                            attendance.subject_name
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getStatusIcon(
                                                            attendance.status
                                                        )}
                                                        <span
                                                            className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                                                                attendance.status
                                                            )}`}
                                                        >
                                                            {getStatusText(
                                                                attendance.status
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {attendance.submitted_at ? (
                                                        <div className="flex items-center">
                                                            <Clock
                                                                size="16"
                                                                className="text-gray-400 mr-1"
                                                            />
                                                            {
                                                                attendance.submitted_at
                                                            }
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            Not recorded
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar
                                    size="48"
                                    className="mx-auto text-gray-300 mb-3"
                                />
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    No Attendance Records Found
                                </h3>
                                <p className="text-gray-500">
                                    {titleFilter ||
                                    statusFilter !== "all" ||
                                    monthFilter
                                        ? "Try adjusting your filters to see more results"
                                        : "There are no attendance records in the system yet"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                                <div>
                                    <nav
                                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                        aria-label="Pagination"
                                    >
                                        {pageNumbers.map((number, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    typeof number === "number"
                                                        ? goToPage(number)
                                                        : null
                                                }
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    number === currentPage
                                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                        : number === "..."
                                                        ? "bg-white border-gray-300 text-gray-500 cursor-default"
                                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                                                }`}
                                                disabled={number === "..."}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                disabled={currentPage === pagination.last_page}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentAttendanceHistory;
