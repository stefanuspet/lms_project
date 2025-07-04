import React from "react";

const StatCard = ({ title, value, change, period }) => {
    const isPositive = parseFloat(change) >= 0;

    return (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">
                {title}
            </h3>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {value}
            </p>
            <div className="flex items-center mt-1 sm:mt-2">
                <span
                    className={`${
                        isPositive ? "text-green-500" : "text-red-500"
                    } text-xs font-medium`}
                >
                    {isPositive ? "+" : ""}
                    {change}
                </span>
                <span className="text-gray-400 text-xs ml-1">{period}</span>
            </div>
        </div>
    );
};

export default StatCard;
