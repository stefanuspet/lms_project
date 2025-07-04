import React from "react";

const NotificationCard = ({ message, type = "info" }) => {
    // Define color schemes for different notification types
    const typeStyles = {
        info: {
            border: "border-blue-500",
            bg: "bg-blue-50",
            text: "text-blue-700",
        },
        warning: {
            border: "border-amber-500",
            bg: "bg-amber-50",
            text: "text-amber-700",
        },
        success: {
            border: "border-green-500",
            bg: "bg-green-50",
            text: "text-green-700",
        },
        error: {
            border: "border-red-500",
            bg: "bg-red-50",
            text: "text-red-700",
        },
        sky: {
            border: "border-sky-500",
            bg: "bg-sky-50",
            text: "text-sky-700",
        },
    };

    const styles = typeStyles[type] || typeStyles.info;

    return (
        <div
            className={`border-l-4 ${styles.border} ${styles.bg} p-2 sm:p-3 rounded-r-lg`}
        >
            <p className={`text-xs sm:text-sm ${styles.text}`}>{message}</p>
        </div>
    );
};

export default NotificationCard;
