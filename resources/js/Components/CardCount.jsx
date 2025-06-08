import React from "react";

const CardCount = ({ color, count, title }) => {
    return (
        <div
            className="h-28 w-44 rounded-xl px-4 cursor-pointer"
            style={{ backgroundColor: color }}
        >
            <div className="flex space-x-1 justify-end py-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div className="py-2">
                <h1 className="font-bold w-full text-xl">{count}</h1>
                <p className="text-sm">{title}</p>
            </div>
        </div>
    );
};

export default CardCount;
