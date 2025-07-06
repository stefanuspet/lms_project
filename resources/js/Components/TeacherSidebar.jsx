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
} from "iconsax-reactjs";
import SidebarItem from "./SidebarItem";
import { usePage } from "@inertiajs/react";

const TeacherSidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const { url } = usePage();

    const menuItems = [
        {
            label: "Dashboard",
            icon: Home2,
            active: url === "/teacher/dashboard",
            path: "/teacher/dashboard",
        },
        {
            label: "My Subjects",
            icon: Book1,
            active: url.startsWith("/teacher/subjects"),
            path: "/teacher/subjects",
        },
        // {
        //     label: "Teaching Materials",
        //     icon: DocumentText,
        //     active: url.startsWith("/teacher/materials"),
        //     path: "/teacher/materials",
        // },
        // {
        //     label: "Assignments",
        //     icon: ClipboardTick,
        //     active: url.startsWith("/teacher/assignments"),
        //     path: "/teacher/assignments",
        // },
        // {
        //     label: "Student Submissions",
        //     icon: MessageEdit,
        //     active: url.startsWith("/teacher/submissions"),
        //     path: "/teacher/submissions",
        // },
        {
            label: "Attendance",
            icon: People,
            active: url.startsWith("/teacher/attendance"),
            path: "/teacher/attendance",
        },
        // {
        //     label: "Schedule",
        //     icon: CalendarCircle,
        //     active: url.startsWith("/teacher/schedule"),
        //     path: "/teacher/schedule",
        // },
        {
            label: "Student Progress",
            icon: Graph,
            active: url.startsWith("/teacher/progress"),
            path: "/teacher/progress",
        },
        {
            label: "Notifications",
            icon: NotificationBing,
            active: url.startsWith("/teacher/notifications"),
            path: "/teacher/notifications",
        },
        {
            label: "My Profile",
            icon: UserEdit,
            active: url.startsWith("/teacher/profile"),
            path: "/teacher/profile",
        },
        {
            label: "Log out",
            icon: Logout,
            active: url === "/logout",
            path: "/logout",
        },
    ];

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
                <div className="py-6 px-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <img
                            src="/assets/images/Logo.png"
                            alt="logo"
                            className="w-6"
                        />
                        <h1 className="font-extrabold text-xl text-center pl-3">
                            SchoolHub
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

                {/* Menu Label */}
                <div className="mt-6 px-6">
                    <p className="text-[#A7A9AA] text-sm font-medium">MENU</p>
                </div>

                {/* Menu Items */}
                <div className="mt-4 px-3 pb-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    {menuItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            icon={item.icon}
                            label={item.label}
                            active={item.active}
                            path={item.path}
                            onClick={isMobile ? closeSidebar : undefined}
                        />
                    ))}
                </div>
            </div>

            {/* Backdrop for mobile sidebar - rendered in layout component */}
        </>
    );
};

export default TeacherSidebar;
