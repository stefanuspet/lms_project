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
} from "iconsax-reactjs";
import SidebarItem from "./SidebarItem";
import { usePage } from "@inertiajs/react";

const Sidebar = () => {
    const { url } = usePage();
    console.log("Current URL path:", url);

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
            active: url === "/admin/class",
            path: "/admin/class",
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
            label: "Logs",
            icon: Activity,
            active: url === "/admin/logs",
            path: "/admin/logs",
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
            <div className="mt-10 pl-5">
                <p className="text-[#A7A9AA]">MENU</p>
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

export default Sidebar;
