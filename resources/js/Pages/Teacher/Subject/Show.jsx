import React from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    DocumentText,
    ClipboardText,
    Calendar,
    Teacher,
    People,
    Book1,
} from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherSubjectShow = ({ subject }) => {
    return (
        <TeacherLayout title={`Subject: ${subject.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.subjects.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Subject Details
                            </h1>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            <Link
                                href={route("teacher.materials.index", {
                                    subject_id: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                <DocumentText size="20" />
                                <span>Materials</span>
                            </Link>
                            <Link
                                href={route("teacher.assignments.index", {
                                    subject_id: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                            >
                                <ClipboardText size="20" />
                                <span>Assignments</span>
                            </Link>
                            {/* <Link
                                href={route("teacher.attendance.index", {
                                    subject_id: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                                <Calendar size="20" />
                                <span>Attendance</span>
                            </Link> */}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Subject Info Section */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                    Subject Information
                                </h2>
                            </div>

                            {/* Info boxes */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Subject Name
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Book1
                                        size="20"
                                        className="text-amber-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.name}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Class
                                </h3>
                                <div className="flex items-center gap-2">
                                    <People
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.class_name}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Semester
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Calendar
                                        size="20"
                                        className="text-purple-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.semester_name}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Total Students
                                </h3>
                                <div className="flex items-center gap-2">
                                    <People
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.student_count} Students
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Description
                                </h3>
                                <p className="text-gray-900">
                                    {subject.description ||
                                        "No description available."}
                                </p>
                            </div>

                            {/* Progress Summary */}
                            <div className="md:col-span-2 mt-4">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b">
                                    Teaching Progress
                                </h2>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Materials
                                </h3>
                                <div className="flex items-center gap-2">
                                    <DocumentText
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.materials_count || 0} Materials
                                        Uploaded
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Assignments
                                </h3>
                                <div className="flex items-center gap-2">
                                    <ClipboardText
                                        size="20"
                                        className="text-amber-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.assignments_count || 0}{" "}
                                        Assignments Created
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Attendance Sessions
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Calendar
                                        size="20"
                                        className="text-purple-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.attendance_count || 0} Sessions
                                        Created
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Assignments to Grade
                                </h3>
                                <div className="flex items-center gap-2">
                                    <ClipboardText
                                        size="20"
                                        className="text-red-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.pending_submissions_count || 0}{" "}
                                        Submissions Pending
                                    </p>
                                </div>
                            </div>

                            {/* Student List */}
                            <div className="md:col-span-2 mt-4">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b mb-4">
                                    Enrolled Students
                                </h2>

                                {subject.students &&
                                subject.students.length > 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            NISN
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Gender
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Assignments
                                                            Completed
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Attendance Rate
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subject.students.map(
                                                        (student, index) => (
                                                            <tr
                                                                key={student.id}
                                                                className={
                                                                    index %
                                                                        2 ===
                                                                    0
                                                                        ? "bg-white"
                                                                        : "bg-gray-50"
                                                                }
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {
                                                                        student.name
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {
                                                                        student.nisn
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {
                                                                        student.gender
                                                                    }
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {student.completed_assignments ||
                                                                        0}
                                                                    /
                                                                    {subject.assignments_count ||
                                                                        0}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {student.attendance_rate ||
                                                                        "0%"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-500 italic">
                                            No students enrolled in this subject
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("teacher.subjects.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Back to Subjects
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherSubjectShow;
