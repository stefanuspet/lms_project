import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import {
    ArrowLeft2,
    DocumentDownload,
    Calendar,
    Clock,
    Profile2User,
    Document,
    Video,
    Gallery,
    MessageText,
    Medal,
    ClipboardTick,
} from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherSubmissionShow = ({ submission, assignment, subject }) => {
    // State for grade form
    const { data, setData, post, processing, errors } = useForm({
        grade: submission.grade || "",
        message_eval: submission.message_eval || "",
    });

    // Function to handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("teacher.submissions.grade", submission.id));
    };

    // Get icon for file type
    const getFileTypeIcon = (fileType) => {
        if (!fileType) return <Document size="20" className="text-gray-600" />;

        if (fileType.includes("pdf")) {
            return <Document size="20" className="text-red-600" />;
        } else if (fileType.includes("video")) {
            return <Video size="20" className="text-blue-600" />;
        } else if (fileType.includes("image")) {
            return <Gallery size="20" className="text-green-600" />;
        } else if (fileType.includes("word") || fileType.includes("doc")) {
            return <Document size="20" className="text-blue-600" />;
        } else if (
            fileType.includes("excel") ||
            fileType.includes("sheet") ||
            fileType.includes("xls")
        ) {
            return <Document size="20" className="text-green-600" />;
        } else if (
            fileType.includes("ppt") ||
            fileType.includes("presentation")
        ) {
            return <Document size="20" className="text-amber-600" />;
        } else {
            return <Document size="20" className="text-gray-600" />;
        }
    };

    return (
        <TeacherLayout title={`Nilai Pengumpulan - ${assignment.title}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route(
                                    "teacher.submissions.index",
                                    assignment.id
                                )}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Pengumpulan Siswa
                                </h1>
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <span>
                                        {subject.name} - {assignment.title}
                                    </span>
                                    <span className="mx-1">•</span>
                                    <Calendar
                                        size="14"
                                        className={
                                            assignment.is_past_deadline
                                                ? "text-red-500"
                                                : "text-green-500"
                                        }
                                    />
                                    <span>Batas waktu: {assignment.deadline}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Informasi Siswa dan Pengumpulan */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Informasi Siswa */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-3">
                                        <Profile2User
                                            size="20"
                                            className="text-blue-600"
                                        />
                                        <span>Informasi Siswa</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Nama
                                            </p>
                                            <p className="text-base font-medium">
                                                {submission.student.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                NISN
                                            </p>
                                            <p className="text-base font-medium">
                                                {submission.student.nisn}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Informasi Pengumpulan */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-3">
                                        <ClipboardTick
                                            size="20"
                                            className="text-green-600"
                                        />
                                        <span>Detail Pengumpulan</span>
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock
                                                    size="18"
                                                    className="text-gray-600"
                                                />
                                                <span className="text-sm text-gray-500">
                                                    Dikumpulkan pada:
                                                </span>
                                            </div>
                                            <span className="text-base font-medium">
                                                {submission.submitted_at}
                                                {submission.is_late && (
                                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                                                        Terlambat
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Konten Pengumpulan */}
                                <div>
                                    <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-3">
                                        <MessageText
                                            size="20"
                                            className="text-purple-600"
                                        />
                                        <span>Konten Pengumpulan</span>
                                    </h3>

                                    {submission.submission_text ? (
                                        <div className="prose max-w-none bg-white border rounded-lg p-4">
                                            {submission.submission_text
                                                .split("\n")
                                                .map((paragraph, index) => (
                                                    <p
                                                        key={index}
                                                        className="mb-4"
                                                    >
                                                        {paragraph}
                                                    </p>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">
                                            Tidak ada teks yang dikumpulkan.
                                        </p>
                                    )}
                                </div>

                                {/* Berkas Pengumpulan */}
                                {submission.file_path && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-3">
                                            <Document
                                                size="20"
                                                className="text-amber-600"
                                            />
                                            <span>Berkas yang Dikumpulkan</span>
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getFileTypeIcon(
                                                    submission.file_path
                                                )}
                                                <span className="text-base">
                                                    {submission.file_path
                                                        .split("/")
                                                        .pop()}
                                                </span>
                                            </div>
                                            <a
                                                href={submission.file_path}
                                                target="_blank"
                                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                            >
                                                <DocumentDownload size="18" />
                                                <span>Unduh</span>
                                            </a>
                                        </div>

                                        {/* Pratinjau untuk tipe berkas yang didukung */}
                                        {submission.file_path && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-600 mb-2">
                                                    Pratinjau:
                                                </h4>
                                                {submission.file_path.includes(
                                                    ".pdf"
                                                ) && (
                                                    <div className="border rounded-lg overflow-hidden h-96">
                                                        <iframe
                                                            src={`${submission.file_path}#toolbar=0`}
                                                            className="w-full h-full"
                                                            title="PDF Preview"
                                                        />
                                                    </div>
                                                )}

                                                {(submission.file_path.includes(
                                                    ".jpg"
                                                ) ||
                                                    submission.file_path.includes(
                                                        ".jpeg"
                                                    ) ||
                                                    submission.file_path.includes(
                                                        ".png"
                                                    ) ||
                                                    submission.file_path.includes(
                                                        ".gif"
                                                    )) && (
                                                    <div className="border rounded-lg overflow-hidden flex justify-center">
                                                        <img
                                                            src={
                                                                submission.file_path
                                                            }
                                                            alt="Submission"
                                                            className="max-h-96 object-contain"
                                                        />
                                                    </div>
                                                )}

                                                {(submission.file_path.includes(
                                                    ".mp4"
                                                ) ||
                                                    submission.file_path.includes(
                                                        ".webm"
                                                    ) ||
                                                    submission.file_path.includes(
                                                        ".mov"
                                                    )) && (
                                                    <div className="border rounded-lg overflow-hidden">
                                                        <video
                                                            src={
                                                                submission.file_path
                                                            }
                                                            controls
                                                            className="w-full max-h-96"
                                                        />
                                                    </div>
                                                )}

                                                {!submission.file_path.includes(
                                                    ".pdf"
                                                ) &&
                                                    !submission.file_path.includes(
                                                        ".jpg"
                                                    ) &&
                                                    !submission.file_path.includes(
                                                        ".jpeg"
                                                    ) &&
                                                    !submission.file_path.includes(
                                                        ".png"
                                                    ) &&
                                                    !submission.file_path.includes(
                                                        ".gif"
                                                    ) &&
                                                    !submission.file_path.includes(
                                                        ".mp4"
                                                    ) &&
                                                    !submission.file_path.includes(
                                                        ".webm"
                                                    ) &&
                                                    !submission.file_path.includes(
                                                        ".mov"
                                                    ) && (
                                                        <p className="text-gray-500 italic">
                                                            Pratinjau tidak
                                                            tersedia untuk
                                                            tipe berkas ini.
                                                            Silakan unduh
                                                            berkas untuk
                                                            melihatnya.
                                                        </p>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Form Penilaian */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700 mb-3">
                                        <Medal
                                            size="20"
                                            className="text-amber-600"
                                        />
                                        <span>Nilai Pengumpulan</span>
                                    </h3>

                                    <form onSubmit={handleSubmit}>
                                        <div className="space-y-4">
                                            {/* Input Nilai */}
                                            <div>
                                                <InputLabel
                                                    htmlFor="grade"
                                                    value="Nilai (0-100)"
                                                    className="text-base mb-1"
                                                />
                                                <TextInput
                                                    id="grade"
                                                    type="number"
                                                    name="grade"
                                                    value={data.grade}
                                                    className="block w-full"
                                                    onChange={handleChange}
                                                    required
                                                    min="0"
                                                    max="100"
                                                />
                                                <InputError
                                                    message={errors.grade}
                                                    className="mt-2"
                                                />
                                            </div>

                                            {/* Input Umpan Balik */}
                                            <div>
                                                <InputLabel
                                                    htmlFor="message_eval"
                                                    value="Umpan balik untuk siswa"
                                                    className="text-base mb-1"
                                                />
                                                <textarea
                                                    id="message_eval"
                                                    name="message_eval"
                                                    value={data.message_eval}
                                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                    onChange={handleChange}
                                                    rows={6}
                                                    placeholder="Berikan umpan balik untuk pengumpulan ini..."
                                                />
                                                <InputError
                                                    message={
                                                        errors.message_eval
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>

                                            {/* Tombol Simpan Nilai */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-75"
                                                >
                                                    {submission.grade !== null
                                                        ? "Perbarui Nilai"
                                                        : "Simpan Nilai"}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Informasi Penilaian */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                                        Tips Penilaian
                                    </h3>
                                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                        <li>
                                            Berikan umpan balik yang jelas dan
                                            membangun
                                        </li>
                                        <li>
                                            Pertimbangkan usaha dan ketepatan
                                        </li>
                                        <li>Nilai dalam rentang 0-100</li>
                                        <li>
                                            Siswa akan diberi notifikasi saat
                                            nilai diberikan
                                        </li>
                                        <li>
                                            Anda dapat memperbarui nilai kapan
                                            saja
                                        </li>
                                    </ul>
                                </div>

                                {/* Navigasi */}
                                <div className="space-y-2">
                                    <Link
                                        href={route(
                                            "teacher.submissions.index",
                                            assignment.id
                                        )}
                                        className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                    >
                                        Kembali ke Semua Pengumpulan
                                    </Link>
                                    <Link
                                        href={route(
                                            "teacher.assignments.show",
                                            assignment.id
                                        )}
                                        className="block w-full px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-center"
                                    >
                                        Lihat Detail Tugas
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherSubmissionShow;
