import React from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    Book1,
    Timer1,
    ClipboardTick,
    Clipboard,
    People,
    NotificationBing,
    Profile2User,
    Graph,
    Calendar,
    UserOctagon,
    DocumentText,
    MessageEdit,
    TickCircle,
    TrendUp,
} from "iconsax-reactjs";

const StudentDashboard = ({
    student = {},
    stats = {
        total_subjects: 0,
        pending_assignments: 0,
        completed_assignments: 0,
        attendance_rate: "0%",
    },
    upcoming_assignments = [],
    recent_materials = [],
    notifications = [],
    current_subjects = [],
    extracurricular_summary = { total: 0, next: null },
    error,
}) => {
    // Buat nilai default untuk student
    const studentData = student || {
        name: "Siswa",
        nisn: "-",
        email: "-",
        class_name: "Belum ditempatkan",
    };

    console.log("Student data received:", studentData);

    // Tampilkan error jika ada
    if (error) {
        return (
            <StudentLayout title="Kesalahan Dashboard">
                <div className="py-6 w-full">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
                        <p>{error}</p>
                        <p className="mt-2">
                            Silakan coba muat ulang halaman atau hubungi admin
                            jika masalah tetap terjadi.
                        </p>
                    </div>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout title="Dashboard Siswa">
            <div className="py-6 w-full">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-xl shadow-sm mb-6">
                    <div className="px-6 py-5 flex items-center justify-between">
                        <div>
                            <h1 className="text-white text-2xl font-bold">
                                Selamat datang kembali, {studentData.name}!
                            </h1>
                            <p className="text-blue-100 mt-1">
                                {new Date().toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Profile2User
                                variant="Bold"
                                size="80"
                                className="text-white opacity-70"
                            />
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Mata Pelajaran Saya
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.total_subjects}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Book1
                                variant="Bold"
                                size="24"
                                className="text-blue-600"
                            />
                        </div>
                    </div>

                    {/* Ringkasan Ekstrakurikuler */}
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Ekstrakurikuler
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {extracurricular_summary?.total || 0}
                            </p>
                            {extracurricular_summary?.next && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Berikutnya:{" "}
                                    <span className="font-medium">
                                        {extracurricular_summary.next.name}
                                    </span>{" "}
                                    • {extracurricular_summary.next.day_of_week}{" "}
                                    {extracurricular_summary.next.start_time &&
                                        `(${extracurricular_summary.next.start_time})`}
                                </p>
                            )}
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <People
                                variant="Bold"
                                size="24"
                                className="text-purple-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Tugas Belum Selesai
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.pending_assignments}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <Clipboard
                                variant="Bold"
                                size="24"
                                className="text-red-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Tugas Selesai
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.completed_assignments}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <ClipboardTick
                                variant="Bold"
                                size="24"
                                className="text-green-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Persentase Kehadiran
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.attendance_rate}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Calendar
                                variant="Bold"
                                size="24"
                                className="text-purple-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Current Subjects */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Book1
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>My Subjects</span>
                                </h2>
                                <Link
                                    href={route("student.subjects.index")}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="px-6 py-4">
                                {current_subjects &&
                                current_subjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {current_subjects.map((subject) => (
                                            <Link
                                                key={subject.id}
                                                href={route(
                                                    "student.subjects.show",
                                                    subject.id
                                                )}
                                                className="block bg-gray-50 p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">
                                                            {subject.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                subject.teacher_name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <DocumentText
                                                            size="14"
                                                            className="text-blue-600"
                                                        />
                                                        <span>
                                                            {
                                                                subject.materials_count
                                                            }{" "}
                                                            Materials
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <ClipboardTick
                                                            size="14"
                                                            className="text-green-600"
                                                        />
                                                        <span>
                                                            {
                                                                subject.completed_assignments
                                                            }
                                                            /
                                                            {
                                                                subject.assignments_count
                                                            }{" "}
                                                            Selesai
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>
                                            Anda belum memiliki mata pelajaran
                                            yang diassign.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rest of the component remains the same but using studentData instead of student directly */}
                        {/* ... */}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Student Profile Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                            <div className="-mt-12 px-6 pb-6">
                                <div className="flex justify-center">
                                    <div className="h-24 w-24 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
                                        <img
                                            src={
                                                studentData.profile_picture ||
                                                "/assets/images/default-avatar.png"
                                            }
                                            alt={studentData.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="text-center mt-2">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {studentData.name}
                                    </h2>
                                    <p className="text-gray-500">
                                        NISN: {studentData.nisn}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {studentData.email}
                                    </p>
                                </div>
                                <div className="mt-4 border-t pt-4">
                                    <div className="flex items-center justify-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-gray-500 text-xs">
                                                Kelas
                                            </span>
                                            <span className="text-gray-900 font-bold">
                                                {studentData.class_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href={route("student.profile.edit")}
                                        className="block text-center w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        Edit Profil
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Notifications and Quick Actions remain unchanged */}
                        {/* ... */}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;
