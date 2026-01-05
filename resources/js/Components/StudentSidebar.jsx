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
    CalendarCircle,
    Graph,
    CloseCircle,
} from "iconsax-reactjs";
import SidebarItem from "./SidebarItem";
import { usePage } from "@inertiajs/react";

const StudentSidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const { url } = usePage();

    const sections = [
        {
            title: "Utama",
            items: [
                {
                    label: "Dashboard",
                    icon: Home2,
                    active: url === "/student/dashboard",
                    path: "/student/dashboard",
                },
            ],
        },
        {
            title: "Belajar",
            items: [
                {
                    label: "Mata Pelajaran Saya",
                    icon: Book1,
                    active: url.startsWith("/student/subjects"),
                    path: "/student/subjects",
                },
                {
                    label: "Materi Pembelajaran",
                    icon: DocumentText,
                    active: url.startsWith("/student/materials"),
                    path: "/student/materials",
                },
                {
                    label: "Tugas & Kuis",
                    icon: ClipboardTick,
                    active:
                        url.startsWith("/student/assignments") ||
                        url.startsWith("/student/submissions") ||
                        url.startsWith("/student/quizzes"),
                    path: "/student/assignments",
                },
            ],
        },
        {
            title: "Kehadiran & Jadwal",
            items: [
                {
                    label: "Presensi",
                    icon: People,
                    active: url.startsWith("/student/attendance"),
                    path: "/student/attendance",
                },
                {
                    label: "Jadwal Pelajaran",
                    icon: CalendarCircle,
                    active: url.startsWith("/student/schedule"),
                    path: "/student/schedule",
                },
                {
                    label: "Ekstrakurikuler",
                    icon: People,
                    active: url.startsWith("/student/extracurriculars"),
                    path: "/student/extracurriculars",
                },
            ],
        },
        {
            title: "Nilai & Informasi",
            items: [
                {
                    label: "Nilai Saya",
                    icon: Graph,
                    active: url.startsWith("/student/grades"),
                    path: "/student/grades",
                },
                {
                    label: "Notifikasi",
                    icon: NotificationBing,
                    active: url.startsWith("/student/notifications"),
                    path: "/student/notifications",
                },
            ],
        },
        {
            title: "Akun",
            items: [
                {
                    label: "Profil Saya",
                    icon: UserEdit,
                    active: url.startsWith("/student/profile"),
                    path: "/student/profile",
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
        <div
            className={`fixed top-0 left-0 h-full bg-white shadow-lg z-20 transition-all duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } ${isMobile ? "w-64" : "w-64 md:translate-x-0"}`}
        >
            {/* Header logo + close button */}
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

                {isMobile && (
                    <button
                        onClick={closeSidebar}
                        className="p-1 rounded-full hover:bg-gray-100"
                    >
                        <CloseCircle size="20" />
                    </button>
                )}
            </div>

            {/* Menu */}
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

                {/* Logout */}
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
    );
};

export default StudentSidebar;
