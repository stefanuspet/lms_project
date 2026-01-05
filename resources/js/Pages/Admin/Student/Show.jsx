import React from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { ArrowLeft2, Edit2 } from "iconsax-reactjs";

const StudentShow = ({ student }) => {
    return (
        <AuthenticatedLayout title={`Siswa: ${student.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.students.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Detail Data Siswa
                            </h1>
                        </div>
                        <Link
                            href={route("admin.students.edit", student.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Edit2 size="20" />
                            <span>Edit Data Siswa</span>
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Profile Section */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                    Profil Siswa
                                </h2>
                            </div>

                            {/* Info boxes */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Nama Lengkap
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {student.name}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    NISN
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {student.nisn}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Jenis Kelamin
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {student.gender ? student.gender : "-"}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Tanggal Lahir
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {student.birth_date
                                        ? new Date(
                                              student.birth_date
                                          ).toLocaleDateString()
                                        : "-"}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Tempat Lahir
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {student.birth_place
                                        ? student.birth_place
                                        : "-"}
                                </p>
                            </div>

                            {/* Login Information Section */}
                            <div className="md:col-span-2 mt-4">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                    Login Information
                                </h2>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Email Address
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    {student.user.email}
                                </p>
                            </div>

                            {/* Classes Section */}
                            <div className="md:col-span-2 mt-4">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                    Enrolled Classes
                                </h2>
                            </div>

                            <div className="md:col-span-2">
                                {student.classes &&
                                student.classes.length > 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Class Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Semester
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {student.classes.map(
                                                        (classItem, index) => (
                                                            <tr
                                                                key={index}
                                                                className={
                                                                    index %
                                                                        2 ===
                                                                    0
                                                                        ? "bg-white"
                                                                        : "bg-gray-50"
                                                                }
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {
                                                                        classItem.name
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {classItem.semester
                                                                        ? classItem
                                                                              .semester
                                                                              .name
                                                                        : "-"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-500 italic">
                                            Belum terdaftar di kelas mana pun
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("admin.students.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Kembali ke Daftar
                                </Link>
                                <Link
                                    href={route(
                                        "admin.students.edit",
                                        student.id
                                    )}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Edit Data Siswa
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default StudentShow;
