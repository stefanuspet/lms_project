import React from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    ArrowLeft2,
    DocumentText,
    ClipboardText,
    Calendar,
    Teacher,
    People,
    Book1,
    MessageEdit,
    ClipboardTick,
    Timer1,
    TickCircle,
} from "iconsax-reactjs";

const StudentSubjectShow = ({ subject }) => {
    return (
        <StudentLayout title={`Subject: ${subject.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("student.subjects.index")}
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
                                href={route("student.materials.index", {
                                    subject_id: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                                <DocumentText size="20" />
                                <span>Materials</span>
                            </Link>
                            <Link
                                href={route("student.assignments.index", {
                                    subject_id: subject.id,
                                })}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                <ClipboardText size="20" />
                                <span>Assignments</span>
                            </Link>
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
                                        className="text-blue-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.name}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Teacher
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Teacher
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.teacher_name}
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
                                    Your Progress
                                </h3>
                                <div className="flex items-center gap-2">
                                    <ClipboardTick
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.completed_assignments}/
                                        {subject.assignments_count} Assignments
                                        Completed
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

                            {/* Learning Materials and Assignments */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {/* Recent Materials */}
                                <div className="bg-white border rounded-lg shadow-sm">
                                    <div className="px-6 py-4 border-b flex items-center justify-between">
                                        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                            <DocumentText
                                                size="20"
                                                className="text-green-600"
                                            />
                                            <span>Recent Materials</span>
                                        </h2>
                                        <Link
                                            href={route(
                                                "student.materials.index",
                                                { subject_id: subject.id }
                                            )}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <div className="px-6 py-4">
                                        {subject.recent_materials &&
                                        subject.recent_materials.length > 0 ? (
                                            <div className="divide-y">
                                                {subject.recent_materials.map(
                                                    (material) => (
                                                        <div
                                                            key={material.id}
                                                            className="py-3 first:pt-0 last:pb-0"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <Link
                                                                        href={route(
                                                                            "student.materials.show",
                                                                            material.id
                                                                        )}
                                                                        className="font-medium text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        {
                                                                            material.title
                                                                        }
                                                                    </Link>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                                        {material.file_type ||
                                                                            "Text"}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 mt-1">
                                                                        {
                                                                            material.created_at
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex items-center justify-end">
                                                                <Link
                                                                    href={route(
                                                                        "student.materials.show",
                                                                        material.id
                                                                    )}
                                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                                >
                                                                    View
                                                                    Material
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <p>
                                                    No materials available yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upcoming Assignments */}
                                <div className="bg-white border rounded-lg shadow-sm">
                                    <div className="px-6 py-4 border-b flex items-center justify-between">
                                        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                            <Timer1
                                                size="20"
                                                className="text-red-600"
                                            />
                                            <span>Upcoming Assignments</span>
                                        </h2>
                                        <Link
                                            href={route(
                                                "student.assignments.index",
                                                { subject_id: subject.id }
                                            )}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <div className="px-6 py-4">
                                        {subject.upcoming_assignments &&
                                        subject.upcoming_assignments.length >
                                            0 ? (
                                            <div className="divide-y">
                                                {subject.upcoming_assignments.map(
                                                    (assignment) => (
                                                        <div
                                                            key={assignment.id}
                                                            className="py-3 first:pt-0 last:pb-0"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <Link
                                                                        href={route(
                                                                            "student.assignments.show",
                                                                            assignment.id
                                                                        )}
                                                                        className="font-medium text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        {
                                                                            assignment.title
                                                                        }
                                                                    </Link>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                                                                        {
                                                                            assignment.days_remaining
                                                                        }{" "}
                                                                        days
                                                                        left
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 mt-1">
                                                                        Due:{" "}
                                                                        {
                                                                            assignment.deadline
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex items-center justify-between text-xs">
                                                                <div className="flex items-center gap-1">
                                                                    {assignment.is_submitted ? (
                                                                        <>
                                                                            <TickCircle
                                                                                size="14"
                                                                                className="text-green-600"
                                                                            />
                                                                            <span className="text-green-600">
                                                                                Submitted
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Timer1
                                                                                size="14"
                                                                                className="text-red-600"
                                                                            />
                                                                            <span className="text-red-600">
                                                                                Not
                                                                                submitted
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {!assignment.is_submitted && (
                                                                    <Link
                                                                        href={route(
                                                                            "student.assignments.submit",
                                                                            assignment.id
                                                                        )}
                                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        Submit
                                                                        Now
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <p>No upcoming assignments.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Completed Assignments */}
                            <div className="md:col-span-2 mt-4">
                                <h2 className="text-lg font-semibold text-gray-700 pb-2 border-b mb-4">
                                    My Grades
                                </h2>

                                {subject.completed_assignments_list &&
                                subject.completed_assignments_list.length >
                                    0 ? (
                                    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Assignment
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Submitted Date
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Grade
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {subject.completed_assignments_list.map(
                                                        (submission) => (
                                                            <tr
                                                                key={
                                                                    submission.id
                                                                }
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            submission.title
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-500">
                                                                        {
                                                                            submission.submitted_at
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {submission.grade !==
                                                                    null ? (
                                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                            {
                                                                                submission.grade
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                            Not
                                                                            graded
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <Link
                                                                        href={route(
                                                                            "student.submissions.show",
                                                                            submission.id
                                                                        )}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                    >
                                                                        View
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                                        <MessageEdit
                                            size="48"
                                            className="mx-auto text-gray-300 mb-3"
                                        />
                                        <p className="text-gray-500">
                                            You haven't completed any
                                            assignments for this subject yet.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-2 mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("student.subjects.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Back to Subjects
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentSubjectShow;
