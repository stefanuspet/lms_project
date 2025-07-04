import React from "react";
import {
    Book1,
    ClipboardTick,
    Timer1,
    MessageEdit,
    Teacher,
    Calendar,
    Clock,
    Login,
    Briefcase,
    DocumentText,
    CpuSetting,
    Logout,
} from "iconsax-reactjs";

const RecentActivities = ({ activities = [] }) => {
    // Data dummy jika props activities kosong
    const activityData = activities;

    // Fungsi render icon sesuai tipe
    const getIcon = (iconType) => {
        switch (iconType) {
            case "material":
                return <Book1 size="16" className="text-amber-600" />;
            case "assignment":
                return <ClipboardTick size="16" className="text-sky-600" />;
            case "grade":
                return <MessageEdit size="16" className="text-sky-600" />;
            case "attendance":
                return <Clock size="16" className="text-green-600" />;
            case "login":
                return <Login size="16" className="text-blue-600" />;
            case "logout":
                return <Logout size="16" className="text-red-600" />;
            case "class":
                return <Briefcase size="16" className="text-purple-600" />;
            case "subject":
                return <DocumentText size="16" className="text-orange-600" />;
            case "system":
                return <CpuSetting size="16" className="text-red-600" />;
            default:
                return <CpuSetting size="16" className="text-red-600" />;
        }
    };

    return (
        <div className="h-full w-full p-4 pt-0">
            <div className="overflow-y-auto max-h-[300px] sm:max-h-[350px] md:max-h-[400px]">
                {activityData.map((activity) => (
                    <div
                        key={activity.id}
                        className="border-b border-gray-100 py-2 sm:py-3 last:border-0"
                    >
                        <div className="flex items-start gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-gray-50 rounded-full flex-shrink-0">
                                {getIcon(activity.icon_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col xs:flex-row justify-between items-start">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                            <span className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                                {activity.user}
                                            </span>
                                            <span
                                                className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                    activity.role === "teacher"
                                                        ? "bg-amber-100 text-amber-800"
                                                        : activity.role ===
                                                          "student"
                                                        ? "bg-sky-100 text-sky-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {activity.role === "teacher"
                                                    ? "Guru"
                                                    : activity.role ===
                                                      "student"
                                                    ? "Siswa"
                                                    : "Admin"}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                            {activity.action}
                                            {activity.subject !== "Umum" && (
                                                <>
                                                    <span className="font-medium">
                                                        {activity.description}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1 xs:mt-0">
                                        {activity.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {activityData.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                        Belum ada aktivitas terbaru
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivities;
