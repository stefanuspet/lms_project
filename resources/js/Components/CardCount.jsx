import React from "react";

const CardCount = ({ title, count, icon: Icon, color }) => {
    // Color variants
    const colorVariants = {
        blue: {
            bg: "bg-blue-100",
            text: "text-blue-600",
        },
        sky: {
            bg: "bg-sky-100",
            text: "text-sky-600",
        },
        amber: {
            bg: "bg-amber-100",
            text: "text-amber-600",
        },
        green: {
            bg: "bg-green-100",
            text: "text-green-600",
        },
        indigo: {
            bg: "bg-indigo-100",
            text: "text-indigo-600",
        },
        red: {
            bg: "bg-red-100",
            text: "text-red-600",
        },
    };

    const selectedColor = colorVariants[color] || colorVariants.sky;

    return (
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {count}
                </p>
            </div>
            <div className={`p-2 sm:p-3 ${selectedColor.bg} rounded-full`}>
                <Icon variant="Bold" size="24" className={selectedColor.text} />
            </div>
        </div>
    );
};

export default CardCount;
