import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    NotificationBing,
    SearchNormal1,
    Filter,
    Setting4,
    ClipboardText,
    DocumentText,
    Information,
    Chart,
    Clock,
    TickCircle,
    CloseCircle,
    ArrowDown2,
    ArrowUp2,
    ArrowRight2,
} from "iconsax-reactjs";

const StudentNotificationIndex = ({
    notifications,
    pagination,
    filters,
    counts,
    flash,
}) => {
    const [filterType, setFilterType] = useState(filters?.filter_type || "all");
    const [filterRead, setFilterRead] = useState(filters?.filter_read || "all");
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Function to get notification type icon
    const getNotificationIcon = (type, size = "20") => {
        switch (type) {
            case "assignment":
                return <ClipboardText size={size} className="text-blue-600" />;
            case "material":
                return <DocumentText size={size} className="text-green-600" />;
            case "grade":
                return <Chart size={size} className="text-purple-600" />;
            case "system":
            default:
                return <Information size={size} className="text-gray-600" />;
        }
    };

    // Function to get notification type color
    const getNotificationTypeColor = (type) => {
        switch (type) {
            case "assignment":
                return "bg-blue-100 text-blue-800";
            case "material":
                return "bg-green-100 text-green-800";
            case "grade":
                return "bg-purple-100 text-purple-800";
            case "system":
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Function to apply filters
    const applyFilters = () => {
        router.get(
            route("student.notifications.index"),
            {
                filter_type: filterType,
                filter_read: filterRead,
                page: 1, // Reset to page 1 when filtering
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["notifications", "pagination", "filters", "counts"],
            }
        );
    };

    // Navigate to specific page
    const goToPage = (page) => {
        router.get(
            route("student.notifications.index"),
            {
                page: page,
                filter_type: filterType,
                filter_read: filterRead,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["notifications", "pagination"],
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

    // Handle select all change
    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(
                notifications.map((notification) => notification.id)
            );
        }
        setSelectAll(!selectAll);
    };

    // Handle single notification selection
    const handleNotificationSelect = (id) => {
        if (selectedNotifications.includes(id)) {
            setSelectedNotifications(
                selectedNotifications.filter(
                    (notificationId) => notificationId !== id
                )
            );
        } else {
            setSelectedNotifications([...selectedNotifications, id]);
        }
    };

    // Mark selected notifications as read
    const markSelectedAsRead = () => {
        if (selectedNotifications.length === 0) return;

        router.post(
            route("student.notifications.mark-read"),
            {
                notification_ids: selectedNotifications,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedNotifications([]);
                    setSelectAll(false);
                },
            }
        );
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        router.post(
            route("student.notifications.mark-read"),
            {
                mark_all: true,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedNotifications([]);
                    setSelectAll(false);
                },
            }
        );
    };

    // Delete notification
    const deleteNotification = (id) => {
        if (!confirm("Are you sure you want to delete this notification?"))
            return;

        router.delete(route("student.notifications.destroy", id), {
            preserveScroll: true,
        });
    };

    return (
        <StudentLayout title="Notifications">
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

            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="px-6 py-5 border-b flex items-center justify-between">
                        <h1 className="font-bold text-xl text-gray-800 flex items-center">
                            <NotificationBing
                                size="28"
                                className="text-blue-600 mr-2"
                            />
                            Notifications
                        </h1>
                        <div className="flex items-center space-x-2">
                            {/* Notification Actions */}
                            <div className="flex items-center gap-2">
                                {selectedNotifications.length > 0 && (
                                    <button
                                        onClick={markSelectedAsRead}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <TickCircle size="16" />
                                        <span>Mark Selected as Read</span>
                                    </button>
                                )}

                                {counts.unread > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <TickCircle size="16" />
                                        <span>Mark All as Read</span>
                                    </button>
                                )}
                            </div>

                            {/* Filter button */}
                            <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                                <Filter size="20" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => {
                                        setFilterType("all");
                                        router.get(
                                            route(
                                                "student.notifications.index"
                                            ),
                                            {
                                                filter_type: "all",
                                                filter_read: filterRead,
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: [
                                                    "notifications",
                                                    "pagination",
                                                    "filters",
                                                    "counts",
                                                ],
                                            }
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm ${
                                        filterType === "all"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    All ({counts.all})
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterType("assignment");
                                        router.get(
                                            route(
                                                "student.notifications.index"
                                            ),
                                            {
                                                filter_type: "assignment",
                                                filter_read: filterRead,
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: [
                                                    "notifications",
                                                    "pagination",
                                                    "filters",
                                                    "counts",
                                                ],
                                            }
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${
                                        filterType === "assignment"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <ClipboardText size="16" />
                                    <span>
                                        Assignments ({counts.assignment})
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterType("material");
                                        router.get(
                                            route(
                                                "student.notifications.index"
                                            ),
                                            {
                                                filter_type: "material",
                                                filter_read: filterRead,
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: [
                                                    "notifications",
                                                    "pagination",
                                                    "filters",
                                                    "counts",
                                                ],
                                            }
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${
                                        filterType === "material"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <DocumentText size="16" />
                                    <span>Materials ({counts.material})</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterType("grade");
                                        router.get(
                                            route(
                                                "student.notifications.index"
                                            ),
                                            {
                                                filter_type: "grade",
                                                filter_read: filterRead,
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: [
                                                    "notifications",
                                                    "pagination",
                                                    "filters",
                                                    "counts",
                                                ],
                                            }
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${
                                        filterType === "grade"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <Chart size="16" />
                                    <span>Grades ({counts.grade})</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterType("system");
                                        router.get(
                                            route(
                                                "student.notifications.index"
                                            ),
                                            {
                                                filter_type: "system",
                                                filter_read: filterRead,
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: [
                                                    "notifications",
                                                    "pagination",
                                                    "filters",
                                                    "counts",
                                                ],
                                            }
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${
                                        filterType === "system"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <Information size="16" />
                                    <span>System ({counts.system})</span>
                                </button>
                            </div>

                            <div className="ml-auto flex space-x-1">
                                <button
                                    onClick={() => {
                                        setFilterRead("all");
                                        router.get(
                                            route(
                                                "student.notifications.index"
                                            ),
                                            {
                                                filter_type: filterType,
                                                filter_read: "all",
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: [
                                                    "notifications",
                                                    "pagination",
                                                    "filters",
                                                    "counts",
                                                ],
                                            }
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm ${
                                        filterRead === "all"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterRead("unread");
                                        router.get(
                                            route(
                                                "student.notifications.index"
                                            ),
                                            {
                                                filter_type: filterType,
                                                filter_read: "unread",
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: [
                                                    "notifications",
                                                    "pagination",
                                                    "filters",
                                                    "counts",
                                                ],
                                            }
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm ${
                                        filterRead === "unread"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    Unread ({counts.unread})
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterRead("read");
                                        router.get(
                                            route(
                                                "student.notifications.index"
                                            ),
                                            {
                                                filter_type: filterType,
                                                filter_read: "read",
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                only: [
                                                    "notifications",
                                                    "pagination",
                                                    "filters",
                                                    "counts",
                                                ],
                                            }
                                        );
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-sm ${
                                        filterRead === "read"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    Read
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="px-6 py-2">
                        {notifications && notifications.length > 0 ? (
                            <div>
                                <div className="flex items-center mb-2 px-2 py-3">
                                    <div className="w-6 mr-3">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            checked={selectAll}
                                            onChange={handleSelectAllChange}
                                        />
                                    </div>
                                    <div className="flex-1 text-sm font-medium text-gray-500">
                                        {selectedNotifications.length > 0 ? (
                                            <span>
                                                {selectedNotifications.length}{" "}
                                                selected
                                            </span>
                                        ) : (
                                            <span>Select All</span>
                                        )}
                                    </div>
                                </div>

                                <div className="divide-y">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`flex items-start px-2 py-4 ${
                                                !notification.is_read
                                                    ? "bg-blue-50"
                                                    : ""
                                            } hover:bg-gray-50 transition-colors`}
                                        >
                                            <div className="w-6 mt-1 mr-3">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    checked={selectedNotifications.includes(
                                                        notification.id
                                                    )}
                                                    onChange={() =>
                                                        handleNotificationSelect(
                                                            notification.id
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div
                                                className={`p-2 rounded-full ${
                                                    notification.type ===
                                                    "assignment"
                                                        ? "bg-blue-100"
                                                        : notification.type ===
                                                          "material"
                                                        ? "bg-green-100"
                                                        : notification.type ===
                                                          "grade"
                                                        ? "bg-purple-100"
                                                        : "bg-gray-100"
                                                }`}
                                            >
                                                {getNotificationIcon(
                                                    notification.type
                                                )}
                                            </div>

                                            <div className="ml-3 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        {notification.redirect_url ? (
                                                            <Link
                                                                href={
                                                                    notification.redirect_url
                                                                }
                                                                className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                                            >
                                                                {
                                                                    notification.title
                                                                }
                                                            </Link>
                                                        ) : (
                                                            <p className="font-medium text-gray-900">
                                                                {
                                                                    notification.title
                                                                }
                                                            </p>
                                                        )}

                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {
                                                                notification.content
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-end ml-4">
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${getNotificationTypeColor(
                                                                notification.type
                                                            )}`}
                                                        >
                                                            {notification.type ===
                                                            "assignment"
                                                                ? "Assignment"
                                                                : notification.type ===
                                                                  "material"
                                                                ? "Material"
                                                                : notification.type ===
                                                                  "grade"
                                                                ? "Grade"
                                                                : "System"}
                                                        </span>

                                                        <span className="text-xs text-gray-500 mt-1">
                                                            {
                                                                notification.created_at
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex justify-end space-x-2">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => {
                                                                router.post(
                                                                    route(
                                                                        "student.notifications.mark-read"
                                                                    ),
                                                                    {
                                                                        notification_ids:
                                                                            [
                                                                                notification.id,
                                                                            ],
                                                                    },
                                                                    {
                                                                        preserveScroll: true,
                                                                    }
                                                                );
                                                            }}
                                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                        >
                                                            <TickCircle size="14" />
                                                            <span>
                                                                Mark as Read
                                                            </span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() =>
                                                            deleteNotification(
                                                                notification.id
                                                            )
                                                        }
                                                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                                                    >
                                                        <CloseCircle size="14" />
                                                        <span>Delete</span>
                                                    </button>

                                                    {notification.redirect_url && (
                                                        <Link
                                                            href={
                                                                notification.redirect_url
                                                            }
                                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                        >
                                                            <ArrowRight2 size="14" />
                                                            <span>View</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <NotificationBing
                                    size="48"
                                    className="mx-auto text-gray-300 mb-3"
                                />
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    Tidak ada notifikasi
                                </h3>
                                <p className="text-gray-500">
                                    {filterType !== "all" ||
                                    filterRead !== "all"
                                        ? "Coba ubah filter untuk melihat notifikasi lainnya"
                                        : "Anda belum memiliki notifikasi saat ini"}
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
                                Sebelumnya
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
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentNotificationIndex;
