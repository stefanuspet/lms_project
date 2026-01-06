import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import {
    Edit2,
    Trash,
    Eye,
    SearchNormal1,
    Filter,
    Add,
    Setting4,
    ArrangeHorizontalSquare,
    Book1,
    People,
    Calendar,
    Printer,
} from "iconsax-reactjs";

const ClassroomIndex = ({ classes, pagination, filters, flash }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedClassrooms, setSelectedClassrooms] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState(null);
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState(filters?.sort_by || "name");
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || "asc");

    // Ambil errors global dari Inertia (mis. withErrors)
    const {
        props: { errors },
    } = usePage();

    // Function to delete classroom
    const handleDelete = (classroomId) => {
        if (confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
            setProcessing(true);

            router.delete(route("admin.classrooms.destroy", classroomId), {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                    setSelectedClassrooms([]);
                },
                onError: (errors) => {
                    console.error(
                        "Gagal menghapus kelas (single):",
                        errors
                    );
                    setProcessing(false);
                    setToast({
                        type: "error",
                        message:
                            errors?.error ||
                            "Terjadi kesalahan saat menghapus kelas.",
                    });
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
            route("admin.classrooms.index"),
            {
                page: page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["classes", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("admin.classrooms.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["classes", "pagination", "filters"],
            }
        );
    };

    // Handle filter application
    const applyFilters = () => {
        router.get(
            route("admin.classrooms.index"),
            {
                search: searchTerm,
                page: 1, // Reset to page 1 when filtering
                per_page: pagination.per_page,
                sort_by: sortBy,
                sort_order: sortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["classes", "pagination", "filters"],
            }
        );
    };

    // Handle reset filters
    const resetFilters = () => {
        setSortBy("name");
        setSortOrder("asc");

        router.get(
            route("admin.classrooms.index"),
            {
                search: searchTerm,
                page: 1,
                per_page: pagination.per_page,
                sort_by: "name",
                sort_order: "asc",
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["classes", "pagination", "filters"],
            }
        );
    };

    // Handle bulk selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = classes.map((classroom) => classroom.id);
            setSelectedClassrooms(allIds);
        } else {
            setSelectedClassrooms([]);
        }
    };

    const handleSelectClassroom = (e, classroomId) => {
        if (e.target.checked) {
            setSelectedClassrooms([...selectedClassrooms, classroomId]);
        } else {
            setSelectedClassrooms(
                selectedClassrooms.filter((id) => id !== classroomId)
            );
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedClassrooms.length === 0) {
            alert("Pilih minimal satu kelas untuk dihapus");
            return;
        }

        if (
            confirm(
                `Apakah Anda yakin ingin menghapus ${selectedClassrooms.length} kelas yang dipilih?`
            )
        ) {
            setProcessing(true);

            router.post(
                route("admin.classrooms.bulk-delete"),
                {
                    classroom_ids: selectedClassrooms,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(false);
                        setSelectedClassrooms([]);
                    },
                    onError: (errors) => {
                        console.error(
                            "Gagal menghapus kelas (bulk):",
                            errors
                        );
                        setProcessing(false);
                        setToast({
                            type: "error",
                            message:
                                errors?.error ||
                                "Gagal menghapus kelas yang dipilih.",
                        });
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

    // Tampilkan toast ketika ada flash message sukses / error
    useEffect(() => {
        console.log("Flash props (ClassroomIndex):", flash);
        console.log("Errors props (ClassroomIndex):", errors);

        if (flash?.success) {
            setToast({ type: "success", message: flash.success });
        } else if (flash?.error) {
            setToast({ type: "error", message: flash.error });
        } else if (errors?.error) {
            // Jika backend hanya mengirim withErrors(['error' => ...])
            setToast({ type: "error", message: errors.error });
        }
    }, [flash, errors]);

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
        <AuthenticatedLayout title="Manajemen Kelas">
            <Toast
                type={toast?.type}
                message={toast?.message}
                onClose={() => setToast(null)}
            />
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
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">
                                Daftar Kelas
                            </h1>
                            <p className="mt-1 text-xs text-gray-500">
                                Gunakan pencarian di kanan dan filter di bawah
                                untuk melihat kelas beserta jumlah siswa dan
                                mata pelajarannya.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Search box */}
                            <form onSubmit={handleSearch} className="relative">
                                <SearchNormal1
                                    size="20"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan Nama Kelas"
                                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 placeholder:text-sm"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <button type="submit" className="hidden">
                                    Cari
                                </button>
                            </form>
                        </div>
                        <div className="flex items-center space-x-2">
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
                            <a
                                href={route("admin.classrooms.export")}
                                className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                                title="Export ke Excel"
                            >
                                <Printer color="black" size="24" />
                            </a>
                            {/* Add button */}
                            <Link
                                href={route("admin.classrooms.create")}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <option value="name">Nama Kelas</option>
                                        <option value="created_at">
                                            Tanggal Dibuat
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
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedClassrooms.length > 0 && (
                        <div className="px-6 py-3 bg-blue-50 border-b flex justify-between items-center">
                            <div className="text-sm text-blue-600">
                                {selectedClassrooms.length} kelas dipilih
                            </div>
                            <div>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-75 flex items-center space-x-1"
                                >
                                    <Trash size="16" />
                                    <span>Hapus Terpilih</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            onChange={handleSelectAll}
                                            checked={
                                                selectedClassrooms.length > 0 &&
                                                selectedClassrooms.length ===
                                                    classes.length
                                            }
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Kelas
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deskripsi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Semester Aktif
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Siswa
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mata Pelajaran
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classes && classes.length > 0 ? (
                                    classes.map((classroom) => (
                                        <tr
                                            key={classroom.id}
                                            className={
                                                selectedClassrooms.includes(
                                                    classroom.id
                                                )
                                                    ? "bg-blue-50"
                                                    : "hover:bg-gray-50"
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    checked={selectedClassrooms.includes(
                                                        classroom.id
                                                    )}
                                                    onChange={(e) =>
                                                        handleSelectClassroom(
                                                            e,
                                                            classroom.id
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {classroom.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 truncate overflow-hidden text-ellipsis max-w-[200px]">
                                                {classroom.description || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {classroom.active_semester ? (
                                                    <div className="flex items-center">
                                                        <Calendar
                                                            variant="Bold"
                                                            size="16"
                                                            className="text-amber-500 mr-2"
                                                        />
                                                        <span>
                                                            {
                                                                classroom
                                                                    .active_semester
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <People
                                                        variant="Bold"
                                                        size="16"
                                                        className="text-blue-500 mr-2"
                                                    />
                                                    <span>
                                                        {
                                                            classroom.students_count
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Book1
                                                        variant="Bold"
                                                        size="16"
                                                        className="text-green-500 mr-2"
                                                    />
                                                    <span>
                                                        {
                                                            classroom.subjects_count
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <Link
                                                    href={route(
                                                        "admin.classrooms.edit",
                                                        classroom.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900 inline-block"
                                                >
                                                    <Edit2 size="20" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            classroom.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900 inline-block"
                                                    disabled={processing}
                                                >
                                                    <Trash size="20" />
                                                </button>
                                                <Link
                                                    href={route(
                                                        "admin.classrooms.show",
                                                        classroom.id
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
                                            colSpan="7"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            Tidak ada kelas
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
                                Berikutnya
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ClassroomIndex;
