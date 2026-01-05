import React from "react";
import { Link } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import { Calendar, People, Teacher, Home2 } from "iconsax-reactjs";

const dayLabel = (dayKey) => {
    const map = {
        monday: "Senin",
        tuesday: "Selasa",
        wednesday: "Rabu",
        thursday: "Kamis",
        friday: "Jumat",
        saturday: "Sabtu",
        sunday: "Minggu",
    };
    return map[dayKey] || dayKey || "-";
};

const TeacherExtracurricularIndex = ({ extracurriculars = [], flash }) => {
    return (
        <TeacherLayout title="Ekstrakurikuler Saya">
            {flash?.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>{flash.success}</p>
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{flash.error}</p>
                </div>
            )}

            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">
                                Ekstrakurikuler yang Saya Bina
                            </h1>
                            <p className="mt-1 text-xs text-gray-500">
                                Lihat daftar kegiatan ekstrakurikuler yang
                                Anda tangani beserta jadwal dan jumlah siswa.
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        {extracurriculars.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {extracurriculars.map((extra) => (
                                    <Link
                                        key={extra.id}
                                        href={route(
                                            "teacher.extracurriculars.show",
                                            extra.id
                                        )}
                                        className="block bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-150"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h2 className="font-semibold text-gray-800 text-lg">
                                                        {extra.name}
                                                    </h2>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {extra.description ||
                                                            "Tidak ada deskripsi."}
                                                    </p>
                                                </div>
                                                {extra.is_active && (
                                                    <span className="px-2 py-1 text-[10px] rounded-full bg-green-100 text-green-700">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-3 space-y-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar
                                                        size="18"
                                                        className="text-green-500"
                                                    />
                                                    <span>
                                                        {dayLabel(
                                                            extra.day_of_week
                                                        )}{" "}
                                                        {extra.start_time &&
                                                            extra.end_time &&
                                                            `• ${extra.start_time} - ${extra.end_time}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Home2
                                                        size="18"
                                                        className="text-amber-500"
                                                    />
                                                    <span>
                                                        Ruangan:{" "}
                                                        {extra.room || "-"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <People
                                                        size="18"
                                                        className="text-blue-500"
                                                    />
                                                    <span>
                                                        {extra.students_count}{" "}
                                                        siswa
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <Teacher
                                    size="48"
                                    className="mx-auto text-gray-300 mb-3"
                                />
                                <p>
                                    Anda belum terdaftar sebagai pembina
                                    ekstrakurikuler mana pun.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherExtracurricularIndex;

