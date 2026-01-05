import React from "react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Link } from "@inertiajs/react";
import { Eye } from "iconsax-reactjs";

const StudentQuizIndex = ({ quizzes }) => {
    return (
        <StudentLayout title="Quiz">
            <div className="py-6 w-full">
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="px-6 py-5 border-b flex justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-800">Quiz Kelas</h1>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Judul
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mapel
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Durasi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {quizzes && quizzes.length > 0 ? (
                                        quizzes.map((quiz) => (
                                            <tr key={quiz.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {quiz.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {quiz.subject}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {quiz.duration} menit
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {quiz.submitted
                                                        ? `Selesai (Nilai: ${quiz.score ?? 0})`
                                                        : "Belum dikerjakan"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {quiz.submitted ? (
                                                        <span className="text-gray-400">Selesai</span>
                                                    ) : (
                                                        <Link
                                                            href={route("student.quizzes.show", quiz.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                                                        >
                                                            <Eye size="18" />
                                                            Kerjakan
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-4 text-center text-gray-500"
                                            >
                                                Belum ada quiz.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentQuizIndex;
