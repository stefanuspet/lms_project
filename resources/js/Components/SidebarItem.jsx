import React from "react";
import { Link } from "@inertiajs/react";

const SidebarItem = ({ icon: Icon, label, active, path, onClick }) => {
    return (
        <Link
            href={path}
            onClick={onClick}
            className={`
                flex items-center py-3 px-4 my-1 rounded-lg transition-colors
                ${
                    active
                        ? "bg-sky-100 text-sky-700"
                        : "text-gray-600 hover:bg-gray-100"
                }
            `}
        >
            <Icon
                variant={active ? "Bold" : "Linear"}
                size="20"
                className={active ? "text-sky-700" : ""}
            />
            <span className="ml-3 font-medium text-sm">{label}</span>
        </Link>
    );
};

export default SidebarItem;
