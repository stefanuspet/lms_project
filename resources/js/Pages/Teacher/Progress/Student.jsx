import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    BookSquare,
    People,
    ClipboardTick,
    DocumentText,
    TickCircle,
    CloseCircle,
    InfoCircle,
    Clock,
    Eye,
    Teacher,
    Chart,
    ArrowUp,
    UserOctagon,
    Calendar,
    ChartSuccess,
    MessageText,
} from "iconsax-reactjs";

const TeacherProgressStudent = ({
    student,
    subjects,
    attendance_stats,
    overall_stats,
}) => {
    const [activeTab, setActiveTab] = useState("overview");

    // Get status indicator for submission
    const getSubmissionStatus = (submitted, graded, late) => {
        if (!submitted) {
            return (
                <CloseCircle
                    size="16"
                    className="text-red-500"
                    title="Not Submitted"
                />
            );
        } else if (graded) {
            return (
                <TickCircle
                    size="16"
                    className="text-green-500"
                    title="Graded"
                />
            );
        } else if (late) {
            return (
                <Clock
                    size="16"
                    className="text-orange-500"
                    title="Late Submission"
                />
            );
        } else {
            return (
                <InfoCircle
                    size="16"
                    className="text-blue-500"
                    title="Pending Grading"
                />
            );
        }
    };

    // Get grade display with color
    const getGradeDisplay = (grade) => {
        if (grade === null) return "-";

        let colorClass;
        if (grade >= 90) colorClass = "text-green-600";
        else if (grade >= 75) colorClass = "text-blue-600";
        else if (grade >= 60) colorClass = "text-yellow-600";
        else colorClass = "text-red-600";

        return <span className={`font-bold ${colorClass}`}>{grade}</span>;
    };

    // Get progress color based on rate
    const getProgressColor = (rate) => {
        if (rate >= 90) return "bg-green-500";
        if (rate >= 75) return "bg-blue-500";
        if (rate >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <TeacherLayout title={`Progres Siswa: ${student.name}`}>
            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.progress.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Progres Siswa
                            </h1>
                        </div>
                    </div>

                    {/* Student Profile */}
                    <div className="p-6 border-b">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Student Info */}
                            <div className="w-full md:w-1/3">
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                                            <UserOctagon
                                                variant="Bold"
                                                size="48"
                                                className="text-gray-500"
                                            />
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 text-center">
                                        {student.name}
                                    </h2>
                                    <p className="text-gray-500 text-center mb-4">
                                        NISN: {student.nisn}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-blue-50 p-2 rounded">
                                            <p className="text-xs text-blue-600">
                                                Jenis Kelamin
                                            </p>
                                            <p className="text-sm font-medium text-blue-800">
                                                {student.gender === "male"
                                                    ? "Laki-laki"
                                                    : "Perempuan"}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded">
                                            <p className="text-xs text-purple-600">
                                                Kelas
                                            </p>
                                            <p className="text-sm font-medium text-purple-800">
                                                {student.classes.length > 0
                                                    ? student.classes[0].name
                                                    : "Belum ditempatkan"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Overall Stats */}
                            <div className="w-full md:w-2/3">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-blue-700 mb-3">
                                        Performa Akademik
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white p-3 rounded border border-blue-100">
                                            <p className="text-xs text-gray-500">
                                                Nilai Rata-rata
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <ChartSuccess
                                                    size="20"
                                                    className={`
                                                    ${
                                                        overall_stats.average_grade >=
                                                        90
                                                            ? "text-green-600"
                                                            : overall_stats.average_grade >=
                                                              75
                                                            ? "text-blue-600"
                                                            : overall_stats.average_grade >=
                                                              60
                                                            ? "text-yellow-600"
                                                            : "text-red-600"
                                                    }`}
                                                />
                                                {overall_stats.average_grade ||
                                                    0}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-blue-100">
                                            <p className="text-xs text-gray-500">
                                                Persentase Penyelesaian
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <Chart
                                                    size="20"
                                                    className="text-blue-600"
                                                />
                                                {overall_stats.completion_rate ||
                                                    0}
                                                %
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-blue-100">
                                            <p className="text-xs text-gray-500">
                                                Tugas
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <ClipboardTick
                                                    size="20"
                                                    className="text-purple-600"
                                                />
                                                {overall_stats.submitted_assignments ||
                                                    0}
                                                /
                                                {overall_stats.total_assignments ||
                                                    0}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-blue-100">
                                            <p className="text-xs text-gray-500">
                                                Sudah Dinilai
                                            </p>
                                            <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <MessageText
                                                    size="20"
                                                    className="text-amber-600"
                                                />
                                                {overall_stats.graded_submissions ||
                                                    0}
                                                /
                                                {overall_stats.submitted_assignments ||
                                                    0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                        {/* Tab Navigasi */}
                    <div className="px-6 pt-4 border-b">
                        <div className="flex space-x-6">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`pb-3 ${
                                    activeTab === "overview"
                                        ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Ringkasan
                            </button>
                            <button
                                onClick={() => setActiveTab("assignments")}
                                className={`pb-3 ${
                                    activeTab === "assignments"
                                        ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Tugas
                            </button>
                            <button
                                onClick={() => setActiveTab("attendance")}
                                className={`pb-3 ${
                                    activeTab === "attendance"
                                        ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Kehadiran
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Tab Ringkasan */}
                        {activeTab === "overview" && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                    Ringkasan Performa Mata Pelajaran
                                </h2>

                                {subjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {subjects.map((subject) => (
                                            <div
                                                key={subject.id}
                                                className="bg-gray-50 p-4 rounded-lg"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-medium text-gray-800">
                                                            {subject.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {subject.class_name}
                                                        </p>
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            "teacher.progress.subject",
                                                            subject.id
                                                        )}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye size="20" />
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Penyelesaian Tugas
                                                        </p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {
                                                                    subject.submitted_assignments
                                                                }
                                                                /
                                                                {
                                                                    subject.total_assignments
                                                                }
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {
                                                                    subject.completion_rate
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-200 rounded-full mt-1">
                                                            <div
                                                                className={`${getProgressColor(
                                                                    subject.completion_rate
                                                                )} h-1.5 rounded-full`}
                                                                style={{
                                                                    width: `${subject.completion_rate}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Nilai Rata-rata
                                                        </p>
                                                        <p
                                                            className={`text-xl font-bold ${
                                                                subject.average_grade >=
                                                                90
                                                                    ? "text-green-600"
                                                                    : subject.average_grade >=
                                                                      75
                                                                    ? "text-blue-600"
                                                                    : subject.average_grade >=
                                                                      60
                                                                    ? "text-yellow-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {subject.average_grade ||
                                                                "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {attendance_stats[
                                                    subject.id
                                                ] && (
                                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            Kehadiran
                                                        </p>
                                                        <div className="grid grid-cols-4 gap-2 text-center">
                                                            <div className="bg-white p-1 rounded text-xs">
                                                                <span className="text-gray-500">
                                                                    Hadir
                                                                </span>
                                                                <p className="font-medium text-green-600">
                                                                    {
                                                                        attendance_stats[
                                                                            subject
                                                                                .id
                                                                        ]
                                                                            .present_count
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="bg-white p-1 rounded text-xs">
                                                                <span className="text-gray-500">
                                                                    Alpha
                                                                </span>
                                                                <p className="font-medium text-red-600">
                                                                    {
                                                                        attendance_stats[
                                                                            subject
                                                                                .id
                                                                        ]
                                                                            .absent_count
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="bg-white p-1 rounded text-xs">
                                                                <span className="text-gray-500">
                                                                    Izin
                                                                </span>
                                                                <p className="font-medium text-orange-600">
                                                                    {
                                                                        attendance_stats[
                                                                            subject
                                                                                .id
                                                                        ]
                                                                            .excused_count
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="bg-white p-1 rounded text-xs">
                                                                <span className="text-gray-500">
                                                                    Persentase
                                                                </span>
                                                                <p className="font-medium text-blue-600">
                                                                    {
                                                                        attendance_stats[
                                                                            subject
                                                                                .id
                                                                        ]
                                                                            .attendance_rate
                                                                    }
                                                                    %
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                                        <Calendar
                                            size="48"
                                            className="text-gray-300 mx-auto mb-2"
                                        />
                                        <p className="text-gray-600 font-medium">
                                            Tidak ada data kehadiran
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Tidak ada catatan kehadiran untuk
                                            siswa ini pada semester berjalan.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tombol Aksi */}
                        <div className="mt-6 flex justify-end">
                            <Link
                                href={route("teacher.progress.index")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Kembali ke Ringkasan Progres
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherProgressStudent;
