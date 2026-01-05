import React, { useState, useMemo } from "react";
import { Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Add, Edit2, Trash, Filter, SearchNormal1 } from "iconsax-reactjs";

const ScheduleIndex = ({ schedules, pagination, filters, options, flash }) => {
    const [localFilters, setLocalFilters] = useState({
        class_id: filters.class_id || "",
        teacher_id: filters.teacher_id || "",
        subject_id: filters.subject_id || "",
        semester_id: filters.semester_id || "",
        day: filters.day || "",
        search: filters.search || "",
    });
    const [typeFilter, setTypeFilter] = useState("all"); // all | pelajaran | ekskul

    const applyFilters = () => {
        router.get(
            route("admin.schedules.index"),
            { ...localFilters },
            { preserveState: true, preserveScroll: true }
        );
    };

    const clearFilters = () => {
        setLocalFilters({
            class_id: "",
            teacher_id: "",
            subject_id: "",
            semester_id: "",
            day: "",
            search: "",
        });
        router.get(
            route("admin.schedules.index"),
            {},
            { preserveScroll: true }
        );
    };

    const handleDelete = (id) => {
        if (!confirm("Hapus jadwal ini?")) return;
        router.delete(route("admin.schedules.destroy", id), {
            preserveScroll: true,
        });
    };

    const handlePageChange = (page) => {
        router.get(
            route("admin.schedules.index"),
            { ...localFilters, page },
            { preserveScroll: true }
        );
    };

    const pages = Array.from(
        { length: pagination.last_page || 1 },
        (_, idx) => idx + 1
    );

    const filteredSchedules = useMemo(() => {
        if (!schedules) return [];
        if (typeFilter === "pelajaran") {
            return schedules.filter((item) => !item.is_extracurricular);
        }
        if (typeFilter === "ekskul") {
            return schedules.filter((item) => item.is_extracurricular);
        }
        return schedules;
    }, [schedules, typeFilter]);

    console.log(schedules);

    return (
        <AuthenticatedLayout title="Jadwal Pelajaran & Ekstrakurikuler">
            {flash?.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4">
                    {flash.success}
                </div>
            )}

            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-5 border-b">
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">
                                Jadwal Pelajaran & Ekstrakurikuler SMK
                            </h1>
                            <p className="mt-1 text-xs text-gray-500">
                                Gunakan filter di bawah untuk melihat jadwal per kelas, guru, atau hanya ekskul saja.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route("admin.schedules.create")}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                <Add size="20" /> Tambah Jadwal
                            </Link>
                        </div>
                    </div>

                    <div className="px-6 py-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="relative">
                                <SearchNormal1
                                    size="18"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    value={localFilters.search}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            search: e.target.value,
                                        })
                                    }
                                    className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-300 focus:ring-amber-400 focus:border-amber-400"
                                    placeholder="Cari mapel/kelas/guru"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="rounded-md border border-gray-300 py-2 px-3 focus:ring-amber-400 focus:border-amber-400"
                            >
                                <option value="all">Semua Jenis</option>
                                <option value="pelajaran">Pelajaran</option>
                                <option value="ekskul">Ekstrakurikuler</option>
                            </select>

                            <select
                                value={localFilters.class_id}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        class_id: e.target.value,
                                    })
                                }
                                className="rounded-md border border-gray-300 py-2 px-3 focus:ring-amber-400 focus:border-amber-400"
                            >
                                <option value="">Semua Kelas</option>
                                {options.classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={localFilters.teacher_id}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        teacher_id: e.target.value,
                                    })
                                }
                                className="rounded-md border border-gray-300 py-2 px-3 focus:ring-amber-400 focus:border-amber-400"
                            >
                                <option value="">Semua Guru</option>
                                {options.teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={localFilters.day}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        day: e.target.value,
                                    })
                                }
                                className="rounded-md border border-gray-300 py-2 px-3 focus:ring-amber-400 focus:border-amber-400"
                            >
                                <option value="">Semua Hari</option>
                                {Object.entries(options.days).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <select
                                value={localFilters.subject_id}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        subject_id: e.target.value,
                                    })
                                }
                                className="rounded-md border border-gray-300 py-2 px-3 focus:ring-amber-400 focus:border-amber-400"
                            >
                                <option value="">Semua Mapel</option>
                                {options.subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={localFilters.semester_id}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        semester_id: e.target.value,
                                    })
                                }
                                className="rounded-md border border-gray-300 py-2 px-3 focus:ring-amber-400 focus:border-amber-400"
                            >
                                <option value="">Semua Semester</option>
                                {options.semesters.map((semester) => (
                                    <option
                                        key={semester.id}
                                        value={semester.id}
                                    >
                                        {semester.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2">
                                <button
                                    onClick={applyFilters}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    <Filter size="18" /> Terapkan
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kelas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mata Pelajaran
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Guru
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hari
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Waktu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ruang
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Semester
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSchedules && filteredSchedules.length > 0 ? (
                                    filteredSchedules.map((schedule, idx) => (
                                        <tr
                                            key={`${
                                                schedule.is_extracurricular
                                                    ? "ex"
                                                    : "sch"
                                            }-${schedule.id}-${idx}`}
                                            className={`hover:bg-gray-50 ${
                                                schedule.is_extracurricular
                                                    ? "bg-green-50"
                                                    : ""
                                            }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {schedule.class_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <span>{schedule.subject_name}</span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            schedule.is_extracurricular
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}
                                                    >
                                                        {schedule.is_extracurricular
                                                            ? "Ekskul"
                                                            : "Pelajaran"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {schedule.teacher_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {schedule.day}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {schedule.time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {schedule.room}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {schedule.semester}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                {!schedule.is_extracurricular && (
                                                    <>
                                                        <Link
                                                            href={route(
                                                                "admin.schedules.edit",
                                                                schedule.id
                                                            )}
                                                            className="text-blue-600 hover:text-blue-900 inline-block"
                                                        >
                                                            <Edit2 size="18" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    schedule.id
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900 inline-block"
                                                        >
                                                            <Trash size="18" />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            Belum ada jadwal tercatat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.last_page > 1 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                                Halaman {pagination.current_page} dari{" "}
                                {pagination.last_page}
                            </div>
                            <div className="flex items-center gap-1">
                                {pages.map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded-md text-sm ${
                                            page === pagination.current_page
                                                ? "bg-amber-500 text-white"
                                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ScheduleIndex;
