import React, { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    Edit2,
    Book1,
    Profile2User,
    Calendar,
    UserAdd,
    CloseCircle,
} from "iconsax-reactjs";

const ClassroomShow = ({ classroom, semesters = [], flash }) => {
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const { data, setData, post, processing } = useForm({
        student_ids: [],
        semester_id:
            classroom.active_semester?.id ||
            semesters.find((s) => s.is_active)?.id ||
            semesters[0]?.id ||
            "",
    });

    // Function to search students
    const searchStudents = async () => {
        if (searchTerm.trim().length < 2) return;

        setIsSearching(true);

        try {
            const response = await fetch(
                route("admin.classrooms.search-students", {
                    q: searchTerm,
                    exclude_ids: classroom.students.map(
                        (student) => student.id
                    ),
                })
            );

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error searching students:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Function to toggle student selection
    const toggleSelectStudent = (student) => {
        const isSelected = selectedStudents.some((s) => s.id === student.id);

        if (isSelected) {
            setSelectedStudents(
                selectedStudents.filter((s) => s.id !== student.id)
            );
        } else {
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    // Function to handle adding students
    const handleAddStudents = () => {
        if (selectedStudents.length === 0) {
            alert("Pilih minimal satu siswa untuk ditambahkan");
            return;
        }

        setData({
            student_ids: selectedStudents.map((student) => student.id),
            semester_id: data.semester_id,
        });

        post(route("admin.classrooms.add-students", classroom.id), {
            onSuccess: () => {
                setShowAddStudentModal(false);
                setSelectedStudents([]);
                setSearchResults([]);
                setSearchTerm("");
            },
        });
    };

    // Function to handle removing a student
    const handleRemoveStudent = (studentId) => {
        if (
            !confirm(
                "Apakah Anda yakin ingin menghapus siswa ini dari kelas?"
            )
        )
            return;

        post(
            route("admin.classrooms.remove-students", classroom.id),
            {
                student_ids: [studentId],
                semester_id: data.semester_id,
            },
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <AuthenticatedLayout title={`Kelas: ${classroom.name}`}>
            {/* Flash message */}
            {flash?.success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.success}</p>
                </div>
            )}

            {flash?.error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.error}</p>
                </div>
            )}

            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.classrooms.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Detail Kelas
                            </h1>
                        </div>
                        <Link
                            href={route("admin.classrooms.edit", classroom.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Edit2 size="20" />
                            <span>Edit Kelas</span>
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Class Overview Section */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                    Ringkasan Kelas
                                </h2>
                            </div>

                            {/* Info boxes */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Mata Pelajaran
                                </h3>
                                <p className="text-lg font-medium text-gray-900">
                                    <div className="flex items-center">
                                        <Book1
                                            variant="Bold"
                                            size="20"
                                            className="text-green-500 mr-2"
                                        />
                                        <span>
                                            {classroom.subjects_count} mata
                                            pelajaran
                                        </span>
                                    </div>
                                </p>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Deskripsi
                                </h3>
                                <p className="text-gray-900">
                                    {classroom.description ||
                                        "Belum ada deskripsi."}
                                </p>
                            </div>

                            {/* Subjects Section */}
                            <div className="md:col-span-2 mt-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                        Mata Pelajaran
                                    </h2>
                                    <Link
                                        href={route("admin.subjects.create")}
                                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        Tambah Mata Pelajaran
                                    </Link>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                {classroom.subjects &&
                                classroom.subjects.length > 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Nama Mata Pelajaran
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Guru
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Deskripsi
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Aksi
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {classroom.subjects.map(
                                                        (subject, index) => (
                                                            <tr
                                                                key={subject.id}
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
                                                                        subject.name
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {subject.teacher
                                                                        ? subject
                                                                              .teacher
                                                                              .name
                                                                        : "-"}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[300px]">
                                                                    {subject.description ||
                                                                        "-"}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <Link
                                                                        href={route(
                                                                            "admin.subjects.show",
                                                                            subject.id
                                                                        )}
                                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                    >
                                                                        Lihat
                                                                        Mata
                                                                        Pelajaran
                                                                    </Link>
                                                                    <Link
                                                                        href={route(
                                                                            "admin.subjects.edit",
                                                                            subject.id
                                                                        )}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                    >
                                                                        Edit
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
                                            Belum ada mata pelajaran untuk
                                            kelas ini.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Students Section */}
                            <div className="md:col-span-2 mt-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                        Enrolled Students
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={data.semester_id}
                                            onChange={(e) =>
                                                setData(
                                                    "semester_id",
                                                    e.target.value
                                                )
                                            }
                                            className="border rounded-lg px-3 py-2 text-sm"
                                        >
                                            {semesters.map((sem) => (
                                                <option
                                                    key={sem.id}
                                                    value={sem.id}
                                                >
                                                    {sem.name}
                                                    {sem.is_active
                                                        ? " (Active)"
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() =>
                                                setShowAddStudentModal(true)
                                            }
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                            disabled={!data.semester_id}
                                        >
                                            <UserAdd size="20" />
                                            <span>Add Students</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                {classroom.students &&
                                classroom.students.length > 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Student Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            NISN
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {classroom.students.map(
                                                        (student, index) => (
                                                            <tr
                                                                key={student.id}
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
                                                                        student.name
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {
                                                                        student.nisn
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <Link
                                                                        href={route(
                                                                            "admin.students.show",
                                                                            student.id
                                                                        )}
                                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                    >
                                                                        View
                                                                    </Link>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRemoveStudent(
                                                                                student.id
                                                                            )
                                                                        }
                                                                        className="text-red-600 hover:text-red-900"
                                                                    >
                                                                        Remove
                                                                    </button>
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
                                            Belum ada siswa terdaftar di kelas
                                            ini.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("admin.classrooms.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Back to List
                                </Link>
                                <Link
                                    href={route(
                                        "admin.classrooms.edit",
                                        classroom.id
                                    )}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Edit Class
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            {showAddStudentModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Tambah Siswa ke Kelas
                            </h3>
                            <button
                                onClick={() => setShowAddStudentModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <CloseCircle size="24" />
                            </button>
                        </div>

                        <div className="p-4 border-b">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Cari siswa berdasarkan nama atau NISN..."
                                    className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && searchStudents()
                                    }
                                />
                                <button
                                    onClick={searchStudents}
                                    disabled={
                                        isSearching ||
                                        searchTerm.trim().length < 2
                                    }
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                                >
                                    {isSearching ? "Mencari..." : "Cari"}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 flex-grow overflow-y-auto">
                            {selectedStudents.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Siswa Terpilih (
                                        {selectedStudents.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStudents.map((student) => (
                                            <div
                                                key={`selected-${student.id}`}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center"
                                            >
                                                <span className="mr-1">
                                                    {student.name}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        toggleSelectStudent(
                                                            student
                                                        )
                                                    }
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <CloseCircle size="16" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {searchResults.length > 0 ? (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Hasil Pencarian
                                    </h4>
                                    <div className="overflow-y-auto max-h-[300px]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                                        <input
                                                            type="checkbox"
                                                            onChange={(e) => {
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    setSelectedStudents(
                                                                        searchResults
                                                                    );
                                                                } else {
                                                                    setSelectedStudents(
                                                                        []
                                                                    );
                                                                }
                                                            }}
                                                            checked={
                                                                selectedStudents.length ===
                                                                    searchResults.length &&
                                                                searchResults.length >
                                                                    0
                                                            }
                                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                        />
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Nama Siswa
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        NISN
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {searchResults.map(
                                                    (student) => (
                                                        <tr
                                                            key={student.id}
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() =>
                                                                toggleSelectStudent(
                                                                    student
                                                                )
                                                            }
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedStudents.some(
                                                                        (s) =>
                                                                            s.id ===
                                                                            student.id
                                                                    )}
                                                                    onChange={() =>
                                                                        toggleSelectStudent(
                                                                            student
                                                                        )
                                                                    }
                                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {student.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {student.nisn}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                searchTerm.trim().length >= 2 &&
                                !isSearching && (
                                    <div className="text-center text-gray-500 py-8">
                                        Tidak ada siswa ditemukan. Coba kata
                                        kunci lain.
                                    </div>
                                )
                            )}

                            {searchTerm.trim().length < 2 && !isSearching && (
                                <div className="text-center text-gray-500 py-8">
                                    Cari siswa untuk ditambahkan ke kelas ini.
                                </div>
                            )}

                            {isSearching && (
                                <div className="text-center text-gray-500 py-8">
                                    Mencari...
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAddStudentModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddStudents}
                                disabled={
                                    selectedStudents.length === 0 || processing
                                }
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                            >
                                {processing
                                    ? "Menambahkan..."
                                    : `Tambah ${selectedStudents.length} Siswa`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
};

export default ClassroomShow;
