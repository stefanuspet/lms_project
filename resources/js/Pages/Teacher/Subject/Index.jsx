import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    SearchNormal1,
    DocumentText,
    ClipboardText,
    Message,
    People,
    Book1,
    TaskSquare,
} from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const SubjectCard = ({ subject, isActive }) => {
    const header = isActive
        ? "h-24 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 flex flex-col justify-between"
        : "h-24 bg-gradient-to-r from-gray-300 to-gray-400 p-4 flex flex-col justify-between";

    const btnBase = isActive
        ? { material: "bg-green-100 text-green-700 hover:bg-green-200", assignment: "bg-amber-100 text-amber-700 hover:bg-amber-200", discussion: "bg-blue-100 text-blue-700 hover:bg-blue-200" }
        : { material: "bg-gray-100 text-gray-500 hover:bg-gray-200", assignment: "bg-gray-100 text-gray-500 hover:bg-gray-200", discussion: "bg-gray-100 text-gray-500 hover:bg-gray-200" };

    return (
        <div
            onClick={() => router.get(route("teacher.subjects.show", subject.id), { semester_id: subject.semester_id })}
            className="group rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className={header}>
                <h3 className="text-base font-semibold text-white line-clamp-2">
                    {subject.name}
                </h3>
                <p className="text-xs text-white/80">{subject.class_name}</p>
            </div>

            {/* Stats row */}
            <div className="px-4 pt-3 pb-1 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <People size="14" />
                    {subject.student_count} siswa
                </span>
                <span className="flex items-center gap-1">
                    <Book1 size="14" />
                    {subject.materials_count} materi
                </span>
                <span className="flex items-center gap-1">
                    <TaskSquare size="14" />
                    {subject.assignments_count} tugas
                </span>
                {isActive && subject.pending_submissions_count > 0 && (
                    <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        {subject.pending_submissions_count} belum dinilai
                    </span>
                )}
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4 pt-2 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.get(route("teacher.materials.index", {
                            subject_id: subject.id,
                            semester_id: subject.semester_id,
                        }));
                    }}
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${btnBase.material}`}
                    title="Kelola Materi"
                >
                    <DocumentText size="16" className="mr-1" />
                    Materi
                </button>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.get(route("teacher.assignments.index", {
                            subject_id: subject.id,
                            semester_id: subject.semester_id,
                        }));
                    }}
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${btnBase.assignment}`}
                    title="Kelola Tugas"
                >
                    <ClipboardText size="16" className="mr-1" />
                    Tugas
                </button>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.get(route("teacher.discussions.index", subject.id), {
                            semester_id: subject.semester_id,
                        });
                    }}
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${btnBase.discussion}`}
                    title="Diskusi"
                >
                    <Message size="16" className="mr-1" />
                    Diskusi
                </button>
            </div>
        </div>
    );
};

const TeacherSubjectIndex = ({ semesters = [], filters }) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route("teacher.subjects.index"),
            { search: searchTerm },
            { preserveState: true, preserveScroll: true }
        );
    };

    const totalSubjects = semesters.reduce((sum, s) => sum + s.subjects.length, 0);

    return (
        <TeacherLayout title="Mata Pelajaran Saya">
            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">
                                Mata Pelajaran Saya
                            </h1>
                            <p className="mt-1 text-xs text-gray-500">
                                {totalSubjects > 0
                                    ? `${totalSubjects} mata pelajaran di ${semesters.length} semester`
                                    : "Belum ada mata pelajaran yang ditugaskan"}
                            </p>
                        </div>
                        <form onSubmit={handleSearch} className="relative">
                            <SearchNormal1
                                size="20"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Cari mata pelajaran"
                                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 placeholder:text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="hidden">Cari</button>
                        </form>
                    </div>

                    {/* Semester sections */}
                    <div className="px-6 py-6 space-y-10">
                        {semesters.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-gray-500">
                                Belum ada mata pelajaran yang ditugaskan
                            </div>
                        )}

                        {semesters.map((semester) => (
                            <section key={semester.id}>
                                {/* Semester label */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span
                                        className={`inline-block w-3 h-3 rounded-full ${
                                            semester.is_active ? "bg-blue-500" : "bg-gray-400"
                                        }`}
                                    />
                                    <h2 className={`text-sm font-bold uppercase tracking-wide ${
                                        semester.is_active ? "text-gray-800" : "text-gray-500"
                                    }`}>
                                        {semester.name}
                                    </h2>
                                    {semester.is_active && (
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                            Aktif
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                        ({semester.subjects.length} mata pelajaran)
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {semester.subjects.map((subject) => (
                                        <SubjectCard
                                            key={`${subject.id}-${semester.id}`}
                                            subject={subject}
                                            isActive={semester.is_active}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherSubjectIndex;
