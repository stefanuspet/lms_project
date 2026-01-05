import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    DocumentText,
    ClipboardText,
    Calendar,
    Teacher,
    People,
    Book1,
    Message,
    NoteText,
    ArrowDown2,
    ArrowUp2,
    Printer,
} from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherSubjectShow = ({ subject }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [showStudents, setShowStudents] = useState(false);
    return (
        <TeacherLayout title={`Mata Pelajaran: ${subject.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.subjects.index")}
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

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            <Link
                                href={route("teacher.materials.index", {
                                    subject_id: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                <DocumentText size="20" />
                                <span>Materi</span>
                            </Link>
                            <Link
                                href={route("teacher.assignments.index", {
                                    subject_id: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                            >
                                <ClipboardText size="20" />
                                <span>Tugas</span>
                            </Link>
                            <Link
                                href={route("teacher.quizzes.index", {
                                    subject_id: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                <NoteText size="20" />
                                <span>Kuis</span>
                            </Link>
                            <Link
                                href={route("teacher.discussions.index", {
                                    subject: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                            >
                                <Message size="20" />
                                <span>Diskusi</span>
                            </Link>
                            <Link
                                type="button"
                                onClick={() =>
                                    window.location.assign(
                                        route(
                                            "teacher.subjects.export-grades",
                                            subject.id
                                        )
                                    )
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Printer size="20" />
                                <span>Export Nilai</span>
                            </Link>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Subject Info Section */}
                            <div className="md:col-span-2 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b flex-1">
                                    Informasi Mata Pelajaran
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="ml-4 p-1 rounded-full hover:bg-gray-100 text-gray-500"
                                    aria-label={
                                        showInfo
                                            ? "Sembunyikan informasi mata pelajaran"
                                            : "Tampilkan informasi mata pelajaran"
                                    }
                                >
                                    {showInfo ? (
                                        <ArrowUp2 size="18" />
                                    ) : (
                                        <ArrowDown2 size="18" />
                                    )}
                                </button>
                            </div>

                            {/* Info boxes */}
                            {showInfo && (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Nama Mata Pelajaran
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Book1
                                                size="20"
                                                className="text-amber-600"
                                            />
                                            <p className="text-lg font-medium text-gray-900">
                                                {subject.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Kelas
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <People
                                                size="20"
                                                className="text-blue-600"
                                            />
                                            <p className="text-lg font-medium text-gray-900">
                                                {subject.class_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Semester
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Calendar
                                                size="20"
                                                className="text-purple-600"
                                            />
                                            <p className="text-lg font-medium text-gray-900">
                                                {subject.semester_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Total Siswa
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <People
                                                size="20"
                                                className="text-green-600"
                                            />
                                            <p className="text-lg font-medium text-gray-900">
                                                {subject.student_count} Siswa
                                            </p>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Deskripsi
                                        </h3>
                                        <p className="text-gray-900">
                                            {subject.description ||
                                                "Belum ada deskripsi."}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Description */}

                            {/* Progress Summary */}
                            <div className="md:col-span-2 mt-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b flex-1">
                                    Ringkasan Pembelajaran
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowSummary(!showSummary)}
                                    className="ml-4 p-1 rounded-full hover:bg-gray-100 text-gray-500"
                                    aria-label={
                                        showSummary
                                            ? "Sembunyikan ringkasan pembelajaran"
                                            : "Tampilkan ringkasan pembelajaran"
                                    }
                                >
                                    {showSummary ? (
                                        <ArrowUp2 size="18" />
                                    ) : (
                                        <ArrowDown2 size="18" />
                                    )}
                                </button>
                            </div>

                            {showSummary && (
                                <>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Materi
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <DocumentText
                                                size="20"
                                                className="text-green-600"
                                            />
                                            <p className="text-lg font-medium text-gray-900">
                                                {subject.materials_count || 0}{" "}
                                                Materi Diunggah
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Tugas Dibuat
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <ClipboardText
                                                size="20"
                                                className="text-amber-600"
                                            />
                                            <p className="text-lg font-medium text-gray-900">
                                                {subject.assignments_count || 0}{" "}
                                                Tugas Dibuat
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Sesi Presensi
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Calendar
                                                size="20"
                                                className="text-purple-600"
                                            />
                                            <p className="text-lg font-medium text-gray-900">
                                                {subject.attendance_count || 0}{" "}
                                                Sesi Dibuat
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                                            Tugas Menunggu Dinilai
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <ClipboardText
                                                size="20"
                                                className="text-red-600"
                                            />
                                            <p className="text-lg font-medium text-gray-900">
                                                {subject.pending_submissions_count ||
                                                    0}{" "}
                                                Pengumpulan Menunggu
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Student List */}
                            <div className="md:col-span-2 mt-4">
                                <div className="flex items-center justify-between pb-2 border-b mb-4">
                                    <h2 className="text-lg font-semibold text-gray-700">
                                        Enrolled Students
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowStudents(!showStudents)
                                        }
                                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                                        aria-label={
                                            showStudents
                                                ? "Sembunyikan daftar siswa"
                                                : "Tampilkan daftar siswa"
                                        }
                                    >
                                        {showStudents ? (
                                            <ArrowUp2 size="18" />
                                        ) : (
                                            <ArrowDown2 size="18" />
                                        )}
                                    </button>
                                </div>

                                {showStudents &&
                                subject.students &&
                                subject.students.length > 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            NISN
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Gender
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Assignments
                                                            Completed
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Attendance Rate
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subject.students.map(
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
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {
                                                                        student.gender
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {student.completed_assignments ||
                                                                        0}
                                                                    /
                                                                    {subject.assignments_count ||
                                                                        0}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {student.attendance_rate ||
                                                                        "0%"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    showStudents && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-500 italic">
                                                Belum ada siswa yang terdaftar
                                                pada mata pelajaran ini.
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Semua Aktivitas */}
                            <div className="md:col-span-2 mt-6">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b mb-3">
                                    Semua Aktivitas Mata Pelajaran
                                </h2>
                                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                                    <div className="divide-y divide-gray-100">
                                        {(subject.recent_activities || [])
                                            .length > 0 ? (
                                            subject.recent_activities.map(
                                                (activity, index) => (
                                                    <Link
                                                        key={index}
                                                        href={
                                                            activity.url || "#"
                                                        }
                                                        className="px-4 md:px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {activity.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {activity.type}{" "}
                                                                •{" "}
                                                                {activity.date}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                )
                                            )
                                        ) : (
                                            <div className="px-4 md:px-6 py-4 text-sm text-gray-500">
                                                Belum ada aktivitas untuk mata
                                                pelajaran ini (materi, tugas,
                                                kuis, presensi, atau diskusi).
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("teacher.subjects.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Kembali ke Daftar Mapel
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherSubjectShow;
