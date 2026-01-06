import React, { useMemo, useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { ArrowLeft2, People } from "iconsax-reactjs";

const ExtracurricularMembers = ({ extracurricular, students }) => {
    const { data, setData, post, processing, errors } = useForm({
        student_ids: extracurricular.student_ids || [],
    });

    const [searchTerm, setSearchTerm] = useState("");

    const memberIds = data.student_ids || [];

    const currentMembers = useMemo(
        () =>
            students.filter((s) =>
                memberIds.includes(s.id)
            ),
        [students, memberIds]
    );

    const candidateStudents = useMemo(() => {
        const lower = searchTerm.trim().toLowerCase();
        if (!lower) {
            return [];
        }

        return students
            .filter((s) => !memberIds.includes(s.id))
            .filter(
                (s) =>
                    s.name.toLowerCase().includes(lower) ||
                    (s.nisn && s.nisn.toLowerCase().includes(lower))
            )
            .slice(0, 50);
    }, [students, memberIds, searchTerm]);

    const addStudent = (studentId) => {
        if (!memberIds.includes(studentId)) {
            setData("student_ids", [...memberIds, studentId]);
        }
    };

    const removeStudent = (studentId) => {
        setData(
            "student_ids",
            memberIds.filter((id) => id !== studentId)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(
            route(
                "admin.extracurriculars.members.update",
                extracurricular.id
            )
        );
    };

    return (
        <AuthenticatedLayout title="Kelola Anggota Ekstrakurikuler">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.extracurriculars.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                    <People size="24" />
                                    <span>
                                        Anggota Ekstrakurikuler:{" "}
                                        {extracurricular.name}
                                    </span>
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Atur anggota ekskul tanpa harus scroll
                                    panjang: gunakan pencarian siswa di bawah.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel
                                        htmlFor="search"
                                        value="Tambah Anggota (Cari Nama / NISN)"
                                    />
                                    <input
                                        id="search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        placeholder="Ketik minimal 2 huruf nama atau NISN..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50 text-sm"
                                    />
                                    <div className="mt-2 max-h-64 overflow-y-auto border rounded-md p-3 space-y-1">
                                        {candidateStudents.length > 0 ? (
                                            candidateStudents.map((student) => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    className="w-full text-left text-sm text-gray-700 hover:bg-amber-50 px-2 py-1 rounded flex justify-between items-center"
                                                    onClick={() =>
                                                        addStudent(student.id)
                                                    }
                                                >
                                                    <span>
                                                        {student.name} (
                                                        {student.nisn})
                                                    </span>
                                                    <span className="text-xs text-amber-600">
                                                        Tambah
                                                    </span>
                                                </button>
                                            ))
                                        ) : searchTerm.trim().length < 2 ? (
                                            <p className="text-xs text-gray-500">
                                                Ketik minimal 2 huruf untuk
                                                mencari siswa.
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-500">
                                                Tidak ada siswa yang cocok.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="members"
                                        value="Anggota Saat Ini"
                                    />
                                    <div className="mt-2 max-h-64 overflow-y-auto border rounded-md p-3 space-y-1">
                                        {currentMembers.length > 0 ? (
                                            currentMembers.map((student) => (
                                                <div
                                                    key={student.id}
                                                    className="flex items-center justify-between text-sm text-gray-700"
                                                >
                                                    <span>
                                                        {student.name} (
                                                        {student.nisn})
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                        onClick={() =>
                                                            removeStudent(
                                                                student.id
                                                            )
                                                        }
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500">
                                                Belum ada anggota.
                                            </p>
                                        )}
                                    </div>
                                    <InputError
                                        message={errors.student_ids}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-4 space-x-3">
                                <Link
                                    href={route("admin.extracurriculars.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    Simpan Anggota
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ExtracurricularMembers;
