import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";
import { usePage } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import StudentsGenderChart from "@/Components/StudentsGenderChart";
import CardCount from "@/Components/CardCount";
import RecentActivities from "@/Components/RecentActivities";
import StudentsProgressChart from "@/Components/StudentsProgressChart";
import NotificationCard from "@/Components/NotificationCard";
import StatCard from "@/Components/StatCard";
import QuickActionButton from "@/Components/QuickActionButton";
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
    Teacher,
} from "iconsax-reactjs";

const Dashboard = () => {
    const {
        studentsCount,
        teachersCount,
        boysCount,
        girlsCount,
        classesCount,
        subjectsCount,
        systemStats,
        notifications,
        recentActivities,
        registrationChart,
        activePeriod,
    } = usePage().props;
    console.log(recentActivities);

    // Quick actions data
    const quickActions = [
        {
            label: "Kelola Guru",
            icon: Teacher,
            href: "/admin/teachers",
            color: "amber",
        },
        {
            label: "Kelola Siswa",
            icon: Profile2User,
            href: "/admin/students",
            color: "sky",
        },
        {
            label: "Kelola Kelas",
            icon: Book1,
            href: "/admin/classes",
            color: "blue",
        },
        {
            label: "Kelola Mata Pelajaran",
            icon: DocumentText,
            href: "/admin/subjects",
            color: "green",
        },
    ];

    return (
        <AuthenticatedLayout title="Dashboard">
            <div className="w-full">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-400 rounded-xl shadow-sm mb-4 sm:mb-6">
                    <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
                        <div>
                            <h1 className="text-white text-xl sm:text-2xl font-bold">
                                Dashboard Administrator
                            </h1>
                            <p className="text-purple-100 text-sm sm:text-base mt-1">
                                {new Date().toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="hidden sm:block">
                            <People
                                variant="Bold"
                                size="80"
                                className="text-white opacity-70"
                            />
                        </div>
                    </div>
                </div>

                {/* Periode aktif & ringkasan hari ini */}
                <div className="mb-4 sm:mb-6">
                    <div className="bg-white rounded-xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100">
                        <div className="flex items-start gap-3">
                            <Calendar
                                size="28"
                                className="text-amber-500 mt-1 flex-shrink-0"
                            />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Periode Akademik Aktif
                                </p>
                                <div className="mt-1 text-sm sm:text-base text-gray-800">
                                    <div>
                                        Tahun Ajar:{" "}
                                        <span className="font-semibold">
                                            {activePeriod?.academic_year
                                                ? activePeriod.academic_year
                                                      .name
                                                : "Belum diatur"}
                                        </span>
                                    </div>
                                    {activePeriod?.academic_year
                                        ?.formatted_period && (
                                        <div className="text-xs text-gray-500">
                                            Periode:{" "}
                                            {
                                                activePeriod.academic_year
                                                    .formatted_period
                                            }
                                        </div>
                                    )}
                                    <div className="mt-1">
                                        Semester:{" "}
                                        <span className="font-semibold">
                                            {activePeriod?.semester
                                                ? activePeriod.semester.name
                                                : "Belum diatur"}
                                        </span>
                                        {activePeriod?.semester
                                            ?.formatted_period && (
                                            <span className="ml-1 text-xs text-gray-500">
                                                (
                                                {
                                                    activePeriod.semester
                                                        .formatted_period
                                                }
                                                )
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs sm:text-sm text-amber-900">
                            <p className="font-semibold mb-1">
                                Ringkasan jadwal hari ini
                            </p>
                            <p>
                                Pelajaran:{" "}
                                <span className="font-semibold">
                                    {activePeriod?.today?.schedules ?? 0}
                                </span>{" "}
                                | Ekstrakurikuler:{" "}
                                <span className="font-semibold">
                                    {activePeriod?.today?.extracurriculars ?? 0}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <CardCount
                        title="Total Siswa"
                        count={studentsCount}
                        icon={Profile2User}
                        color="sky"
                    />
                    <CardCount
                        title="Total Guru"
                        count={teachersCount}
                        icon={Teacher}
                        color="amber"
                    />
                    <CardCount
                        title="Total Kelas"
                        count={classesCount}
                        icon={Book1}
                        color="blue"
                    />
                    <CardCount
                        title="Mata Pelajaran"
                        count={subjectsCount}
                        icon={DocumentText}
                        color="green"
                    />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* First Row - Charts */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-2">
                        <div className="h-60 sm:h-72 bg-white rounded-xl shadow-sm">
                            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b flex items-center gap-2">
                                <Profile2User
                                    size="18"
                                    className="text-sky-600"
                                />
                                <h2 className="font-bold text-sm sm:text-base text-gray-800">
                                    Distribusi Gender
                                </h2>
                            </div>
                            <StudentsGenderChart
                                boysCount={boysCount}
                                girlsCount={girlsCount}
                            />
                        </div>
                        <div className="h-60 sm:h-72 md:col-span-2 bg-white rounded-xl shadow-sm">
                            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendUp
                                        size="18"
                                        className="text-sky-600"
                                    />
                                    <h2 className="font-bold text-sm sm:text-base text-gray-800">
                                        Statistik Pendaftaran
                                    </h2>
                                </div>
                            </div>
                            <StudentsProgressChart
                                data={registrationChart || []}
                            />
                        </div>
                    </div>
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* System Statistics */}
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-3 sm:mb-4 border-b pb-2 sm:pb-3">
                                <Graph size="18" className="text-sky-600" />
                                <h2 className="font-bold text-sm sm:text-base text-gray-800">
                                    Statistik Sistem
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {systemStats.map((stat, index) => (
                                    <StatCard
                                        key={index}
                                        title={stat.title}
                                        value={stat.value}
                                        change={stat.change}
                                        period={stat.period}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Important Notifications */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <NotificationBing
                                        size="18"
                                        className="text-sky-600"
                                    />
                                    <h2 className="font-bold text-sm sm:text-base text-gray-800">
                                        Notifikasi Penting
                                    </h2>
                                </div>
                            </div>
                            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                {notifications.map((notification, index) => (
                                    <NotificationCard
                                        key={index}
                                        message={notification.message}
                                        type={notification.type}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Recent Activities */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Timer1
                                        size="18"
                                        className="text-sky-600"
                                    />
                                    <h2 className="font-bold text-sm sm:text-base text-gray-800">
                                        Aktivitas Terbaru
                                    </h2>
                                </div>
                                <Link
                                    href="/admin/activity-logs"
                                    className="text-xs sm:text-sm text-sky-600 hover:text-sky-800"
                                >
                                    Semua
                                </Link>
                            </div>
                            <RecentActivities activities={recentActivities} />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b flex items-center gap-2">
                                <TickCircle
                                    size="18"
                                    className="text-sky-600"
                                />
                                <h2 className="font-bold text-sm sm:text-base text-gray-800">
                                    Aksi Cepat
                                </h2>
                            </div>
                            <div className="p-3 sm:p-4 space-y-2">
                                {quickActions.map((action, index) => (
                                    <QuickActionButton
                                        key={index}
                                        label={action.label}
                                        icon={action.icon}
                                        href={action.href}
                                        color={action.color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
