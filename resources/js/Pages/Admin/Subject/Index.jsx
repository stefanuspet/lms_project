import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Edit2,
    Trash,
    Eye,
    SearchNormal1,
    Filter,
    Add,
    Setting4,
} from "iconsax-reactjs";

const SubjectIndex = ({
    subjects,
    pagination,
    filters,
    filterOptions,
    flash,
}) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [showFilters, setShowFilters] = useState(false);
    const [filterClass, setFilterClass] = useState(filters?.filter_class || "");
    const [filterTeacher, setFilterTeacher] = useState(
        filters?.filter_teacher || ""
    );
    const [sortBy, setSortBy] = useState(filters?.sort_by || "name");
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || "asc");

    // Function to delete subject
    const handleDelete = (subjectId) => {
        if (confirm("Are you sure you want to delete this subject?")) {
            setProcessing(true);

            router.delete(route("admin.subjects.destroy", subjectId), {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    setSelectedSubjects([]);
                },
                onError: () => {
                    setProcessing(false);
                    alert("Error occurred while deleting the subject.");
                },
            });
        }
    };

    // Function for page navigation
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
            route("admin.subjects.index"),
            {
                page: page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_class: filterClass,
                filter_teacher: filterTeacher,
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
            route("admin.subjects.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_class: filterClass,
                filter_teacher: filterTeacher,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["subjects", "pagination", "filters"],
            }
        );
    };

    // Handle filter application
    const applyFilters = () => {
        router.get(
            route("admin.subjects.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when filtering
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_class: filterClass,
                filter_teacher: filterTeacher,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["subjects", "pagination", "filters"],
            }
        );
    };

    // Handle reset filters
    const resetFilters = () => {
        setFilterClass("");
        setFilterTeacher("");
        setSortBy("name");
        setSortOrder("asc");

        router.get(
            route("admin.subjects.index"),
            {
                search: searchTerm,
                page: 1,
                per_page: pagination.per_page,
                sort_by: "name",
                sort_order: "asc",
                filter_class: "",
                filter_teacher: "",
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["subjects", "pagination", "filters"],
            }
        );
    };

    // Handle bulk selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = subjects.map((subject) => subject.id);
            setSelectedSubjects(allIds);
        } else {
            setSelectedSubjects([]);
        }
    };

    const handleSelectSubject = (e, subjectId) => {
        if (e.target.checked) {
            setSelectedSubjects([...selectedSubjects, subjectId]);
        } else {
            setSelectedSubjects(
                selectedSubjects.filter((id) => id !== subjectId)
            );
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedSubjects.length === 0) {
            alert("Please select at least one subject to delete");
            return;
        }

        if (
            confirm(
                `Are you sure you want to delete ${selectedSubjects.length} selected subjects?`
            )
        ) {
            setProcessing(true);

            router.post(
                route("admin.subjects.bulk-delete"),
                {
                    subject_ids: selectedSubjects,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(false);
                        setSelectedSubjects([]);
                    },
                    onError: (errors) => {
                        setProcessing(false);
                        alert(
                            errors.error || "Failed to delete selected subjects"
                        );
                    },
                }
            );
        }
    };

    // Function to generate page numbers
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
        <AuthenticatedLayout title="Subjects Management">
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
                            All Subjects List
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
                                    placeholder="Search by Subject Name"
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

                            {/* Settings button */}
                            <button
                                className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Setting4
                                    color="black"
                                    variant="Bold"
                                    size="24"
                                />
                            </button>

                            {/* Add button */}
                            <Link
                                href={route("admin.subjects.create")}
                                className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                            >
                                <Add color="black" size="24" />
                            </Link>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <h2 className="text-sm font-medium text-gray-700 mb-3">
                                Filters & Sorting
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Class
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={filterClass}
                                        onChange={(e) =>
                                            setFilterClass(e.target.value)
                                        }
                                    >
                                        <option value="">All Classes</option>
                                        {filterOptions.classes.map(
                                            (classItem) => (
                                                <option
                                                    key={classItem.id}
                                                    value={classItem.id}
                                                >
                                                    {classItem.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Teacher
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={filterTeacher}
                                        onChange={(e) =>
                                            setFilterTeacher(e.target.value)
                                        }
                                    >
                                        <option value="">All Teachers</option>
                                        {filterOptions.teachers.map(
                                            (teacher) => (
                                                <option
                                                    key={teacher.id}
                                                    value={teacher.id}
                                                >
                                                    {teacher.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Sort By
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(e.target.value)
                                        }
                                    >
                                        <option value="name">
                                            Subject Name
                                        </option>
                                        <option value="created_at">
                                            Date Created
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Sort Order
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={sortOrder}
                                        onChange={(e) =>
                                            setSortOrder(e.target.value)
                                        }
                                    >
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4 space-x-3">
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedSubjects.length > 0 && (
                        <div className="px-6 py-3 bg-blue-50 border-b flex justify-between items-center">
                            <div className="text-sm text-blue-600">
                                {selectedSubjects.length} subjects selected
                            </div>
                            <div>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-75 flex items-center space-x-1"
                                >
                                    <Trash size="16" />
                                    <span>Delete Selected</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subjects && subjects.length > 0 ? (
                                    subjects.map((subject) => (
                                        <tr
                                            key={subject.id}
                                            className={
                                                selectedSubjects.includes(
                                                    subject.id
                                                )
                                                    ? "bg-blue-50"
                                                    : "hover:bg-gray-50"
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    checked={selectedSubjects.includes(
                                                        subject.id
                                                    )}
                                                    onChange={(e) =>
                                                        handleSelectSubject(
                                                            e,
                                                            subject.id
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {subject.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {subject.class}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {subject.teacher}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 truncate overflow-hidden text-ellipsis max-w-[200px]">
                                                {subject.description || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <Link
                                                    href={route(
                                                        "admin.subjects.edit",
                                                        subject.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900 inline-block"
                                                >
                                                    <Edit2 size="20" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(subject.id)
                                                    }
                                                    className="text-red-600 hover:text-red-900 inline-block"
                                                    disabled={processing}
                                                >
                                                    <Trash size="20" />
                                                </button>
                                                <Link
                                                    href={route(
                                                        "admin.subjects.show",
                                                        subject.id
                                                    )}
                                                    className="text-gray-600 hover:text-gray-900 inline-block"
                                                >
                                                    <Eye size="20" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No subjects found
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
        </AuthenticatedLayout>
    );
};

export default SubjectIndex;
