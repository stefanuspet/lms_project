import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    NotificationBing,
    MessageEdit,
    ClipboardTick,
    Sms,
    DocumentText,
    TickCircle,
    CloseCircle,
    InfoCircle,
    Clock,
    Eye,
    ArrowRight,
    Trash,
    FilterSearch,
    TickSquare,
} from "iconsax-reactjs";

const TeacherNotificationIndex = ({
    notifications,
    unread_count,
    count_by_type,
    pagination,
    filters,
    flash,
}) => {
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle notification selection
    const handleSelectNotification = (id) => {
        if (selectedNotifications.includes(id)) {
            setSelectedNotifications(
                selectedNotifications.filter((notifId) => notifId !== id)
            );
        } else {
            setSelectedNotifications([...selectedNotifications, id]);
        }
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(
                notifications.map((notification) => notification.id)
            );
        }
        setSelectAll(!selectAll);
    };

    // Handle type filter change
    const handleFilterChange = (type) => {
        router.get(
            route("teacher.notifications.index"),
            {
                filter_type: type,
                page: 1,
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: false,
            }
        );
    };

    // Handle mark as read
    const handleMarkAsRead = () => {
        if (selectedNotifications.length === 0) return;

        setLoading(true);
        router.post(
            route("teacher.notifications.markAsRead"),
            {
                notification_ids: selectedNotifications,
                mark_all: false,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedNotifications([]);
                    setSelectAll(false);
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            }
        );
    };

    // Handle mark all as read
    const handleMarkAllAsRead = () => {
        setLoading(true);
        router.post(
            route("teacher.notifications.markAsRead"),
            {
                notification_ids: [],
                mark_all: true,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedNotifications([]);
                    setSelectAll(false);
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            }
        );
    };

    // Handle delete notification
    const handleDeleteNotification = (id) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus notifikasi ini?"
            )
        ) {
            router.delete(route("teacher.notifications.destroy", id), {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case "assignment":
                return <ClipboardTick size="20" className="text-blue-500" />;
            case "material":
                return <DocumentText size="20" className="text-green-500" />;
            case "grade":
                return <MessageEdit size="20" className="text-amber-500" />;
            case "system":
            default:
                return <Sms size="20" className="text-gray-500" />;
        }
    };

    // Function to navigate to a specific page
    const goToPage = (page) => {
        if (
            page < 1 ||
            page > pagination.last_page ||
            page === pagination.current_page
        ) {
            return;
        }

        router.get(
            route("teacher.notifications.index"),
            {
                page: page,
                per_page: pagination.per_page,
                filter_type: filters.filter_type,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["notifications", "pagination"],
            }
        );
    };

    // Generate pagination
    const generatePagination = () => {
        const items = [];
        const maxVisiblePages = 5;
        const totalPages = pagination.last_page;
        const currentPage = pagination.current_page;

        // Previous button
        items.push(
            <button
                key="prev"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="sr-only">Previous</span>
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
        );

        // Page numbers
        if (totalPages <= maxVisiblePages) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            i === currentPage
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            // Show limited pages with ellipsis
            const leftSide = Math.floor(maxVisiblePages / 2);
            const rightSide = maxVisiblePages - leftSide - 1;

            // Always show first page
            items.push(
                <button
                    key={1}
                    onClick={() => goToPage(1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        1 === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                    1
                </button>
            );

            // Calculate start and end of visible pages
            let startPage = Math.max(2, currentPage - leftSide);
            let endPage = Math.min(totalPages - 1, currentPage + rightSide);

            // Adjust if current page is near start or end
            if (currentPage - 1 <= leftSide) {
                endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
            } else if (totalPages - currentPage <= rightSide) {
                startPage = Math.max(2, totalPages - maxVisiblePages + 2);
            }

            // Add ellipsis if needed before start page
            if (startPage > 2) {
                items.push(
                    <span
                        key="ellipsis-1"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                        ...
                    </span>
                );
            }

            // Add pages between start and end
            for (let i = startPage; i <= endPage; i++) {
                items.push(
                    <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            i === currentPage
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                        {i}
                    </button>
                );
            }

            // Add ellipsis if needed after end page
            if (endPage < totalPages - 1) {
                items.push(
                    <span
                        key="ellipsis-2"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                        ...
                    </span>
                );
            }

            // Always show last page
            items.push(
                <button
                    key={totalPages}
                    onClick={() => goToPage(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        totalPages === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                    {totalPages}
                </button>
            );
        }

        // Next button
        items.push(
            <button
                key="next"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
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
        );

        return items;
    };

    return (
        <TeacherLayout title="Notifications">
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
                        <h1 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <NotificationBing
                                size="24"
                                className="text-blue-500"
                            />
                            <span>Notifications</span>
                            {unread_count > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    {unread_count} unread
                                </span>
                            )}
                        </h1>
                        <div className="flex items-center space-x-2">
                            {selectedNotifications.length > 0 && (
                                <button
                                    onClick={handleMarkAsRead}
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                                >
                                    <TickCircle size="18" />
                                    <span>Mark as Read</span>
                                </button>
                            )}
                            {unread_count > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                                >
                                    <TickSquare size="18" />
                                    <span>Mark All as Read</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="px-6 py-3 bg-gray-50 border-b flex items-center space-x-2 overflow-x-auto">
                        <button
                            onClick={() => handleFilterChange("all")}
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                filters.filter_type === "all"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <FilterSearch size="16" />
                            <span>All ({count_by_type.all})</span>
                        </button>
                        <button
                            onClick={() => handleFilterChange("unread")}
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                filters.filter_type === "unread"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <InfoCircle size="16" />
                            <span>Unread ({count_by_type.unread})</span>
                        </button>
                        <button
                            onClick={() => handleFilterChange("assignment")}
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                filters.filter_type === "assignment"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <ClipboardTick size="16" />
                            <span>
                                Assignments ({count_by_type.assignment})
                            </span>
                        </button>
                        <button
                            onClick={() => handleFilterChange("material")}
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                filters.filter_type === "material"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <DocumentText size="16" />
                            <span>Materials ({count_by_type.material})</span>
                        </button>
                        <button
                            onClick={() => handleFilterChange("grade")}
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                filters.filter_type === "grade"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <MessageEdit size="16" />
                            <span>Grades ({count_by_type.grade})</span>
                        </button>
                        <button
                            onClick={() => handleFilterChange("system")}
                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                filters.filter_type === "system"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <Sms size="16" />
                            <span>System ({count_by_type.system})</span>
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="divide-y divide-gray-200">
                        {notifications && notifications.length > 0 ? (
                            <>
                                {/* Select all header */}
                                <div className="px-6 py-3 flex items-center">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">
                                            Select All
                                        </label>
                                    </div>
                                </div>

                                {/* Notifications */}
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-6 py-4 hover:bg-gray-50 ${
                                            !notification.is_read
                                                ? "bg-blue-50"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5 mt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNotifications.includes(
                                                        notification.id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectNotification(
                                                            notification.id
                                                        )
                                                    }
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 mr-3">
                                                            {getNotificationIcon(
                                                                notification.type
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-medium text-gray-900">
                                                                {
                                                                    notification.title
                                                                }
                                                                {!notification.is_read && (
                                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {
                                                                    notification.content
                                                                }
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    notification.created_at
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2 ml-4">
                                                        {notification.related_id && (
                                                            <button
                                                                onClick={() => {
                                                                    // Handle view action based on notification type
                                                                    // This would be improved with actual route generation
                                                                    alert(
                                                                        "View details functionality"
                                                                    );
                                                                }}
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="Lihat Detail"
                                                            >
                                                                <Eye size="18" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteNotification(
                                                                    notification.id
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Hapus"
                                                        >
                                                            <Trash size="18" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <NotificationBing
                                    size="48"
                                    className="text-gray-300 mx-auto mb-2"
                                />
                                <p className="text-gray-500">
                                    Tidak ada notifikasi
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() =>
                                        goToPage(pagination.current_page - 1)
                                    }
                                    disabled={pagination.current_page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() =>
                                        goToPage(pagination.current_page + 1)
                                    }
                                    disabled={
                                        pagination.current_page ===
                                        pagination.last_page
                                    }
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Menampilkan{" "}
                                        <span className="font-medium">
                                            {pagination.from || 0}
                                        </span>{" "}
                                        sampai{" "}
                                        <span className="font-medium">
                                            {pagination.to || 0}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-medium">
                                            {pagination.total}
                                        </span>{" "}
                                        data
                                    </p>
                                </div>
                                <div>
                                    <nav
                                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                        aria-label="Pagination"
                                    >
                                        {generatePagination()}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherNotificationIndex;
