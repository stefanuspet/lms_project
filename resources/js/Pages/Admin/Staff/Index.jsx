import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Edit2,
    Trash,
    Eye,
    SearchNormal1,
    Add,
    Setting4,
    Filter,
    Printer,
} from "iconsax-reactjs";

const StaffIndex = ({ staff, pagination, filters, flash }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters?.category || ""
    );
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [processing, setProcessing] = useState(false);

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
            route("admin.staff.index"),
            {
                page,
                search: searchTerm,
                category: categoryFilter,
                per_page: pagination.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["staff", "pagination", "filters"],
            }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("admin.staff.index"),
            {
                search: searchTerm,
                category: categoryFilter,
                page: 1,
                per_page: pagination.per_page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["staff", "pagination", "filters"],
            }
        );
    };

    const handleDelete = (id) => {
        if (!confirm("Apakah Anda yakin ingin menghapus data staf ini?")) {
            return;
        }

        setProcessing(true);

        router.delete(route("admin.staff.destroy", id), {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

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

    useEffect(() => {
        if (pagination?.current_page) {
            setCurrentPage(pagination.current_page);
        }
    }, [pagination]);

    return (
        <AuthenticatedLayout title="Kelola Data Staf">
            {flash?.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>{flash.success}</p>
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{flash.error}</p>
                </div>
            )}

            <div className="w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">
                                Daftar Staf & Security
                            </h1>
                            <p className="mt-1 text-xs text-gray-500">
                                Gunakan kotak pencarian di kanan untuk mencari
                                staf berdasarkan nama, NIP, jabatan, atau
                                telepon.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <form onSubmit={handleSearch} className="relative">
                                <SearchNormal1
                                    size="20"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan nama, NIP, jabatan, atau telepon"
                                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-72 placeholder:text-sm"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </form>
                            <div className="flex items-center space-x-2">
                                {/* Filter button (placeholder, sama seperti guru) */}
                                <button className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors">
                                    <Setting4
                                        color="black"
                                        variant="Bold"
                                        size="24"
                                    />
                                </button>
                                <button className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors">
                                    <Filter
                                        color="black"
                                        variant="Bold"
                                        size="24"
                                    />
                                </button>

                                {/* Export button */}
                                <a
                                    href={route("admin.staff.export")}
                                    className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                                    title="Export ke Excel"
                                >
                                    <Printer color="black" size="24" />
                                </a>

                                {/* Add button */}
                                <Link
                                    href={route("admin.staff.create")}
                                    className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                                >
                                    <Add color="black" size="24" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Staf
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Jabatan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kontak
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {staff && staff.length > 0 ? (
                                    staff.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={`${
                                                            item.profile_picture ||
                                                            "/assets/images/default-avatar.png"
                                                        }${
                                                            item.updated_at
                                                                ? `?v=${item.updated_at}`
                                                                : ""
                                                        }`}
                                                        alt={item.name}
                                                        className="h-10 w-10 rounded-full object-cover mr-3 border"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            NIP:{" "}
                                                            {item.nip || "-"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {item.category === "security"
                                                    ? "Security"
                                                    : "Staf"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {item.position || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <div>{item.phone || "-"}</div>
                                                <div className="text-xs text-gray-500">
                                                    {item.address || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        item.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {item.is_active
                                                        ? "Aktif"
                                                        : "Nonaktif"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    className="text-red-600 hover:text-red-900 inline-block"
                                                    disabled={processing}
                                                >
                                                    <Trash size="18" />
                                                </button>
                                                <Link
                                                    href={route(
                                                        "admin.staff.edit",
                                                        item.id
                                                    )}
                                                    className="text-amber-600 hover:text-amber-900 inline-block"
                                                >
                                                    <Edit2 size="18" />
                                                </Link>
                                                <Link
                                                    href={route(
                                                        "admin.staff.show",
                                                        item.id
                                                    )}
                                                    className="text-gray-600 hover:text-gray-900 inline-block"
                                                >
                                                    <Eye size="18" />
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
                                            Tidak ada data staf yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

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

export default StaffIndex;
