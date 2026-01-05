import React from "react";
import { router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import { Calendar, Clock, Home2 } from "iconsax-reactjs";

const TeacherScheduleIndex = ({ teacher, scheduleByDay, days, filters, flash }) => {
    const orderedDays = Object.keys(days);

    const handleFilter = (e) => {
        router.get(
            route("teacher.schedule.index"),
            { day: e.target.value },
            { preserveScroll: true }
        );
    };

    const renderCard = (entry) => (
        <div
            key={entry.id}
            className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm flex flex-col gap-2"
        >
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{entry.semester}</span>
                {entry.room && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                        {entry.room}
                    </span>
                )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
                {entry.subject_name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-2">
                <Home2 size="16" className="text-amber-500" />
                {entry.class_name}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
                <Clock size="16" className="text-amber-500" />
                {entry.time}
            </p>
            {entry.meeting_link && (
                <a
                    className="text-sm text-blue-600 hover:underline"
                    href={entry.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                >
                    Link pertemuan
                </a>
            )}
            {entry.notes && (
                <p className="text-sm text-gray-600 border-t pt-2">{entry.notes}</p>
            )}
        </div>
    );

    return (
        <TeacherLayout title="Jadwal Mengajar">
            <div className="py-6 w-full">
                {flash?.success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4">
                        {flash.success}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-5 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <p className="text-sm text-gray-500">Guru</p>
                        <h1 className="text-xl font-bold text-gray-800">
                            {teacher.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size="20" className="text-amber-500" />
                        <select
                            value={filters.day || ""}
                            onChange={handleFilter}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-amber-400 focus:border-amber-400"
                        >
                            <option value="">Semua Hari</option>
                            {orderedDays.map((dayKey) => (
                                <option key={dayKey} value={dayKey}>
                                    {days[dayKey]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {orderedDays
                        .filter((day) => !filters.day || filters.day === day)
                        .map((dayKey) => {
                            const entries =
                                (scheduleByDay && scheduleByDay[dayKey]) || [];
                            return (
                                <div key={dayKey} className="bg-white rounded-xl shadow-sm p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            {days[dayKey]}
                                        </h2>
                                        <div className="flex items-center text-sm text-gray-500 gap-1">
                                            <Clock size="16" /> {entries.length} sesi
                                        </div>
                                    </div>
                                    {entries.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {entries.map((entry) => renderCard(entry))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">
                                            Tidak ada jadwal untuk hari ini.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherScheduleIndex;
