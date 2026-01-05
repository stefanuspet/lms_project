import React from "react";
import {
    Activity,
    Briefcase,
    Home2,
    Profile2User,
    Teacher,
    People,
    Logout,
    Book1,
    CalendarCircle,
    Personalcard,
    CloseCircle,
    Calendar,
} from "iconsax-reactjs";
import SidebarItem from "./SidebarItem";
import { usePage } from "@inertiajs/react";

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const { url } = usePage();

    const sections = [
        {
            title: "Utama",
            items: [
                {
                    label: "Dashboard",
                    icon: Home2,
                    active: url === "/admin/dashboard",
                    path: "/admin/dashboard",
                },
            ],
        },
        {
            title: "Data",
            items: [
                {
                    label: "Guru",
                    icon: Teacher,
                    active: url === "/admin/teachers",
                    path: "/admin/teachers",
                },
                {
                    label: "Staf & Security",
                    icon: Personalcard,
                    active: url.startsWith("/admin/staff"),
                    path: "/admin/staff",
                },
                {
                    label: "Siswa",
                    icon: Profile2User,
                    active: url === "/admin/students",
                    path: "/admin/students",
                },
                {
                    label: "Kelas",
                    icon: Briefcase,
                    active: url === "/admin/classrooms",
                    path: "/admin/classrooms",
                },
                {
                    label: "Mata Pelajaran",
                    icon: Book1,
                    active: url === "/admin/subject",
                    path: "/admin/subject",
                },
                {
                    label: "Ekstrakurikuler",
                    icon: Calendar,
                    active: url === "/admin/extracurriculars",
                    path: "/admin/extracurriculars",
                },
            ],
        },
        {
            title: "Akademik",
            items: [
                {
                    label: "Presensi",
                    icon: People,
                    active: url === "/admin/attendance",
                    path: "/admin/attendance",
                },
                {
                    label: "Jadwal",
                    icon: CalendarCircle,
                    active: url === "/admin/schedules",
                    path: "/admin/schedules",
                },
                {
                    label: "Semester",
                    icon: CalendarCircle,
                    active: url === "/admin/semesters",
                    path: "/admin/semesters",
                },
                {
                    label: "Tahun Ajar",
                    icon: Calendar,
                    active: url === "/admin/academic-years",
                    path: "/admin/academic-years",
                },
            ],
        },
        {
            title: "Administrasi",
            items: [
                {
                    label: "Pendaftaran",
                    icon: Personalcard,
                    active: url === "/admin/enrollments",
                    path: "/admin/enrollments",
                },
                {
                    label: "Log Aktivitas",
                    icon: Activity,
                    active: url === "/admin/activity-logs",
                    path: "/admin/activity-logs",
                },
            ],
        },
    ];

    const logoutItem = {
        label: "Keluar",
        icon: Logout,
        active: url === "/logout",
        path: "/logout",
    };

    const closeSidebar = () => {
        if (isMobile) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Desktop sidebar */}
            <div
                className={`
                    fixed top-0 left-0 h-full bg-white shadow-lg z-20
                    transition-all duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                    ${isMobile ? "w-64" : "w-64 md:translate-x-0"}
                `}
            >
                {/* Sidebar Header with Logo */}
                <div className="py-5 px-4 flex items-center justify-between border-b">
                    <div className="flex items-center mx-auto justify-between w-full">
                        <img
                            src="/assets/images/Logo.png"
                            alt="logo"
                            className="w-8 mx-auto"
                        />
                        <h1 className="font-extrabold text-md pt-1">
                            SMK Amaliyah Jakarta
                        </h1>
                    </div>

                    {/* Close button - only on mobile */}
                    {isMobile && (
                        <button
                            onClick={closeSidebar}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            <CloseCircle size="20" />
                        </button>
                    )}
                </div>

                {/* Menu Sections */}
                <div className="mt-4 px-3 pb-6 overflow-y-auto max-h-[calc(100vh-120px)] flex flex-col justify-between">
                    <div>
                        {sections.map((section, idx) => (
                            <div key={idx} className="mb-4">
                                <div className="px-3 mb-1">
                                    <p className="text-[#A7A9AA] text-xs font-semibold uppercase tracking-wide">
                                        {section.title}
                                    </p>
                                </div>
                                {section.items.map((item, index) => (
                                    <SidebarItem
                                        key={`${section.title}-${index}`}
                                        icon={item.icon}
                                        label={item.label}
                                        active={item.active}
                                        path={item.path}
                                        onClick={isMobile ? closeSidebar : undefined}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Logout at bottom */}
                    <div className="mt-2 pt-3 border-t border-gray-200">
                        <SidebarItem
                            icon={logoutItem.icon}
                            label={logoutItem.label}
                            active={logoutItem.active}
                            path={logoutItem.path}
                            onClick={isMobile ? closeSidebar : undefined}
                        />
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile sidebar - rendered in layout component */}
        </>
    );
};

export default Sidebar;
