import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    Book1,
    DocumentText,
    SearchNormal1,
    Filter,
    ArrowDown2,
    ArrowUp2,
    Setting4,
    Folder,
    Document,
    VideoPlay,
    Image,
    DocumentCloud,
} from "iconsax-reactjs";

const StudentMaterialIndex = ({
    materials,
    pagination,
    filters,
    subjects,
    file_types,
    flash,
}) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [subjectFilter, setSubjectFilter] = useState(
        filters?.subject_id || ""
    );
    const [fileTypeFilter, setFileTypeFilter] = useState(
        filters?.file_type || ""
    );
    const [sortBy, setSortBy] = useState(filters?.sort_by || "created_at");
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || "desc");
    const [showFilters, setShowFilters] = useState(false);

    // File type icons
    const getFileIcon = (fileType, fileExtension) => {
        if (!fileType)
            return <DocumentText size="24" className="text-blue-600" />;

        const type = fileType.toLowerCase();
        const ext = fileExtension ? fileExtension.toLowerCase() : "";

        if (type.includes("pdf") || ext === "pdf") {
            return <Document size="24" className="text-red-600" />;
        } else if (
            type.includes("video") ||
            ["mp4", "avi", "mov", "wmv"].includes(ext)
        ) {
            return <VideoPlay size="24" className="text-purple-600" />;
        } else if (
            type.includes("image") ||
            ["jpg", "jpeg", "png", "gif"].includes(ext)
        ) {
            return <Image size="24" className="text-green-600" />;
        } else if (["doc", "docx", "odt"].includes(ext)) {
            return <Document size="24" className="text-blue-600" />;
        } else if (["xls", "xlsx", "csv"].includes(ext)) {
            return <Document size="24" className="text-green-600" />;
        } else if (["ppt", "pptx"].includes(ext)) {
            return <Document size="24" className="text-orange-600" />;
        } else {
            return <DocumentCloud size="24" className="text-gray-600" />;
        }
    };

    // Function to apply filters and sorting
    const applyFilters = () => {
        router.get(
            route("student.materials.index"),
            {
                search: searchTerm,
                subject_id: subjectFilter || null,
                file_type: fileTypeFilter || null,
                sort_by: sortBy,
                sort_order: sortOrder,
                page: 1, // Reset to page 1 when filtering
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["materials", "pagination", "filters"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    // Handle sorting
    const handleSort = (column) => {
        const newSortOrder =
            column === sortBy && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(column);
        setSortOrder(newSortOrder);

        router.get(
            route("student.materials.index"),
            {
                search: searchTerm,
                subject_id: subjectFilter || null,
                file_type: fileTypeFilter || null,
                sort_by: column,
                sort_order: newSortOrder,
                page: pagination.current_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["materials", "pagination", "filters"],
            }
        );
    };

    // Navigate to specific page
    const goToPage = (page) => {
        router.get(
            route("student.materials.index"),
            {
                page: page,
                search: searchTerm,
                subject_id: subjectFilter || null,
                file_type: fileTypeFilter || null,
                sort_by: sortBy,
                sort_order: sortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["materials", "pagination"],
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
        pagination?.current_page || 1,
        pagination?.last_page || 1
    );

    return (
        <StudentLayout title="Learning Materials">
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
                        <h1 className="font-bold text-xl text-gray-800 flex items-center">
                            <DocumentText
                                size="28"
                                className="text-blue-600 mr-2"
                            />
                            Learning Materials
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
                                    placeholder="Search materials"
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
                            <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                                <Setting4 size="24" />
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
                                        Filter by File Type
                                    </label>
                                    <select
                                        value={fileTypeFilter}
                                        onChange={(e) =>
                                            setFileTypeFilter(e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All File Types</option>
                                        {file_types.map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-64">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sort By
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(e.target.value)
                                            }
                                            className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="created_at">
                                                Date Added
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
                                            className="p-2 rounded-md bg-white border"
                                        >
                                            {sortOrder === "asc" ? (
                                                <ArrowUp2
                                                    size="16"
                                                    className="text-gray-600"
                                                />
                                            ) : (
                                                <ArrowDown2
                                                    size="16"
                                                    className="text-gray-600"
                                                />
                                            )}
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
                                            setFileTypeFilter("");
                                            setSortBy("created_at");
                                            setSortOrder("desc");

                                            router.get(
                                                route(
                                                    "student.materials.index"
                                                ),
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    only: [
                                                        "materials",
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

                    {/* Materials Grid */}
                    <div className="p-6">
                        {materials && materials.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {materials.map((material) => (
                                    <Link
                                        key={material.id}
                                        href={route(
                                            "student.materials.show",
                                            material.id
                                        )}
                                        className="group bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="h-2 bg-blue-500"></div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="bg-blue-100 p-2 rounded-lg">
                                                    {getFileIcon(
                                                        material.file_type,
                                                        material.file_extension
                                                    )}
                                                </div>
                                                <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                    {material.created_at}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                                {material.title}
                                            </h3>

                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                                                {material.content
                                                    ? material.content.length >
                                                      120
                                                        ? material.content.substring(
                                                              0,
                                                              120
                                                          ) + "..."
                                                        : material.content
                                                    : "No description available"}
                                            </p>

                                            <div className="mt-auto pt-3 border-t flex items-center justify-between">
                                                <span className="text-xs bg-blue-50 px-2 py-1 rounded text-blue-700">
                                                    {material.subject_name}
                                                </span>
                                                {material.has_file && (
                                                    <span className="text-xs bg-green-50 px-2 py-1 rounded text-green-700 flex items-center gap-1">
                                                        <DocumentCloud size="12" />
                                                        {material.file_type ||
                                                            "File"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Folder
                                    size="64"
                                    className="mx-auto text-gray-300 mb-4"
                                />
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    No Materials Found
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm ||
                                    subjectFilter ||
                                    fileTypeFilter
                                        ? "Try adjusting your filters or search query"
                                        : "No learning materials have been added yet for your classes"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <button
                                onClick={() =>
                                    goToPage(pagination.current_page - 1)
                                }
                                className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                disabled={pagination.current_page === 1}
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
                                                    number ===
                                                    pagination.current_page
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
                                onClick={() =>
                                    goToPage(pagination.current_page + 1)
                                }
                                className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                disabled={
                                    pagination.current_page ===
                                    pagination.last_page
                                }
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

export default StudentMaterialIndex;
