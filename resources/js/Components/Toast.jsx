import React, { useEffect, useState } from "react";

const Toast = ({ type = "success", message, onClose, duration = 4000 }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!message) return;

        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) {
                onClose();
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message || !visible) {
        return null;
    }

    const baseClasses =
        "fixed z-50 right-4 bottom-4 max-w-sm px-4 py-3 rounded-lg shadow-lg flex items-start space-x-3 text-sm";

    const typeClasses =
        type === "error"
            ? "bg-red-600 text-white"
            : "bg-green-600 text-white";

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <div className="flex-1">{message}</div>
            <button
                type="button"
                onClick={() => {
                    setVisible(false);
                    if (onClose) {
                        onClose();
                    }
                }}
                className="ml-2 text-xs font-semibold opacity-80 hover:opacity-100"
            >
                Tutup
            </button>
        </div>
    );
};

export default Toast;

