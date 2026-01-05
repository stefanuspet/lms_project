import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    SearchNormal1,
    Filter,
    Setting4,
    DocumentText,
    ClipboardText,
    Calendar,
    Message,
} from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherSubjectIndex = ({ subjects, pagination, filters, flash }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );

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
            route("teacher.subjects.index"),
            {
                page,
                search: searchTerm,
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["subjects", "pagination"],
            }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("teacher.subjects.index"),
            {
                search: searchTerm,
                page: 1,
                per_page: pagination.per_page,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["subjects", "pagination", "filters"],
            }
        );
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
        <TeacherLayout title="Mata Pelajaran Saya">
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
                    {/* Header – diseragamkan dengan halaman Admin */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">
                                Mata Pelajaran Saya
                            </h1>
                            <p className="mt-1 text-xs text-gray-500">
                                Gunakan kotak pencarian di kanan untuk mencari
                                mata pelajaran yang Anda ajar.
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
                                    placeholder="Cari mata pelajaran"
                                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-72 placeholder:text-sm"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <button type="submit" className="hidden">
                                    Cari
                                </button>
                            </form>

                            {/* Tombol pengaturan dan filter (opsional) */}
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
                        </div>
                    </div>

                    {/* Grid Card ala Google Classroom */}
                    <div className="px-6 pb-4 pt-3">
                        {subjects && subjects.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {subjects.map((subject) => (
                                    <div
                                        key={subject.id}
                                        onClick={() =>
                                            router.get(
                                                route(
                                                    "teacher.subjects.show",
                                                    subject.id
                                                )
                                            )
                                        }
                                        className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        {/* Header warna */}
                                        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 flex flex-col justify-between">
                                            <h3 className="text-base font-semibold text-white line-clamp-2">
                                                {subject.name}
                                            </h3>
                                            <p className="mt-1 text-xs text-blue-100">
                                                {subject.class_name} •{" "}
                                                {subject.semester_name}
                                            </p>
                                        </div>

                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                    {subject.student_count}{" "}
                                                    siswa
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Kelola Materi */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.get(
                                                            route(
                                                                "teacher.materials.index",
                                                                {
                                                                    subject_id:
                                                                        subject.id,
                                                                }
                                                            )
                                                        );
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200"
                                                    title="Kelola Materi"
                                                >
                                                    <DocumentText size="18" />
                                                </button>

                                                {/* Kelola Tugas */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.get(
                                                            route(
                                                                "teacher.assignments.index",
                                                                {
                                                                    subject_id:
                                                                        subject.id,
                                                                }
                                                            )
                                                        );
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200"
                                                    title="Kelola Tugas"
                                                >
                                                    <ClipboardText size="18" />
                                                </button>

                                                {/* Diskusi */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.get(
                                                            route(
                                                                "teacher.discussions.index",
                                                                subject.id
                                                            )
                                                        );
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
                                                    title="Diskusi"
                                                >
                                                    <Message size="18" />
                                                </button>

                                                {/* Absensi (opsional, masih dikomentari) */}
                                                {/* <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.get(
                                                            route(
                                                                "teacher.attendance.index",
                                                                {
                                                                    subject_id:
                                                                        subject.id,
                                                                }
                                                            )
                                                        );
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200"
                                                    title="Presensi"
                                                >
                                                    <Calendar size="18" />
                                                </button> */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500 mx-6 mb-4">
                                You don't have any assigned subjects yet
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
        </TeacherLayout>
    );
};

export default TeacherSubjectIndex;
