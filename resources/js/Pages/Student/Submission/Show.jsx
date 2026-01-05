import React from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    ArrowLeft2,
    ClipboardText,
    Calendar,
    Clock,
    ClipboardTick,
    DocumentDownload,
    DocumentText,
    Book1,
    Information,
    MessageEdit,
    TickCircle,
} from "iconsax-reactjs";

const StudentSubmissionShow = ({ submission, can_resubmit }) => {
    console.log("Subject ID:", submission);
    return (
        <StudentLayout title="Submission Details">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route(
                                    "student.assignments.show",
                                    submission.assignment.id
                                )}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Submission Details
                            </h1>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            {submission.file_path && (
                                <a
                                    href={`/storage/${submission.file_path}`}
                                    download
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    <DocumentDownload size="20" />
                                    <span>Unduh Pengumpulan</span>
                                </a>
                            )}

                            {can_resubmit && (
                                <Link
                                    href={route(
                                        "student.assignments.submit",
                                        submission.assignment.id
                                    )}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <ClipboardTick size="20" />
                                    <span>Resubmit</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Assignment Info */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <ClipboardText
                                                    size="24"
                                                    className="text-blue-600"
                                                />
                                            </div>
                                            <div>
                                                <Link
                                                    href={route(
                                                        "student.assignments.show",
                                                        submission.assignment.id
                                                    )}
                                                    className="font-semibold text-blue-800 hover:text-blue-600 transition-colors"
                                                >
                                                    {
                                                        submission.assignment
                                                            .title
                                                    }
                                                </Link>
                                                <p className="text-sm text-blue-700">
                                                    {
                                                        submission.assignment
                                                            .subject_name
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-blue-700 flex items-center gap-2">
                                            <Calendar size="16" />
                                            <span>
                                                Due:{" "}
                                                {submission.assignment.deadline}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submission Status Card */}
                                <div
                                    className={`p-4 rounded-lg ${
                                        submission.grade !== null
                                            ? "bg-green-50 border border-green-200"
                                            : submission.is_late
                                            ? "bg-yellow-50 border border-yellow-200"
                                            : "bg-blue-50 border border-blue-200"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {submission.grade !== null ? (
                                            <div className="p-2 bg-green-100 rounded-full">
                                                <TickCircle
                                                    size="20"
                                                    className="text-green-600"
                                                />
                                            </div>
                                        ) : submission.is_late ? (
                                            <div className="p-2 bg-yellow-100 rounded-full">
                                                <Clock
                                                    size="20"
                                                    className="text-yellow-600"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <TickCircle
                                                    size="20"
                                                    className="text-blue-600"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <h3
                                                className={`font-semibold ${
                                                    submission.grade !== null
                                                        ? "text-green-800"
                                                        : submission.is_late
                                                        ? "text-yellow-800"
                                                        : "text-blue-800"
                                                }`}
                                            >
                                                {submission.grade !== null
                                                    ? "Graded"
                                                    : submission.is_late
                                                    ? "Submitted Late"
                                                    : "Submitted On Time"}
                                            </h3>

                                            <p
                                                className={`text-sm mt-1 ${
                                                    submission.grade !== null
                                                        ? "text-green-700"
                                                        : submission.is_late
                                                        ? "text-yellow-700"
                                                        : "text-blue-700"
                                                }`}
                                            >
                                                {submission.submitted_at}
                                            </p>
                                        </div>

                                        {submission.grade !== null && (
                                            <div className="ml-auto">
                                                <div className="bg-white px-4 py-2 rounded-lg">
                                                    <p className="text-sm text-gray-500">
                                                        Nilai Anda
                                                    </p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {submission.grade}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Submission File */}
                                {submission.file_path && (
                                    <div className="bg-gray-50 p-5 rounded-lg border mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <DocumentText
                                                        size="24"
                                                        className="text-blue-600"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        Submitted File
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {submission.file_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={`/storage/${submission.file_path}`}
                                                download
                                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                                            >
                                                <DocumentDownload size="16" />
                                                <span>Unduh</span>
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Teks Pengumpulan */}
                                {submission.submission_text && (
                                    <div className="bg-white rounded-lg border p-5">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <MessageEdit
                                                size="20"
                                                className="text-blue-600"
                                            />
                                            <span>Teks Pengumpulan</span>
                                        </h3>

                                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                                            {submission.submission_text
                                                .split("\n")
                                                .map((paragraph, idx) => (
                                                    <p
                                                        key={idx}
                                                        className="mb-3"
                                                    >
                                                        {paragraph}
                                                    </p>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Umpan Balik Guru */}
                                {submission.grade !== null && (
                                    <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                                        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                                            <TickCircle
                                                size="20"
                                                className="text-green-600"
                                            />
                                            <span>Umpan Balik Guru</span>
                                        </h3>

                                        {submission.message_eval ? (
                                            <div className="bg-white p-4 rounded-lg text-gray-700">
                                                {submission.message_eval
                                                    .split("\n")
                                                    .map((paragraph, idx) => (
                                                        <p
                                                            key={idx}
                                                            className="mb-3"
                                                        >
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-green-700 italic">
                                                Tidak ada catatan khusus dari
                                                guru.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Kartu Informasi Pengumpulan */}
                                <div className="bg-white rounded-xl shadow-sm border p-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <ClipboardTick
                                            size="20"
                                            className="text-blue-600"
                                        />
                                        <span>Informasi Pengumpulan</span>
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">
                                                Dikumpulkan pada
                                            </p>
                                            <p className="font-medium text-gray-800">
                                                {submission.submitted_at}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">
                                                Status
                                            </p>
                                            <p
                                                className={`font-medium ${
                                                    submission.grade !== null
                                                        ? "text-green-600"
                                                        : submission.is_late
                                                        ? "text-yellow-600"
                                                        : "text-blue-600"
                                                }`}
                                            >
                                                {submission.grade !== null
                                                    ? "Sudah Dinilai"
                                                    : submission.is_late
                                                    ? "Terlambat Mengumpulkan"
                                                    : "Tepat Waktu"}
                                            </p>
                                        </div>

                                        {submission.grade !== null && (
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">
                                                    Nilai
                                                </p>
                                                <p className="font-bold text-2xl text-green-600">
                                                    {submission.grade}
                                                </p>
                                            </div>
                                        )}

                                        <div className="pt-3 border-t">
                                            {can_resubmit && (
                                                <Link
                                                    href={route(
                                                        "student.assignments.submit",
                                                        submission.assignment.id
                                                    )}
                                                    className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Kirim Ulang Tugas
                                                </Link>
                                            )}

                                            <Link
                                                href={route(
                                                    "student.assignments.show",
                                                    submission.assignment.id
                                                )}
                                                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mt-2"
                                            >
                                                Lihat Detail Tugas
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Kartu Mata Pelajaran */}
                                <div className="bg-blue-50 rounded-xl shadow-sm p-5 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        <Book1
                                            size="20"
                                            className="text-blue-600"
                                        />
                                        <span>Informasi Mata Pelajaran</span>
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-blue-800 font-medium">
                                                Mata Pelajaran
                                            </p>
                                            <p className="text-blue-700">
                                                {
                                                    submission.assignment
                                                        .subject_name
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-blue-200">
                                        <Link
                                            href={route(
                                                "student.subjects.show",
                                                {
                                                    subject:
                                                        submission.assignment
                                                            .subject_id,
                                                }
                                            )}
                                            className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Buka Halaman Mata Pelajaran
                                        </Link>
                                    </div>
                                </div>

                                {/* Kartu Informasi Tambahan */}
                                {!submission.grade && (
                                    <div className="bg-amber-50 rounded-xl shadow-sm p-5 border border-amber-100">
                                        <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                            <Information
                                                size="20"
                                                className="text-amber-600"
                                            />
                                            <span>Status Pengumpulan</span>
                                        </h3>

                                        <p className="text-sm text-amber-700 mb-3">
                                            Pengumpulan Anda sudah diterima dan
                                            menunggu untuk dinilai oleh guru.
                                            Anda akan menerima notifikasi
                                            setelah nilai diberikan.
                                        </p>

                                        {can_resubmit && (
                                            <p className="text-sm text-amber-700">
                                                Anda masih dapat mengirim ulang
                                                tugas ini sampai batas waktu.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex justify-between">
                        <Link
                            href={route(
                                "student.assignments.show",
                                submission.assignment.id
                            )}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft2 size="18" />
                            <span>Kembali ke Tugas</span>
                        </Link>

                        <Link
                            href={route("student.assignments.index")}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Lihat Semua Tugas
                        </Link>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentSubmissionShow;
