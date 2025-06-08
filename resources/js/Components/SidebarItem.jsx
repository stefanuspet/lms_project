import React from "react";
import { Link } from "@inertiajs/react";

const SidebarItem = ({ icon: Icon, label, active = false, path }) => {
    console.log("path", path);

    return (
        <Link
            href={path}
            className={`w-full mt-2 ${
                active ? "bg-[#C3EBFA]" : "hover:bg-[#C3EBFA]"
            } cursor-pointer py-3 px-5 rounded-xl flex items-center gap-x-4`}
        >
            <Icon size="20" color="#242424" />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

export default SidebarItem;
