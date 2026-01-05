import React from "react";
import {
    Home2,
    Book1,
    DocumentText,
    ClipboardTick,
    People,
    NotificationBing,
    UserEdit,
    Logout,
    MessageEdit,
    CalendarCircle,
    Graph,
    Teacher,
    CloseCircle,
} from "iconsax-reactjs";
import SidebarItem from "./SidebarItem";
import { usePage } from "@inertiajs/react";

const TeacherSidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const { url } = usePage();

    // Kelompokkan menu agar lebih mudah dibaca guru
    const sections = [
        {
            title: "Utama",
            items: [
                {
                    label: "Dashboard",
                    icon: Home2,
                    active: url === "/teacher/dashboard",
                    path: "/teacher/dashboard",
                },
            ],
        },
        {
            title: "Mengajar",
            items: [
                {
                    label: "Mata Pelajaran Saya",
                    icon: Book1,
                    active: url.startsWith("/teacher/subjects"),
                    path: "/teacher/subjects",
                },
                {
                    label: "Jadwal Mengajar",
                    icon: CalendarCircle,
                    active: url.startsWith("/teacher/schedule"),
                    path: "/teacher/schedule",
                },
                {
                    label: "Presensi Siswa",
                    icon: People,
                    active: url.startsWith("/teacher/attendance"),
                    path: "/teacher/attendance",
                },
                {
                    label: "Ekstrakurikuler",
                    icon: Teacher,
                    active: url.startsWith("/teacher/extracurriculars"),
                    path: "/teacher/extracurriculars",
                },
            ],
        },
        {
            title: "Siswa",
            items: [
                {
                    label: "Progres Siswa",
                    icon: Graph,
                    active: url.startsWith("/teacher/progress"),
                    path: "/teacher/progress",
                },
            ],
        },
        {
            title: "Informasi",
            items: [
                {
                    label: "Notifikasi",
                    icon: NotificationBing,
                    active: url.startsWith("/teacher/notifications"),
                    path: "/teacher/notifications",
                },
            ],
        },
        {
            title: "Akun",
            items: [
                {
                    label: "Profil Saya",
                    icon: UserEdit,
                    active: url.startsWith("/teacher/profile"),
                    path: "/teacher/profile",
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

export default TeacherSidebar;
