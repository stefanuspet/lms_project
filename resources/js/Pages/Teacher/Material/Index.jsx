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
    ArrowLeft2,
    DocumentDownload,
    Video,
    Document,
    Gallery,
    Book1,
} from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherMaterialIndex = ({
    materials,
    subject,
    pagination,
    filters,
    flash,
}) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );

    // Fungsi untuk menghapus materi
    const handleDelete = (materialId) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus materi ini?"
            )
        ) {
            setProcessing(true);

            router.delete(route("teacher.materials.destroy", materialId), {
                preserveScroll: true,
                onSuccess: () => {
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                    alert("Terjadi kesalahan saat menghapus materi.");
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
            route("teacher.materials.index"),
            {
                page: page,
                search: searchTerm,
                subject_id: subject.id,
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["materials", "pagination"],
            }
        );
    };

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("teacher.materials.index"),
            {
                search: searchTerm,
                subject_id: subject.id,
                page: 1, // Reset to page 1 when searching
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["materials", "pagination", "filters"],
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
    const pageNumbers = generatePageNumbers(
        currentPage,
        pagination?.last_page || 1
    );
    // Get icon for file type
    const getFileTypeIcon = (fileType) => {
        if (!fileType) return <Document size="20" className="text-gray-600" />;

        if (fileType.includes("pdf")) {
            return <Document size="20" className="text-red-600" />;
        } else if (fileType.includes("video")) {
            return <Video size="20" className="text-blue-600" />;
        } else if (fileType.includes("image")) {
            return <Gallery size="20" className="text-green-600" />;
        } else if (fileType.includes("word") || fileType.includes("doc")) {
            return <Document size="20" className="text-blue-600" />;
        } else if (
            fileType.includes("excel") ||
            fileType.includes("sheet") ||
            fileType.includes("xls")
        ) {
            return <Document size="20" className="text-green-600" />;
        } else if (
            fileType.includes("ppt") ||
            fileType.includes("presentation")
        ) {
            return <Document size="20" className="text-amber-600" />;
        } else {
            return <Document size="20" className="text-gray-600" />;
        }
    };

    // Update currentPage when pagination changes
    useEffect(() => {
        if (pagination?.current_page) {
            setCurrentPage(pagination.current_page);
        }
    }, [pagination]);

    return (
        <TeacherLayout title={`Materi - ${subject.name}`}>
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
                        <div className="flex items-center gap-4">
                            <Link
                                href={route(
                                    "teacher.subjects.show",
                                    subject.id
                                )}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Materi Ajar
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {subject.name} - {subject.class_name}
                                </p>
                            </div>
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
                                    placeholder="Cari materi"
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

                            {/* Add button */}
                            <Link
                                href={route("teacher.materials.create", {
                                    subject_id: subject.id,
                                })}
                                className="p-2 rounded-full bg-[#FAE27C] text-amber-600 hover:bg-amber-200 transition-colors"
                            >
                                <Add color="black" size="24" />
                            </Link>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Judul
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipe
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Berkas
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Diunggah
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {materials && materials.length > 0 ? (
                                    materials.map((material) => (
                                        <tr
                                            key={material.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {material.title}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    {getFileTypeIcon(
                                                        material.file_type
                                                    )}
                                                    <span>
                                                        {material.file_type ||
                                                            "Text Content"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {material.file_path ? (
                                                    <a
                                                        href={
                                                            material.file_path
                                                        }
                                                        target="_blank"
                                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        <DocumentDownload size="18" />
                                                        <span>Unduh</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        Tidak ada berkas
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {material.created_at}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <Link
                                                    href={route(
                                                        "teacher.materials.show",
                                                        material.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900 inline-block"
                                                    title="View Material"
                                                >
                                                    <Eye size="20" />
                                                </Link>
                                                <Link
                                                    href={route(
                                                        "teacher.materials.edit",
                                                        material.id
                                                    )}
                                                    className="text-amber-600 hover:text-amber-900 inline-block"
                                                    title="Edit Material"
                                                >
                                                    <Edit2 size="20" />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            material.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900 inline-block"
                                                    disabled={processing}
                                                    title="Hapus Materi"
                                                >
                                                    <Trash size="20" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            Belum ada materi untuk mata
                                            pelajaran ini. Klik tombol + untuk
                                            menambahkan materi baru.
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
        </TeacherLayout>
    );
};

export default TeacherMaterialIndex;
