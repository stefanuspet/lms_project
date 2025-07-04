import React from "react";
import { Link } from "@inertiajs/react";

const QuickActionButton = ({ icon: Icon, label, href, color = "sky" }) => {
    // Color variants
    const colorVariants = {
        sky: {
            bg: "bg-sky-50",
            hover: "hover:bg-sky-100",
            text: "text-sky-700",
            iconColor: "text-sky-600",
        },
        blue: {
            bg: "bg-blue-50",
            hover: "hover:bg-blue-100",
            text: "text-blue-700",
            iconColor: "text-blue-600",
        },
        green: {
            bg: "bg-green-50",
            hover: "hover:bg-green-100",
            text: "text-green-700",
            iconColor: "text-green-600",
        },
        amber: {
            bg: "bg-amber-50",
            hover: "hover:bg-amber-100",
            text: "text-amber-700",
            iconColor: "text-amber-600",
        },
        red: {
            bg: "bg-red-50",
            hover: "hover:bg-red-100",
            text: "text-red-700",
            iconColor: "text-red-600",
        },
    };

    const selectedColor = colorVariants[color] || colorVariants.sky;

    return (
        <Link
            href={href}
            className={`block w-full px-3 sm:px-4 py-2 sm:py-3 ${selectedColor.bg} ${selectedColor.text} rounded-lg ${selectedColor.hover} transition-colors flex items-center gap-2 text-xs sm:text-sm`}
        >
            <Icon size="18" className={selectedColor.iconColor} />
            <span>{label}</span>
        </Link>
    );
};

export default QuickActionButton;
