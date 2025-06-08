import React from "react";

export default function SelectInput({
    disabled = false,
    className = "",
    children,
    ...props
}) {
    return (
        <select
            {...props}
            className={
                `border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </select>
    );
}
