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

const TeacherSidebar = () => {
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

    return (
        <div className="w-1/6 min-h-lvh bg-white px-5 py-2">
            <div className="my-4 flex items-center w-full justify-center">
                <img src="/assets/images/Logo.png" alt="logo" className="w-6" />
                <h1 className="font-extrabold text-2xl text-center pl-4">
                    SchoolHub
                </h1>
            </div>
            <div className="mt-10 pl-5 flex items-center gap-2">
                <p className="text-[#A7A9AA] uppercase">Menu</p>
            </div>
            <div className="my-3">
                {menuItems.map((item, index) => (
                    <SidebarItem
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        active={item.active}
                        path={item.path}
                    />
                ))}
            </div>
        </div>
    );
};

export default TeacherSidebar;
