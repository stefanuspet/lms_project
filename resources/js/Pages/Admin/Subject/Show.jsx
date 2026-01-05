import React from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    Edit2,
    Book1,
    Note1,
    ClipboardTick,
} from "iconsax-reactjs";

const SubjectShow = ({ subject }) => {
    return (
        <AuthenticatedLayout title={`Mata Pelajaran: ${subject.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.subjects.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Detail Mata Pelajaran
                            </h1>
                        </div>
                        <Link
                            href={route("admin.subjects.edit", subject.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Edit2 size="20" />
                            <span>Edit Mata Pelajaran</span>
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Subject Overview Section */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                    Ringkasan Mata Pelajaran
                                </h2>
                            </div>

                            {/* Info boxes */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Nama Mata Pelajaran
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {subject.name}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Kelas
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {subject.class.name}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Guru
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {subject.teacher.name}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Dibuat
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {subject.created_at}
                                </p>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Deskripsi
                                </h3>
                                <p className="text-gray-900">
                                    {subject.description ||
                                        "Belum ada deskripsi."}
                                </p>
                            </div>

                            {/* Stats Section */}
                            <div className="md:col-span-2 mt-4">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                    Statistik Konten
                                </h2>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                                <div className="rounded-full bg-blue-100 p-3 mr-4">
                                    <Book1
                                        size="24"
                                        className="text-blue-600"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        Materi
                                    </h3>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {subject.materials_count}
                                        <span className="text-sm font-normal text-gray-500 ml-1">
                                            materi
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-lg flex items-center">
                                <div className="rounded-full bg-amber-100 p-3 mr-4">
                                    <ClipboardTick
                                        size="24"
                                        className="text-amber-600"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        Tugas
                                    </h3>
                                    <p className="text-xl font-semibold text-gray-900">
                                        {subject.assignments_count}
                                        <span className="text-sm font-normal text-gray-500 ml-1">
                                            tugas
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("admin.subjects.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Kembali ke Daftar
                                </Link>
                                <Link
                                    href={route(
                                        "admin.subjects.edit",
                                        subject.id
                                    )}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Edit Mata Pelajaran
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default SubjectShow;
