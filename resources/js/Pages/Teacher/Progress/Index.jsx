import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    SearchNormal1,
    Filter,
    ArrowDown,
    ArrowUp,
    ChartSuccess,
    ClipboardTick,
    TrendUp,
    Eye,
    People,
    Setting4,
} from "iconsax-reactjs";

const TeacherProgressIndex = ({
    students,
    subjects,
    classes,
    current_class_id,
    pagination,
    filters,
    flash,
}) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [sortBy, setSortBy] = useState(filters?.sort_by || "name");
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || "asc");

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
            route("teacher.progress.index"),
            {
                page: page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_class: filters.filter_class,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["students", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("teacher.progress.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_class: filters.filter_class,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["students", "pagination", "filters"],
            }
        );
    };

    // Handle class filter change
    const handleClassFilter = (classId) => {
        router.get(
            route("teacher.progress.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when filtering
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_class: classId,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Handle sort change
    const handleSort = (column) => {
        const newSortOrder =
            sortBy === column && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(column);
        setSortOrder(newSortOrder);

        router.get(
            route("teacher.progress.index"),
            {
                search: searchTerm,
                page: currentPage,
                per_page: pagination.per_page,
                sort_by: column,
                sort_order: newSortOrder,
                filter_class: filters.filter_class,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["students", "pagination", "filters"],
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

    // Generate page numbers
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

    // Get progress color based on rate
    const getProgressColor = (rate) => {
        if (rate >= 90) return "bg-green-500";
        if (rate >= 75) return "bg-blue-500";
        if (rate >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    // Get grade color based on grade
    const getGradeColor = (grade) => {
        if (grade >= 90) return "text-green-600";
        if (grade >= 75) return "text-blue-600";
        if (grade >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    // Simplify subject access with safe navigation
    const getSubjectLink = () => {
        if (!filters.filter_class) return null;

        // Direct link using filter_class as a fallback
        return (
            <Link
                href={`/teacher/progress/subject/${filters.filter_class}`}
                className="text-purple-600 hover:text-purple-900 inline-block"
                title="View Subject Progress"
            >
                <ClipboardTick size="20" />
            </Link>
        );
    };

    return (
        <TeacherLayout title="Student Progress">
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
                        <h1 className="font-bold text-xl text-gray-800">
                            Student Progress Tracker
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
                                    placeholder="Search students"
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
                            <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                                <Setting4
                                    color="currentColor"
                                    variant="Bold"
                                    size="24"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Class filter */}
                    <div className="px-6 py-3 bg-gray-50 border-b flex items-center space-x-2 overflow-x-auto">
                        <span className="text-sm text-gray-600">Class:</span>
                        <button
                            onClick={() => handleClassFilter(null)}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filters.filter_class === null
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            All Classes
                        </button>
                        {classes &&
                            classes.length > 0 &&
                            classes.map((classItem) => (
                                <button
                                    key={classItem.id}
                                    onClick={() =>
                                        handleClassFilter(classItem.id)
                                    }
                                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                                        parseInt(filters.filter_class) ===
                                        classItem.id
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {classItem.name}
                                </button>
                            ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort("name")}
                                    >
                                        <div className="flex items-center">
                                            <span>Student Name</span>
                                            {sortBy === "name" &&
                                                (sortOrder === "asc" ? (
                                                    <ArrowUp
                                                        size="14"
                                                        className="ml-1"
                                                    />
                                                ) : (
                                                    <ArrowDown
                                                        size="14"
                                                        className="ml-1"
                                                    />
                                                ))}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NISN
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort("class_name")}
                                    >
                                        <div className="flex items-center">
                                            <span>Class</span>
                                            {sortBy === "class_name" &&
                                                (sortOrder === "asc" ? (
                                                    <ArrowUp
                                                        size="14"
                                                        className="ml-1"
                                                    />
                                                ) : (
                                                    <ArrowDown
                                                        size="14"
                                                        className="ml-1"
                                                    />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() =>
                                            handleSort("assignment_completion")
                                        }
                                    >
                                        <div className="flex items-center">
                                            <span>Assignment Completion</span>
                                            {sortBy ===
                                                "assignment_completion" &&
                                                (sortOrder === "asc" ? (
                                                    <ArrowUp
                                                        size="14"
                                                        className="ml-1"
                                                    />
                                                ) : (
                                                    <ArrowDown
                                                        size="14"
                                                        className="ml-1"
                                                    />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() =>
                                            handleSort("average_grade")
                                        }
                                    >
                                        <div className="flex items-center">
                                            <span>Average Grade</span>
                                            {sortBy === "average_grade" &&
                                                (sortOrder === "asc" ? (
                                                    <ArrowUp
                                                        size="14"
                                                        className="ml-1"
                                                    />
                                                ) : (
                                                    <ArrowDown
                                                        size="14"
                                                        className="ml-1"
                                                    />
                                                ))}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students && students.length > 0 ? (
                                    students.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.nisn}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.class_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm text-gray-500">
                                                            {
                                                                student.submitted_assignments
                                                            }
                                                            /
                                                            {
                                                                student.total_assignments
                                                            }{" "}
                                                            tasks
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {
                                                                student.completion_rate
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`${getProgressColor(
                                                                student.completion_rate
                                                            )} h-2 rounded-full`}
                                                            style={{
                                                                width: `${student.completion_rate}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {student.average_grade > 0 ? (
                                                    <div className="flex items-center">
                                                        <ChartSuccess
                                                            size="20"
                                                            className={`${getGradeColor(
                                                                student.average_grade
                                                            )} mr-2`}
                                                        />
                                                        <span
                                                            className={`text-lg font-bold ${getGradeColor(
                                                                student.average_grade
                                                            )}`}
                                                        >
                                                            {
                                                                student.average_grade
                                                            }
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">
                                                        No grades yet
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Link
                                                    href={route(
                                                        "teacher.progress.student",
                                                        student.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900 inline-block"
                                                    title="View Student Progress"
                                                >
                                                    <Eye size="20" />
                                                </Link>

                                                {/* Simple subject progress link using helper function */}
                                                {getSubjectLink()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No students found
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
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherProgressIndex;
