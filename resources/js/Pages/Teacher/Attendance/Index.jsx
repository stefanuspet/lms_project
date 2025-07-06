import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    Eye,
    SearchNormal1,
    Setting4,
    Calendar,
    ClipboardTick,
    DocumentText,
    TickCircle,
    CloseCircle,
    Timer1,
    People,
    ChartSuccess,
} from "iconsax-reactjs";

const TeacherAttendanceIndex = ({ sessions, pagination, filters, flash }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [showFilters, setShowFilters] = useState(false);
    const [filterDateFrom, setFilterDateFrom] = useState(
        filters?.filter_date_from || ""
    );
    const [filterDateTo, setFilterDateTo] = useState(
        filters?.filter_date_to || ""
    );
    const [filterStatus, setFilterStatus] = useState(
        filters?.filter_status || ""
    );
    const [sortBy, setSortBy] = useState(filters?.sort_by || "date");
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || "desc");

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
            route("teacher.attendance.index"),
            {
                page: page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_date_from: filterDateFrom,
                filter_date_to: filterDateTo,
                filter_status: filterStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["sessions", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("teacher.attendance.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_date_from: filterDateFrom,
                filter_date_to: filterDateTo,
                filter_status: filterStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["sessions", "pagination", "filters"],
            }
        );
    };

    // Handle filter application
    const applyFilters = () => {
        router.get(
            route("teacher.attendance.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when filtering
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
                filter_date_from: filterDateFrom,
                filter_date_to: filterDateTo,
                filter_status: filterStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["sessions", "pagination", "filters"],
            }
        );
    };

    // Handle reset filters
    const resetFilters = () => {
        setFilterDateFrom("");
        setFilterDateTo("");
        setFilterStatus("");
        setSortBy("date");
        setSortOrder("desc");

        router.get(
            route("teacher.attendance.index"),
            {
                search: searchTerm,
                page: 1,
                per_page: pagination.per_page,
                sort_by: "date",
                sort_order: "desc",
                filter_date_from: "",
                filter_date_to: "",
                filter_status: "",
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["sessions", "pagination", "filters"],
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

    return (
        <TeacherLayout title="Sistem Absensi">
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
                            Daftar Sesi Absensi
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
                                    placeholder="Cari berdasarkan PIN atau judul"
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

                            {/* Quick links */}
                            <Link
                                href={route("teacher.attendance.daily")}
                                className="p-2 rounded-full bg-[#A6F4C5] text-green-600 hover:bg-green-200 transition-colors"
                                title="Absensi Harian"
                            >
                                <Calendar color="green" size="24" />
                            </Link>

                            <Link
                                href={route(
                                    "teacher.attendance.active_sessions"
                                )}
                                className="p-2 rounded-full bg-[#BAE6FD] text-blue-600 hover:bg-blue-200 transition-colors"
                                title="Sesi Aktif"
                            >
                                <Timer1 color="blue" size="24" />
                            </Link>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="px-6 py-4 bg-gray-50 border-b">
                            <h2 className="text-sm font-medium text-gray-700 mb-3">
                                Filter & Pengurutan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Tanggal Dari
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
                                        Tanggal Hingga
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

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Status
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={filterStatus}
                                        onChange={(e) =>
                                            setFilterStatus(e.target.value)
                                        }
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="active">Aktif</option>
                                        <option value="expired">
                                            Berakhir
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Urutkan Berdasarkan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(e.target.value)
                                        }
                                    >
                                        <option value="date">Tanggal</option>
                                        <option value="created_at">
                                            Tanggal Dibuat
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Urutan
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        value={sortOrder}
                                        onChange={(e) =>
                                            setSortOrder(e.target.value)
                                        }
                                    >
                                        <option value="desc">
                                            Terbaru Dulu
                                        </option>
                                        <option value="asc">
                                            Terlama Dulu
                                        </option>
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
                                    Terapkan Filter
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal & PIN
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Judul & Deskripsi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kehadiran
                                    </th>
                                    {/* <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sessions && sessions.length > 0 ? (
                                    sessions.map((session) => (
                                        <tr
                                            key={session.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                                        <Calendar
                                                            size="16"
                                                            className="mr-2 text-blue-500"
                                                        />
                                                        {session.date}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                            {session.pin}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                                        <DocumentText
                                                            size="16"
                                                            className="mr-2 text-amber-500"
                                                        />
                                                        {session.title}
                                                    </div>
                                                    {session.description && (
                                                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                            {
                                                                session.description
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {session.is_active ? (
                                                    <div className="flex items-center">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Aktif
                                                        </span>
                                                        <div className="ml-2 text-xs text-gray-500 flex items-center">
                                                            <Timer1
                                                                size="14"
                                                                className="mr-1"
                                                            />
                                                            Berakhir:{" "}
                                                            {session.expires_at}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Berakhir
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <People
                                                        size="16"
                                                        className="mr-2 text-blue-500"
                                                    />
                                                    <div className="flex flex-col">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {
                                                                session.present_count
                                                            }{" "}
                                                            /{" "}
                                                            {
                                                                session.attendance_count
                                                            }{" "}
                                                            hadir
                                                        </div>
                                                        <div className="w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                                                            <div
                                                                className="bg-blue-600 h-2.5 rounded-full"
                                                                style={{
                                                                    width: `${session.attendance_rate}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route(
                                                        "teacher.attendance.daily",
                                                        {
                                                            date: session.date,
                                                            session_id:
                                                                session.id,
                                                        }
                                                    )}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    <Eye size="20" />
                                                </Link>
                                            </td> */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            Tidak ada sesi absensi yang
                                            ditemukan
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
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAttendanceIndex;
