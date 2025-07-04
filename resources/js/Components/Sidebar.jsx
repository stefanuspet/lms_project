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
} from "iconsax-reactjs";
import SidebarItem from "./SidebarItem";
import { usePage } from "@inertiajs/react";

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
    const { url } = usePage();

    const menuItems = [
        {
            label: "Dashboard",
            icon: Home2,
            active: url === "/admin/dashboard",
            path: "/admin/dashboard",
        },
        {
            label: "Teachers",
            icon: Teacher,
            active: url === "/admin/teachers",
            path: "/admin/teachers",
        },
        {
            label: "Students",
            icon: Profile2User,
            active: url === "/admin/students",
            path: "/admin/students",
        },
        {
            label: "Attendances",
            icon: People,
            active: url === "/admin/attendance",
            path: "/admin/attendance",
        },
        {
            label: "Class",
            icon: Briefcase,
            active: url === "/admin/classrooms",
            path: "/admin/classrooms",
        },
        {
            label: "Subject",
            icon: Book1,
            active: url === "/admin/subject",
            path: "/admin/subject",
        },
        {
            label: "Semester",
            icon: CalendarCircle,
            active: url === "/admin/semesters",
            path: "/admin/semesters",
        },
        {
            label: "Students Enrollment",
            icon: Personalcard,
            active: url === "/admin/enrollments",
            path: "/admin/enrollments",
        },
        {
            label: "Activity Logs",
            icon: Activity,
            active: url === "/admin/activity-logs",
            path: "/admin/activity-logs",
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

export default Sidebar;
