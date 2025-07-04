import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    SearchNormal1,
    Setting4,
    DocumentDownload,
    Timer1,
    Trash,
    InfoCircle,
    Profile2User,
    ArrowRight2,
    Calendar,
} from "iconsax-reactjs";

const ActivityLogIndex = ({
    logs,
    pagination,
    filters,
    filterOptions,
    flash,
}) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [showFilters, setShowFilters] = useState(false);
    const [filterUser, setFilterUser] = useState(filters?.filter_user || "");
    const [filterAction, setFilterAction] = useState(
        filters?.filter_action || ""
    );
    const [filterDateFrom, setFilterDateFrom] = useState(
        filters?.filter_date_from || ""
    );
    const [filterDateTo, setFilterDateTo] = useState(
        filters?.filter_date_to || ""
    );
    const [sortBy, setSortBy] = useState(filters?.sort_by || "created_at");
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || "desc");
    const [showClearModal, setShowClearModal] = useState(false);
    const [clearPeriod, setClearPeriod] = useState("month");

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
            route("admin.activity-logs.index"),
            {
                page: page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_user: filterUser,
                filter_action: filterAction,
                filter_date_from: filterDateFrom,
                filter_date_to: filterDateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["logs", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("admin.activity-logs.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_user: filterUser,
                filter_action: filterAction,
                filter_date_from: filterDateFrom,
                filter_date_to: filterDateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["logs", "pagination", "filters"],
            }
        );
    };

    // Handle filter application
    const applyFilters = () => {
        router.get(
            route("admin.activity-logs.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when filtering
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_user: filterUser,
                filter_action: filterAction,
                filter_date_from: filterDateFrom,
                filter_date_to: filterDateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["logs", "pagination", "filters"],
            }
        );
    };

    // Handle reset filters
    const resetFilters = () => {
        setFilterUser("");
        setFilterAction("");
        setFilterDateFrom("");
        setFilterDateTo("");
        setSortBy("created_at");
        setSortOrder("desc");

        router.get(
            route("admin.activity-logs.index"),
            {
                search: searchTerm,
                page: 1,
                per_page: pagination.per_page,
                sort_by: "created_at",
                sort_order: "desc",
                filter_user: "",
                filter_action: "",
                filter_date_from: "",
                filter_date_to: "",
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["logs", "pagination", "filters"],
            }
        );
    };

    // Handle export logs
    const handleExport = () => {
        router.post(route("admin.activity-logs.export"), {
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder,
            filter_user: filterUser,
            filter_action: filterAction,
            filter_date_from: filterDateFrom,
            filter_date_to: filterDateTo,
        });
    };

    // Handle clear logs
    const handleClearLogs = () => {
        router.post(
            route("admin.activity-logs.clear-old"),
            {
                period: clearPeriod,
            },
            {
                onSuccess: () => {
                    setShowClearModal(false);
                },
            }
        );
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

    // Function to get action badge color
    const getActionBadgeColor = (action) => {
        const actionColors = {
            create: "bg-green-100 text-green-800",
            update: "bg-blue-100 text-blue-800",
            delete: "bg-red-100 text-red-800",
            bulk_delete: "bg-red-100 text-red-800",
            login: "bg-purple-100 text-purple-800",
            logout: "bg-gray-100 text-gray-800",
            enroll: "bg-amber-100 text-amber-800",
            unenroll: "bg-amber-100 text-amber-800",
            clear_logs: "bg-red-100 text-red-800",
            export_logs: "bg-blue-100 text-blue-800",
            extend: "bg-green-100 text-green-800",
            close: "bg-red-100 text-red-800",
        };

        return actionColors[action] || "bg-gray-100 text-gray-800";
    };

    return (
        <AuthenticatedLayout title="Activity Logs">
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
                            Activity Logs
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
                                    placeholder="Search logs..."
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

                            {/* Export button */}
                            <button
                                onClick={handleExport}
                                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                title="Export Logs to CSV"
                            >
                                <DocumentDownload size="24" variant="Bold" />
                            </button>

                            {/* Clear logs button */}
                            <button
                                onClick={() => setShowClearModal(true)}
                                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                title="Clear Old Logs"
                            >
                                <Trash size="24" variant="Bold" />
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <h2 className="text-sm font-medium text-gray-700 mb-3">
                                Filters & Sorting
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        User
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={filterUser}
                                        onChange={(e) =>
                                            setFilterUser(e.target.value)
                                        }
                                    >
                                        <option value="">All Users</option>
                                        {filterOptions.users.map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}
                                            >
                                                {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Action
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={filterAction}
                                        onChange={(e) =>
                                            setFilterAction(e.target.value)
                                        }
                                    >
                                        <option value="">All Actions</option>
                                        {filterOptions.actions.map((action) => (
                                            <option key={action} value={action}>
                                                {action
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    action
                                                        .slice(1)
                                                        .replace("_", " ")}
                                            </option>
                                        ))}
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
                                        <option value="created_at">
                                            Date & Time
                                        </option>
                                        <option value="user_id">User</option>
                                        <option value="action">Action</option>
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
                                        <option value="desc">
                                            Newest First
                                        </option>
                                        <option value="asc">
                                            Oldest First
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Date From
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={filterDateFrom}
                                        onChange={(e) =>
                                            setFilterDateFrom(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Date To
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={filterDateTo}
                                        onChange={(e) =>
                                            setFilterDateTo(e.target.value)
                                        }
                                    />
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

                    {/* Logs Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        TIME
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs && logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                                        <Timer1
                                                            size="16"
                                                            className="mr-2 text-blue-500"
                                                        />
                                                        {log.created_at}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {log.created_at_diff}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {log.user ? (
                                                    <div className="flex items-center">
                                                        <Profile2User
                                                            size="16"
                                                            className="mr-2 text-gray-500"
                                                        />
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {log.user.email}
                                                            </div>
                                                            <div className="text-xs text-gray-500 capitalize">
                                                                {log.user.role}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        Unknown User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(
                                                        log.action
                                                    )}`}
                                                >
                                                    {log.action
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        log.action
                                                            .slice(1)
                                                            .replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-lg truncate">
                                                    {log.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.ip_address}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No activity logs found
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

            {/* Clear Logs Modal */}
            {showClearModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <InfoCircle
                                size="24"
                                className="text-red-500 mr-2"
                            />
                            Clear Activity Logs
                        </h3>

                        <div className="bg-red-50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-red-600">
                                Warning: This action cannot be undone. All logs
                                older than the selected period will be
                                permanently deleted.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="clearPeriod"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Clear logs older than:
                            </label>
                            <select
                                id="clearPeriod"
                                value={clearPeriod}
                                onChange={(e) => setClearPeriod(e.target.value)}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            >
                                <option value="week">1 Week</option>
                                <option value="month">1 Month</option>
                                <option value="year">1 Year</option>
                                <option value="all">All Logs</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowClearModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Clear Logs
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
};

export default ActivityLogIndex;
