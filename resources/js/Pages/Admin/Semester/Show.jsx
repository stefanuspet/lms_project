import React from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    Edit2,
    Book,
    Teacher,
    People,
    Calendar,
} from "iconsax-reactjs";

const SemesterShow = ({ semester, students_by_class, teacher_subjects }) => {
    return (
        <AuthenticatedLayout title={`Semester: ${semester.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.semesters.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Detail Semester
                            </h1>
                        </div>
                        <Link
                            href={route("admin.semesters.edit", semester.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Edit2 size="20" />
                            <span>Edit Semester</span>
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Semester Summary */}
                            <div className="md:col-span-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-700">
                                        {semester.name}
                                    </h2>
                                    <span
                                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                                            semester.is_active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {semester.is_active
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </span>
                                </div>
                                <div className="flex items-center mt-2 text-gray-600 space-x-6">
                                    <div className="flex items-center">
                                        <Calendar size="18" className="mr-2" />
                                        <span>
                                            {semester.formatted_start_date} -{" "}
                                            {semester.formatted_end_date}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <People size="18" className="mr-2" />
                                        <span>
                                            {semester.student_count} Siswa
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Book size="18" className="mr-2" />
                                        <span>
                                            {semester.teacher_subject_count}{" "}
                                            Mata Pelajaran
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Students by Class */}
                            <div className="md:col-span-2">
                                <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b">
                                    Siswa per Kelas
                                </h3>
                                {students_by_class &&
                                students_by_class.length > 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Nama Kelas
                                                        </th>
                                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Jumlah Siswa
                                                        </th>
                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Aksi
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {students_by_class.map(
                                                        (classItem, index) => (
                                                            <tr
                                                                key={
                                                                    classItem.id
                                                                }
                                                                className={
                                                                    index %
                                                                        2 ===
                                                                    0
                                                                        ? "bg-white"
                                                                        : "bg-gray-50"
                                                                }
                                                            >
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {
                                                                        classItem.name
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                                                    {
                                                                        classItem.count
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                                                    <Link
                                                                        href={route(
                                                                            "admin.classes.show",
                                                                            classItem.id
                                                                        )}
                                                                        className="text-blue-500 hover:text-blue-700"
                                                                    >
                                                                        Lihat
                                                                        Kelas
                                                                    </Link>
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
                                            Belum ada siswa yang terdaftar pada
                                            semester ini
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Semester Stats */}
                            <div>
                                <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b">
                                    Ringkasan Semester
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                                            Total Siswa
                                        </h4>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {semester.student_count}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                                            Total Mata Pelajaran
                                        </h4>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {semester.teacher_subject_count}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                                            Durasi
                                        </h4>
                                        <p className="text-xl font-medium text-gray-900">
                                            {calculateDuration(
                                                semester.start_date,
                                                semester.end_date
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher Subjects */}
                            <div className="md:col-span-3 mt-4">
                                <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b">
                                    Subjects and Teachers
                                </h3>
                                {teacher_subjects &&
                                teacher_subjects.length > 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Subject
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Teacher
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {teacher_subjects.map(
                                                        (item, index) => (
                                                            <tr
                                                                key={item.id}
                                                                className={
                                                                    index %
                                                                        2 ===
                                                                    0
                                                                        ? "bg-white"
                                                                        : "bg-gray-50"
                                                                }
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <Book
                                                                            size="18"
                                                                            className="mr-2 text-amber-500"
                                                                        />
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {
                                                                                item
                                                                                    .subject
                                                                                    .name
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <Teacher
                                                                            size="18"
                                                                            className="mr-2 text-blue-500"
                                                                        />
                                                                        <div className="text-sm text-gray-900">
                                                                            {
                                                                                item
                                                                                    .teacher
                                                                                    .name
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <Link
                                                                        href={route(
                                                                            "admin.subjects.show",
                                                                            item
                                                                                .subject
                                                                                .id
                                                                        )}
                                                                        className="text-blue-500 hover:text-blue-700 mr-3"
                                                                    >
                                                                        View
                                                                        Subject
                                                                    </Link>
                                                                    <Link
                                                                        href={route(
                                                                            "admin.teachers.show",
                                                                            item
                                                                                .teacher
                                                                                .id
                                                                        )}
                                                                        className="text-blue-500 hover:text-blue-700"
                                                                    >
                                                                        Lihat
                                                                        Guru
                                                                    </Link>
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
                                            Belum ada mata pelajaran yang
                                            diampu pada semester ini
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-3 mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("admin.semesters.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Kembali ke Daftar
                                </Link>
                                <Link
                                    href={route(
                                        "admin.semesters.edit",
                                        semester.id
                                    )}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Edit Semester
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

// Helper function to calculate duration between two dates
const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in milliseconds
    const diffTime = Math.abs(end - start);

    // Convert to days
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate months (approximate)
    const diffMonths = Math.round(diffDays / 30);

    if (diffMonths < 1) {
        return `${diffDays} hari`;
    } else if (diffMonths === 1) {
        return `1 bulan (${diffDays} hari)`;
    } else {
        return `${diffMonths} bulan (${diffDays} hari)`;
    }
};

export default SemesterShow;
