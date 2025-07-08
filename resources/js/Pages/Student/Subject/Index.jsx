import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import {
    SearchNormal1,
    Filter,
    Setting4,
    Book1,
    DocumentText,
    ClipboardText,
    TrendUp,
    Calendar,
} from "iconsax-reactjs";
import StudentLayout from "@/Layouts/StudentLayout";

const StudentSubjectIndex = ({ subjects, pagination, filters, flash }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );

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
            route("student.subjects.index"),
            {
                page: page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["subjects", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("student.subjects.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["subjects", "pagination", "filters"],
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
    console.log(subjects);

    return (
        <StudentLayout title="My Subjects">
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
                        <h1 className="font-bold text-xl text-gray-800">
                            My Subjects
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
                                    placeholder="Search subjects"
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
                            <button className="p-2 rounded-full bg-[#D6E4FF] text-blue-600 hover:bg-blue-200 transition-colors">
                                <Setting4
                                    color="blue"
                                    variant="Bold"
                                    size="24"
                                />
                            </button>
                            <button className="p-2 rounded-full bg-[#D6E4FF] text-blue-600 hover:bg-blue-200 transition-colors">
                                <Filter color="blue" variant="Bold" size="24" />
                            </button>
                        </div>
                    </div>

                    {/* Subject Cards */}
                    <div className="p-6">
                        {subjects && subjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subjects.map((subject) => (
                                    <Link
                                        key={subject.id}
                                        href={route(
                                            "student.subjects.show",
                                            subject.id
                                        )}
                                        className="block bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                    >
                                        <div className="h-3 bg-blue-500"></div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">
                                                {subject.name}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                                <span>
                                                    Teacher:{" "}
                                                    {subject.teacher_name}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {subject.description ||
                                                    "No description available."}
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <div className="bg-blue-50 p-2 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">
                                                            Materials
                                                        </span>
                                                        <span className="text-sm font-semibold text-blue-700">
                                                            {
                                                                subject.materials_count
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-green-50 p-2 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">
                                                            Assignments
                                                        </span>
                                                        <span className="text-sm font-semibold text-green-700">
                                                            {
                                                                subject.assignments_count
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1">
                                                    <DocumentText
                                                        size="16"
                                                        className="text-blue-600"
                                                    />
                                                    <span>
                                                        Browse Materials
                                                    </span>
                                                </div>

                                                {subject.pending_assignments >
                                                    0 && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                                        {
                                                            subject.pending_assignments
                                                        }{" "}
                                                        due
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Book1
                                    size="48"
                                    className="mx-auto text-gray-300"
                                />
                                <p className="mt-4 text-gray-500">
                                    No subjects found. Please contact your
                                    administrator if you believe this is an
                                    error.
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
        </StudentLayout>
    );
};

export default StudentSubjectIndex;
