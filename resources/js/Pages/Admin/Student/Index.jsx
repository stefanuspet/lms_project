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
    Printer,
} from "iconsax-reactjs";

const StudentsIndex = ({ students, pagination, filters, flash }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );

    // Fungsi untuk menghapus siswa
    const handleDelete = (studentId) => {
        if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
            setProcessing(true);

            router.delete(route("admin.students.destroy", studentId), {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                    alert("Terjadi kesalahan saat menghapus siswa.");
                },
            });
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
            route("admin.students.index"),
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
                only: ["students", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("admin.students.index"),
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
                only: ["students", "pagination", "filters"],
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
        <AuthenticatedLayout title="Manajemen Siswa">
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
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">
                                Daftar Siswa
                            </h1>
                            <p className="mt-1 text-xs text-gray-500">
                                Gunakan kotak pencarian di kanan untuk mencari
                                siswa berdasarkan nama, NISN, atau email.
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 ">
                                {/* Search box */}
                                <form
                                    onSubmit={handleSearch}
                                    className="relative"
                                >
                                    <SearchNormal1
                                        size="20"
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Cari berdasarkan Nama, NISN, atau Email"
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
                            <div className="flex items-center space-x-3 ">
                                {/* Placeholder jika nanti mau ada filter tambahan siswa */}
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
                                    href={route("admin.students.export")}
                                    className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                                    title="Export ke Excel"
                                >
                                    <Printer color="black" size="24" />
                                </a>

                                {/* Add button */}
                                <Link
                                    href={route("admin.students.create")}
                                    className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                                >
                                    <Add color="black" size="24" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar bawah (filter + export + tambah) */}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NISN
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Jenis Kelamin
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kelas
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students && students.length > 0 ? (
                                    students.map((student) => (
                                        <tr
                                            key={student.id}
                                            className={
                                                selectedStudents.includes(
                                                    student.id
                                                )
                                                    ? "bg-blue-50"
                                                    : "hover:bg-gray-50"
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={`${
                                                            student.profile_picture ||
                                                            "/assets/images/default-avatar.png"
                                                        }${
                                                            student.updated_at
                                                                ? `?v=${student.updated_at}`
                                                                : ""
                                                        }`}
                                                        alt={student.name}
                                                        className="h-10 w-10 rounded-full object-cover mr-3 border"
                                                    />
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.nisn}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.gender}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate overflow-hidden text-ellipsis max-w-[200px]">
                                                {student.classes}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <Link
                                                    href={route(
                                                        "admin.students.edit",
                                                        student.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900 inline-block"
                                                >
                                                    <Edit2 size="20" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(student.id)
                                                    }
                                                    className="text-red-600 hover:text-red-900 inline-block"
                                                    disabled={processing}
                                                >
                                                    <Trash size="20" />
                                                </button>
                                                <Link
                                                    href={route(
                                                        "admin.students.show",
                                                        student.id
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
                                            Tidak ada data siswa yang ditemukan
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

export default StudentsIndex;
