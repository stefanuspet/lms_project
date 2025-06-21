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

const StudentSidebar = () => {
    const { url } = usePage();

    const menuItems = [
        {
            label: "Dashboard",
            icon: Home2,
            active: url === "/student/dashboard",
            path: "/student/dashboard",
        },
        {
            label: "My Subjects",
            icon: Book1,
            active: url.startsWith("/student/subjects"),
            path: "/student/subjects",
        },
        {
            label: "Learning Materials",
            icon: DocumentText,
            active: url.startsWith("/student/materials"),
            path: "/student/materials",
        },
        {
            label: "Assignments",
            icon: ClipboardTick,
            active:
                url.startsWith("/student/assignments") ||
                url.startsWith("/student/submissions"),
            path: "/student/assignments",
        },
        {
            label: "Attendance",
            icon: People,
            active: url.startsWith("/student/attendance"),
            path: "/student/attendance",
        },
        {
            label: "My Grades",
            icon: Graph,
            active: url.startsWith("/student/grades"),
            path: "/student/grades",
        },
        {
            label: "Notifications",
            icon: NotificationBing,
            active: url.startsWith("/student/notifications"),
            path: "/student/notifications",
        },
        {
            label: "My Profile",
            icon: UserEdit,
            active: url.startsWith("/student/profile"),
            path: "/student/profile",
        },
        {
            label: "Log out",
            icon: Logout,
            active: url === "/logout",
            path: "/logout",
            method: "post", // Menambahkan method post untuk logout
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
                        method={item.method} // Pastikan untuk meneruskan method jika ada
                    />
                ))}
            </div>
        </div>
    );
};

export default StudentSidebar;
