import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Edit2,
    Trash,
    Eye,
    SearchNormal1,
    Add,
    ArrowUp,
    ArrowDown,
    Calendar,
    TickCircle,
} from "iconsax-reactjs";

const SemesterIndex = ({ semesters, pagination, filters, flash }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [sortConfig, setSortConfig] = useState({
        field: filters?.sort_by || "start_date",
        order: filters?.sort_order || "desc",
    });

    // Fungsi untuk menghapus semester
    const handleDelete = (semesterId) => {
        if (confirm("Apakah Anda yakin ingin menghapus semester ini?")) {
            setProcessing(true);

            router.delete(route("admin.semesters.destroy", semesterId), {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                    alert("Terjadi kesalahan saat menghapus semester.");
                },
            });
        }
    };

    // Fungsi untuk mengatur semester sebagai aktif
    const handleSetActive = (semesterId) => {
        if (
            confirm(
                "Apakah Anda yakin ingin mengatur semester ini sebagai aktif?"
            )
        ) {
            setProcessing(true);

            router.post(
                route("admin.semesters.set-active", semesterId),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(false);
                    },
                    onError: () => {
                        setProcessing(false);
                        alert(
                            "Terjadi kesalahan saat mengatur semester sebagai aktif."
                        );
                    },
                }
            );
        }
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
            route("admin.semesters.index"),
            {
                page: page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: sortConfig.field,
                sort_order: sortConfig.order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["semesters", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("admin.semesters.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: sortConfig.field,
                sort_order: sortConfig.order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["semesters", "pagination", "filters"],
            }
        );
    };

    // Handle sort
    const handleSort = (field) => {
        const newOrder =
            sortConfig.field === field && sortConfig.order === "asc"
                ? "desc"
                : "asc";

        setSortConfig({
            field,
            order: newOrder,
        });

        router.get(
            route("admin.semesters.index"),
            {
                search: searchTerm,
                page: currentPage,
                per_page: pagination.per_page,
                sort_by: field,
                sort_order: newOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["semesters", "pagination", "filters"],
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

    return (
        <AuthenticatedLayout title="Semester Management">
            {/* Flash message */}
            {flash?.success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-lg"
                    role="alert"
                >
                    <p>{flash.success}</p>
                </div>
            )}

            {flash?.error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg"
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
                            All Semesters
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
                                    placeholder="Search by Name"
                                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64 placeholder:text-sm"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <button type="submit" className="hidden">
                                    Search
                                </button>
                            </form>

                            {/* Add button */}
                            <Link
                                href={route("admin.semesters.create")}
                                className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                            >
                                <Add size="20" className="text-amber-700" />
                            </Link>
                        </div>
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
                                        <div className="flex items-center space-x-1">
                                            <span>Semester Name</span>
                                            {sortConfig.field === "name" &&
                                                (sortConfig.order === "asc" ? (
                                                    <ArrowUp
                                                        size="14"
                                                        className="text-amber-500"
                                                    />
                                                ) : (
                                                    <ArrowDown
                                                        size="14"
                                                        className="text-amber-500"
                                                    />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort("start_date")}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>Start Date</span>
                                            {sortConfig.field ===
                                                "start_date" &&
                                                (sortConfig.order === "asc" ? (
                                                    <ArrowUp
                                                        size="14"
                                                        className="text-amber-500"
                                                    />
                                                ) : (
                                                    <ArrowDown
                                                        size="14"
                                                        className="text-amber-500"
                                                    />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort("end_date")}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>End Date</span>
                                            {sortConfig.field === "end_date" &&
                                                (sortConfig.order === "asc" ? (
                                                    <ArrowUp
                                                        size="14"
                                                        className="text-amber-500"
                                                    />
                                                ) : (
                                                    <ArrowDown
                                                        size="14"
                                                        className="text-amber-500"
                                                    />
                                                ))}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {semesters && semesters.length > 0 ? (
                                    semesters.map((semester) => (
                                        <tr
                                            key={semester.id}
                                            className={
                                                semester.is_active
                                                    ? "bg-amber-50"
                                                    : "hover:bg-gray-50"
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {semester.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Calendar
                                                        size="16"
                                                        className="mr-2 text-gray-500"
                                                    />
                                                    {
                                                        semester.formatted_start_date
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Calendar
                                                        size="16"
                                                        className="mr-2 text-gray-500"
                                                    />
                                                    {
                                                        semester.formatted_end_date
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        semester.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {semester.status ===
                                                    "active"
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {semester.student_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center space-x-3">
                                                    <Link
                                                        href={route(
                                                            "admin.semesters.show",
                                                            semester.id
                                                        )}
                                                        className="text-gray-500 hover:text-gray-700"
                                                        title="View Details"
                                                    >
                                                        <Eye size="18" />
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            "admin.semesters.edit",
                                                            semester.id
                                                        )}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        title="Edit Semester"
                                                    >
                                                        <Edit2 size="18" />
                                                    </Link>
                                                    {!semester.is_active && (
                                                        <button
                                                            onClick={() =>
                                                                handleSetActive(
                                                                    semester.id
                                                                )
                                                            }
                                                            className="text-green-500 hover:text-green-700"
                                                            disabled={
                                                                processing
                                                            }
                                                            title="Set as Active"
                                                        >
                                                            <TickCircle size="18" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                semester.id
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                        disabled={
                                                            processing ||
                                                            semester.is_active ||
                                                            semester.student_count >
                                                                0
                                                        }
                                                        title={
                                                            semester.is_active
                                                                ? "Cannot delete active semester"
                                                                : semester.student_count >
                                                                  0
                                                                ? "Cannot delete semester with students"
                                                                : "Delete Semester"
                                                        }
                                                    >
                                                        <Trash
                                                            size="18"
                                                            className={
                                                                semester.is_active ||
                                                                semester.student_count >
                                                                    0
                                                                    ? "opacity-50 cursor-not-allowed"
                                                                    : ""
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No semesters found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="flex items-center text-sm text-gray-500">
                                <span>
                                    Showing {pagination.from} to {pagination.to}{" "}
                                    of {pagination.total} semesters
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
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
                                                        goToPage(number)
                                                    }
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        number === currentPage
                                                            ? "z-10 bg-amber-50 border-amber-500 text-amber-600"
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
                                    disabled={
                                        currentPage === pagination.last_page
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default SemesterIndex;
