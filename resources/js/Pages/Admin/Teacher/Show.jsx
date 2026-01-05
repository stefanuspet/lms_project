import React from "react";
import { Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    User,
    Sms,
    Call,
    Location,
    Book1,
    Bank,
    Edit2,
    Trash,
} from "iconsax-reactjs";

const TeacherShow = ({ teacher, flash }) => {
    const handleDelete = () => {
        if (confirm("Apakah Anda yakin ingin menghapus data guru ini?")) {
            router.delete(route("admin.teachers.destroy", teacher.id), {
                preserveScroll: true,
            });
        }
    };

    console.log(teacher);

    return (
        <AuthenticatedLayout title="Kelola Data Guru">
            {/* Flash message */}
            {flash?.success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.success}</p>
                </div>
            )}

            <div className="w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.teachers.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Detail Data Guru
                            </h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route("admin.teachers.edit", teacher.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                <Edit2 size="20" />
                                <span>Edit</span>
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <Trash size="20" />
                                <span>Hapus</span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Teacher Avatar and Basic Info */}
                            <div className="md:w-1/3">
                                <div className="flex flex-col items-center">
                                    <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                        <User
                                            size="64"
                                            className="text-gray-400"
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {teacher.name}
                                    </h2>
                                    <p className="text-gray-500">
                                        {teacher.nip}
                                    </p>

                                    {teacher.subjects &&
                                        teacher.subjects.length > 0 && (
                                            <div className="mt-2 flex flex-wrap justify-center gap-2">
                                                {teacher.subjects
                                                    .slice(0, 2)
                                                    .map((subject, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {subject.name}
                                                        </div>
                                                    ))}
                                                {teacher.subjects.length >
                                                    2 && (
                                                    <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                        +
                                                        {teacher.subjects
                                                            .length - 2}{" "}
                                                        more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>

                                {/* Quick Info Card */}
                                <div className="mt-8 bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-700 mb-3">
                                        Quick Information
                                    </h3>
                                    <div className="space-y-3">
                                        {teacher.user?.email && (
                                            <div className="flex items-center gap-3">
                                                <Sms
                                                    size="20"
                                                    className="text-gray-400"
                                                />
                                                <span className="text-gray-600 text-sm">
                                                    {teacher.user.email}
                                                </span>
                                            </div>
                                        )}
                                        {teacher.phone && (
                                            <div className="flex items-center gap-3">
                                                <Call
                                                    size="20"
                                                    className="text-gray-400"
                                                />
                                                <span className="text-gray-600 text-sm">
                                                    {teacher.phone}
                                                </span>
                                            </div>
                                        )}
                                        {teacher.address && (
                                            <div className="flex items-start gap-3">
                                                <Location
                                                    size="20"
                                                    className="text-gray-400 mt-0.5"
                                                />
                                                <span className="text-gray-600 text-sm">
                                                    {teacher.address}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Teacher Details */}
                            <div className="md:w-2/3">
                                {/* Teaching Information */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                        <Book1
                                            size="24"
                                            className="text-gray-500 mr-2"
                                        />
                                        Informasi Kelas
                                    </h3>

                                    {teacher.subjects &&
                                    teacher.subjects.length > 0 ? (
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Mata Pelajaran
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Kelas
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {teacher.subjects.map(
                                                        (subject, index) => (
                                                            <tr
                                                                key={index}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {
                                                                        subject.name
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {subject.classroom
                                                                        ? subject
                                                                              .classroom
                                                                              .name
                                                                        : "-"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 text-gray-500 p-4 rounded-lg text-center">
                                            Belum ada mata pelajaran yang
                                            diampu guru ini.
                                        </div>
                                    )}
                                </div>

                                {/* Classes */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                        <Bank
                                            size="24"
                                            className="text-gray-500 mr-2"
                                        />
                                        Kelas
                                    </h3>

                                    {teacher.subjects &&
                                    teacher.subjects.some((s) => s.class) ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {teacher.subjects
                                                .filter((s) => s.class)
                                                .map((subject, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                    >
                                                        <h4 className="font-medium text-gray-800">
                                                            {subject.class.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {subject.name}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 text-gray-500 p-4 rounded-lg text-center">
                                            Belum ada kelas yang diampu guru
                                            ini.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default TeacherShow;
