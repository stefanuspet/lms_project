import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    ClipboardText,
    SearchNormal1,
    Filter,
    Setting4,
    Clock,
    Calendar,
    Timer1,
    CloseCircle,
    TickCircle,
    DocumentText,
    ArrowRight2,
    Book1,
} from "iconsax-reactjs";

const StudentAssignmentIndex = ({ assignments, filters, subjects, counts }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [subjectFilter, setSubjectFilter] = useState(
        filters?.subject_id || ""
    );
    const [statusFilter, setStatusFilter] = useState(
        filters?.filter_status || "all"
    );
    const [sortBy, setSortBy] = useState(filters?.sort_by || "deadline");
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || "asc");
    const [showFilters, setShowFilters] = useState(false);

    // Function to apply filters
    const applyFilters = () => {
        router.get(
            route("student.assignments.index"),
            {
                search: searchTerm || null,
                subject_id: subjectFilter || null,
                filter_status: statusFilter,
                sort_by: sortBy,
                sort_order: sortOrder,
                page: 1, // Reset to page 1 when filtering
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["assignments", "filters", "counts"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    // Function to get status badge color
    const getStatusColor = (status, isLate = false) => {
        if (status === "graded") {
            return "bg-green-100 text-green-800";
        } else if (status === "submitted") {
            return isLate
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800";
        } else {
            return "bg-red-100 text-red-800";
        }
    };

    // Function to get status icon
    const getStatusIcon = (status, isLate = false, size = "16") => {
        if (status === "graded") {
            return <TickCircle size={size} className="text-green-600" />;
        } else if (status === "submitted") {
            return isLate ? (
                <Clock size={size} className="text-yellow-600" />
            ) : (
                <TickCircle size={size} className="text-blue-600" />
            );
        } else {
            return <CloseCircle size={size} className="text-red-600" />;
        }
    };

    // Function to get days remaining text and color
    const getDaysRemainingText = (daysRemaining) => {
        if (daysRemaining > 7) {
            return {
                text: `${daysRemaining} days left`,
                color: "text-green-600",
            };
        } else if (daysRemaining > 3) {
            return {
                text: `${daysRemaining} days left`,
                color: "text-blue-600",
            };
        } else if (daysRemaining > 1) {
            return {
                text: `${daysRemaining} days left`,
                color: "text-yellow-600",
            };
        } else if (daysRemaining === 1) {
            return {
                text: "Due tomorrow",
                color: "text-orange-600",
            };
        } else if (daysRemaining === 0) {
            return {
                text: "Due today",
                color: "text-red-600",
            };
        } else {
            return {
                text: `${Math.abs(daysRemaining)} days overdue`,
                color: "text-red-600",
            };
        }
    };

    return (
        <StudentLayout title="My Assignments">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <h1 className="font-bold text-xl text-gray-800 flex items-center">
                            <ClipboardText
                                size="28"
                                className="text-blue-600 mr-2"
                            />
                            My Assignments
                        </h1>
                        <div className="flex items-center space-x-2">
                            {/* Search box */}
                            <form onSubmit={handleSearch} className="relative">
                                <SearchNormal1
                                    size="20"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search assignments"
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
                                        Filter by Subject
                                    </label>
                                    <select
                                        value={subjectFilter}
                                        onChange={(e) =>
                                            setSubjectFilter(e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map((subject) => (
                                            <option
                                                key={subject.id}
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
                                        <option value="pending">Pending</option>
                                        <option value="submitted">
                                            Submitted
                                        </option>
                                        <option value="graded">Graded</option>
                                    </select>
                                </div>

                                <div className="w-64">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sort By
                                    </label>
                                    <div className="flex">
                                        <select
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(e.target.value)
                                            }
                                            className="w-full rounded-l-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="deadline">
                                                Deadline
                                            </option>
                                            <option value="title">Title</option>
                                            <option value="subject">
                                                Subject
                                            </option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSortOrder(
                                                    sortOrder === "asc"
                                                        ? "desc"
                                                        : "asc"
                                                )
                                            }
                                            className="px-3 bg-gray-100 border-t border-r border-b border-gray-300 rounded-r-md"
                                        >
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </button>
                                    </div>
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
                                            setSearchTerm("");
                                            setSubjectFilter("");
                                            setStatusFilter("all");
                                            setSortBy("deadline");
                                            setSortOrder("asc");

                                            router.get(
                                                route(
                                                    "student.assignments.index"
                                                ),
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    only: [
                                                        "assignments",
                                                        "filters",
                                                        "counts",
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

                    {/* Status Tabs */}
                    <div className="px-6 py-3 border-b bg-gray-50">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => {
                                    setStatusFilter("all");
                                    router.get(
                                        route("student.assignments.index"),
                                        {
                                            filter_status: "all",
                                            subject_id: subjectFilter || null,
                                            search: searchTerm || null,
                                            sort_by: sortBy,
                                            sort_order: sortOrder,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            only: [
                                                "assignments",
                                                "filters",
                                                "counts",
                                            ],
                                        }
                                    );
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    statusFilter === "all"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                All ({counts.all})
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter("pending");
                                    router.get(
                                        route("student.assignments.index"),
                                        {
                                            filter_status: "pending",
                                            subject_id: subjectFilter || null,
                                            search: searchTerm || null,
                                            sort_by: sortBy,
                                            sort_order: sortOrder,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            only: [
                                                "assignments",
                                                "filters",
                                                "counts",
                                            ],
                                        }
                                    );
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    statusFilter === "pending"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                Pending ({counts.pending})
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter("submitted");
                                    router.get(
                                        route("student.assignments.index"),
                                        {
                                            filter_status: "submitted",
                                            subject_id: subjectFilter || null,
                                            search: searchTerm || null,
                                            sort_by: sortBy,
                                            sort_order: sortOrder,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            only: [
                                                "assignments",
                                                "filters",
                                                "counts",
                                            ],
                                        }
                                    );
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    statusFilter === "submitted"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                Submitted ({counts.submitted})
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter("graded");
                                    router.get(
                                        route("student.assignments.index"),
                                        {
                                            filter_status: "graded",
                                            subject_id: subjectFilter || null,
                                            search: searchTerm || null,
                                            sort_by: sortBy,
                                            sort_order: sortOrder,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            only: [
                                                "assignments",
                                                "filters",
                                                "counts",
                                            ],
                                        }
                                    );
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    statusFilter === "graded"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                Graded ({counts.graded})
                            </button>
                        </div>
                    </div>

                    {/* Assignments List */}
                    <div className="p-6">
                        {assignments && assignments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assignments.map((assignment) => {
                                    const daysRemainingInfo =
                                        getDaysRemainingText(
                                            assignment.days_remaining
                                        );

                                    return (
                                        <div
                                            key={assignment.id}
                                            className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow transition-shadow"
                                        >
                                            <div className="h-2 bg-blue-500"></div>
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="bg-blue-50 p-2 rounded-lg">
                                                        <ClipboardText
                                                            size="20"
                                                            className="text-blue-600"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                                                assignment.status,
                                                                assignment.is_late
                                                            )}`}
                                                        >
                                                            {assignment.status ===
                                                            "graded"
                                                                ? "Graded"
                                                                : assignment.status ===
                                                                  "submitted"
                                                                ? assignment.is_late
                                                                    ? "Late Submission"
                                                                    : "Submitted"
                                                                : "Not Submitted"}
                                                        </span>
                                                        {assignment.status ===
                                                            "graded" && (
                                                            <span className="text-sm font-bold text-green-600 mt-1">
                                                                Grade:{" "}
                                                                {
                                                                    assignment
                                                                        .submission
                                                                        .grade
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={route(
                                                        "student.assignments.show",
                                                        assignment.id
                                                    )}
                                                    className="block"
                                                >
                                                    <h3 className="font-bold text-lg text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                                                        {assignment.title}
                                                    </h3>
                                                </Link>

                                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                                    <Book1
                                                        size="16"
                                                        className="mr-1"
                                                    />
                                                    <span>
                                                        {
                                                            assignment.subject_name
                                                        }
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                    {assignment.description ||
                                                        "No description provided."}
                                                </p>

                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center">
                                                        <Calendar
                                                            size="16"
                                                            className="mr-1"
                                                        />
                                                        <span>
                                                            Due:{" "}
                                                            {
                                                                assignment.formatted_deadline
                                                            }
                                                        </span>
                                                    </div>

                                                    {assignment.days_remaining >=
                                                        -7 &&
                                                        assignment.status !==
                                                            "graded" && (
                                                            <span
                                                                className={
                                                                    daysRemainingInfo.color
                                                                }
                                                            >
                                                                {
                                                                    daysRemainingInfo.text
                                                                }
                                                            </span>
                                                        )}
                                                </div>

                                                <div className="mt-auto pt-3 border-t flex items-center justify-between">
                                                    <Link
                                                        href={route(
                                                            "student.assignments.show",
                                                            assignment.id
                                                        )}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                                    >
                                                        View Details
                                                        <ArrowRight2 size="16" />
                                                    </Link>

                                                    {assignment.status ===
                                                        "pending" &&
                                                    assignment.days_remaining >=
                                                        0 ? (
                                                        <Link
                                                            href={route(
                                                                "student.assignments.submit",
                                                                assignment.id
                                                            )}
                                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            Submit
                                                        </Link>
                                                    ) : assignment.status ===
                                                      "submitted" ? (
                                                        <Link
                                                            href={route(
                                                                "student.submissions.show",
                                                                assignment
                                                                    .submission
                                                                    .id
                                                            )}
                                                            className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                                                        >
                                                            View Submission
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ClipboardText
                                    size="64"
                                    className="mx-auto text-gray-300 mb-4"
                                />
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    No Assignments Found
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    {searchTerm ||
                                    subjectFilter ||
                                    statusFilter !== "all"
                                        ? "Try adjusting your filters to see more assignments"
                                        : "There are no assignments assigned to you yet."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentAssignmentIndex;
