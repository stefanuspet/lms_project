import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    SearchNormal1,
    Filter,
    Export,
    MessageEdit,
    Calendar,
    TickCircle,
    Clock,
    CloseCircle,
    InfoCircle,
    Sort,
} from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherSubmissionIndex = ({
    submissions,
    assignment,
    subject,
    stats,
    pagination,
    filters,
    flash,
}) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [filterStatus, setFilterStatus] = useState(
        filters?.filter_status || "all"
    );

    // Handle filter change
    const handleFilterChange = (status) => {
        setFilterStatus(status);
        router.get(
            route("teacher.submissions.index", assignment.id),
            {
                search: searchTerm,
                page: 1,
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
                filter_status: status,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["submissions", "pagination", "filters"],
            }
        );
    };

    // Handle sort change
    const handleSortChange = (e) => {
        const [sortBy, sortOrder] = e.target.value.split("-");
        router.get(
            route("teacher.submissions.index", assignment.id),
            {
                search: searchTerm,
                page: 1,
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_status: filterStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["submissions", "pagination", "filters"],
            }
        );
    };

    // Fungsi untuk navigasi halaman
    const goToPage = (page) => {
        if (
            page === currentPage ||
            page === "..." ||
            page < 1 ||
            page > pagination.last_page
        ) {
            return;
        }

        router.get(
            route("teacher.submissions.index", assignment.id),
            {
                page: page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
                filter_status: filterStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["submissions", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("teacher.submissions.index", assignment.id),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
                filter_status: filterStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["submissions", "pagination", "filters"],
            }
        );
    };

    // Fungsi untuk generate page numbers
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

    // Function to export submissions
    const handleExport = () => {
        window.location.href = route(
            "teacher.submissions.export",
            assignment.id
        );
    };

    // Function to determine badge color based on student status
    const getStatusBadge = (status) => {
        switch (status) {
            case "graded":
                return "bg-green-100 text-green-800";
            case "submitted":
                return "bg-blue-100 text-blue-800";
            case "not_submitted":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Function to determine status text
    const getStatusText = (status) => {
        switch (status) {
            case "graded":
                return "Graded";
            case "submitted":
                return "Submitted";
            case "not_submitted":
                return "Not Submitted";
            default:
                return "Unknown";
        }
    };

    // Update currentPage when pagination changes
    useEffect(() => {
        if (pagination?.current_page) {
            setCurrentPage(pagination.current_page);
        }
    }, [pagination]);

    // Generate page numbers
    const pageNumbers = generatePageNumbers(
        currentPage,
        pagination?.last_page || 1
    );

    return (
        <TeacherLayout title={`Submissions - ${assignment.title}`}>
            {/* Flash message */}
            {flash?.success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.success}</p>
                </div>
            )}

            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route(
                                    "teacher.assignments.show",
                                    assignment.id
                                )}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Assignment Submissions
                                </h1>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <span>
                                        {subject.name} - {subject.class_name}
                                    </span>
                                    <span className="mx-1">•</span>
                                    <Calendar
                                        size="14"
                                        className={
                                            assignment.is_past_deadline
                                                ? "text-red-500"
                                                : "text-green-500"
                                        }
                                    />
                                    <span>Deadline: {assignment.deadline}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Search box */}
                            <form onSubmit={handleSearch} className="relative">
                                <SearchNormal1
                                    size="20"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by student name or NISN"
                                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 placeholder:text-sm"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <button type="submit" className="hidden">
                                    Search
                                </button>
                            </form>

                            {/* Export button */}
                            <button
                                onClick={handleExport}
                                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                title="Export to CSV"
                            >
                                <Export size="24" />
                            </button>
                        </div>
                    </div>

                    {/* Submission Statistics */}
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border">
                                <div className="text-gray-500 text-sm">
                                    Total Students
                                </div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {stats.total_students}
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border">
                                <div className="text-gray-500 text-sm">
                                    Submitted
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.submitted_count}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {stats.submission_rate}%
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border">
                                <div className="text-gray-500 text-sm">
                                    Graded
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {stats.graded_count}
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border">
                                <div className="text-gray-500 text-sm">
                                    Pending
                                </div>
                                <div className="text-2xl font-bold text-amber-600">
                                    {stats.pending_count}
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border">
                                <div className="text-gray-500 text-sm">
                                    Not Submitted
                                </div>
                                <div className="text-2xl font-bold text-red-600">
                                    {stats.not_submitted_count}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                                Filter by status:
                            </span>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => handleFilterChange("all")}
                                    className={`px-3 py-1 text-sm rounded-full ${
                                        filterStatus === "all"
                                            ? "bg-gray-800 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() =>
                                        handleFilterChange("submitted")
                                    }
                                    className={`px-3 py-1 text-sm rounded-full ${
                                        filterStatus === "submitted"
                                            ? "bg-blue-600 text-white"
                                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    }`}
                                >
                                    Submitted
                                </button>
                                <button
                                    onClick={() => handleFilterChange("graded")}
                                    className={`px-3 py-1 text-sm rounded-full ${
                                        filterStatus === "graded"
                                            ? "bg-green-600 text-white"
                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                    }`}
                                >
                                    Graded
                                </button>
                                <button
                                    onClick={() =>
                                        handleFilterChange("not_submitted")
                                    }
                                    className={`px-3 py-1 text-sm rounded-full ${
                                        filterStatus === "not_submitted"
                                            ? "bg-red-600 text-white"
                                            : "bg-red-100 text-red-700 hover:bg-red-200"
                                    }`}
                                >
                                    Not Submitted
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Sort size="18" className="text-gray-500" />
                            <span className="text-sm text-gray-500">
                                Sort by:
                            </span>
                            <select
                                className="text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                                onChange={handleSortChange}
                                value={`${filters.sort_by}-${filters.sort_order}`}
                            >
                                <option value="student_name-asc">
                                    Student Name (A-Z)
                                </option>
                                <option value="student_name-desc">
                                    Student Name (Z-A)
                                </option>
                                <option value="submitted_at-desc">
                                    Submission Date (Newest)
                                </option>
                                <option value="submitted_at-asc">
                                    Submission Date (Oldest)
                                </option>
                                <option value="grade-desc">
                                    Grade (Highest)
                                </option>
                                <option value="grade-asc">
                                    Grade (Lowest)
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
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
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Grade
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions && submissions.length > 0 ? (
                                    submissions.map((submission) => (
                                        <tr
                                            key={
                                                submission.id ||
                                                `student-${submission.student.id}`
                                            }
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {submission.student.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {submission.student.nisn}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                                                        submission.status
                                                    )}`}
                                                >
                                                    {getStatusText(
                                                        submission.status
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {submission.submitted_at ? (
                                                    <div className="text-sm text-gray-500">
                                                        {
                                                            submission.submitted_at
                                                        }
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400">
                                                        -
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {submission.grade !== null ? (
                                                    <div className="text-sm font-medium">
                                                        {submission.grade}/100
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400">
                                                        -
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {submission.status ===
                                                "not_submitted" ? (
                                                    <span className="text-gray-400">
                                                        -
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={route(
                                                            "teacher.submissions.show",
                                                            submission.id
                                                        )}
                                                        className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                    >
                                                        <MessageEdit
                                                            size="16"
                                                            className="mr-1"
                                                        />
                                                        {submission.status ===
                                                        "graded"
                                                            ? "View"
                                                            : "Grade"}
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No submissions found matching your
                                            filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                                                onClick={() => goToPage(number)}
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

                    {/* Info Box */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mt-0.5">
                                    <InfoCircle
                                        size="20"
                                        className="text-blue-600"
                                    />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Grading Tips
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <ul className="list-disc space-y-1 pl-5">
                                            <li>
                                                Click the "
                                                {filterStatus !== "graded"
                                                    ? "Grade"
                                                    : "View"}
                                                " button to review and grade a
                                                student's submission.
                                            </li>
                                            <li>
                                                You can provide a grade (0-100)
                                                and feedback for each
                                                submission.
                                            </li>
                                            <li>
                                                Students will be notified when
                                                their submission is graded.
                                            </li>
                                            <li>
                                                Use the filters above to view
                                                submissions by status.
                                            </li>
                                            <li>
                                                You can export all submission
                                                data to CSV for your records.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherSubmissionIndex;
