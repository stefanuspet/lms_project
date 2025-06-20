import React from "react";
import { Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    Edit2,
    Trash,
    DocumentDownload,
    Calendar,
    Clock,
    InfoCircle,
    MessageEdit,
    TickCircle,
    CloseCircle,
    Export,
} from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherAssignmentShow = ({ assignment, subject }) => {
    // Handle assignment deletion
    const handleDelete = () => {
        if (assignment.stats.submitted_count > 0) {
            alert("Cannot delete an assignment that already has submissions.");
            return;
        }

        if (confirm("Are you sure you want to delete this assignment?")) {
            router.delete(route("teacher.assignments.destroy", assignment.id), {
                onSuccess: () => {
                    router.visit(
                        route("teacher.assignments.index", {
                            subject_id: subject.id,
                        })
                    );
                },
            });
        }
    };

    // Function to determine badge color based on student status
    const getStatusBadge = (status) => {
        switch (status) {
            case "graded":
                return "bg-green-100 text-green-800";
            case "submitted":
                return "bg-blue-100 text-blue-800";
            case "not_submitted":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Function to determine status text
    const getStatusText = (status) => {
        switch (status) {
            case "graded":
                return "Graded";
            case "submitted":
                return "Submitted";
            case "not_submitted":
                return "Not Submitted";
            default:
                return "Unknown";
        }
    };

    // Function to export submissions
    const handleExport = () => {
        window.location.href = route(
            "teacher.submissions.export",
            assignment.id
        );
    };

    return (
        <TeacherLayout title={`Assignment: ${assignment.title}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.assignments.index", {
                                    subject_id: subject.id,
                                })}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Assignment Details
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {subject.name} - {subject.class_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={route(
                                    "teacher.submissions.index",
                                    assignment.id
                                )}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                <MessageEdit size="20" />
                                <span>Grade Submissions</span>
                            </Link>
                            <Link
                                href={route(
                                    "teacher.assignments.edit",
                                    assignment.id
                                )}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                <Edit2 size="20" />
                                <span>Edit</span>
                            </Link>
                            {assignment.stats.submitted_count === 0 && (
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <Trash size="20" />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Assignment Information */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Assignment Title & Deadline */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                        {assignment.title}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar
                                            size="18"
                                            className={
                                                assignment.is_past_deadline
                                                    ? "text-red-500"
                                                    : "text-green-500"
                                            }
                                        />
                                        <span className="font-medium">
                                            Deadline:
                                        </span>
                                        <span>{assignment.deadline}</span>
                                        <span
                                            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                                assignment.is_past_deadline
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}
                                        >
                                            {assignment.is_past_deadline
                                                ? "Closed"
                                                : "Open"}
                                        </span>
                                    </div>
                                </div>

                                {/* Assignment Description */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Instructions
                                    </h3>
                                    {assignment.description ? (
                                        <div className="prose max-w-none">
                                            <div className="bg-white border rounded-lg p-4">
                                                {assignment.description
                                                    .split("\n")
                                                    .map((paragraph, index) => (
                                                        <p
                                                            key={index}
                                                            className="mb-4"
                                                        >
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">
                                            No instructions provided.
                                        </p>
                                    )}
                                </div>

                                {/* Attachment */}
                                {assignment.file_path && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                                            Attachment
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700">
                                                {assignment.file_path
                                                    .split("/")
                                                    .pop()}
                                            </span>
                                            <a
                                                href={assignment.file_path}
                                                target="_blank"
                                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                            >
                                                <DocumentDownload size="18" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submission Statistics */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                                        Submission Summary
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Submission Rate</span>
                                                <span className="font-medium">
                                                    {
                                                        assignment.stats
                                                            .submission_rate
                                                    }
                                                    %
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full"
                                                    style={{
                                                        width: `${assignment.stats.submission_rate}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-3 rounded-lg border">
                                                <div className="text-xl font-bold text-blue-600">
                                                    {
                                                        assignment.stats
                                                            .submitted_count
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Submitted
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border">
                                                <div className="text-xl font-bold text-green-600">
                                                    {
                                                        assignment.stats
                                                            .graded_count
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Graded
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border">
                                                <div className="text-xl font-bold text-amber-600">
                                                    {
                                                        assignment.stats
                                                            .pending_count
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Pending
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border">
                                                <div className="text-xl font-bold text-red-600">
                                                    {
                                                        assignment.stats
                                                            .not_submitted_count
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Not Submitted
                                                </div>
                                            </div>
                                        </div>

                                        {/* Export Button */}
                                        <button
                                            onClick={handleExport}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <Export size="18" />
                                            <span>
                                                Export Submissions as CSV
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Links */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="flex items-center gap-2 text-lg font-medium text-blue-700 mb-3">
                                        <InfoCircle size="18" />
                                        <span>Quick Actions</span>
                                    </h3>
                                    <div className="space-y-2">
                                        <Link
                                            href={route(
                                                "teacher.submissions.index",
                                                assignment.id
                                            )}
                                            className="w-full flex items-center justify-between px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <span>
                                                View & Grade Submissions
                                            </span>
                                            <MessageEdit
                                                size="18"
                                                className="text-purple-600"
                                            />
                                        </Link>
                                        <Link
                                            href={route(
                                                "teacher.assignments.edit",
                                                assignment.id
                                            )}
                                            className="w-full flex items-center justify-between px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <span>Edit Assignment</span>
                                            <Edit2
                                                size="18"
                                                className="text-amber-600"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Student Submissions List */}
                            <div className="md:col-span-3 mt-6">
                                <h3 className="text-lg font-medium text-gray-700 pb-2 border-b mb-4">
                                    Student Submission Status
                                </h3>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Student
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        NISN
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Submitted At
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Grade
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {assignment.student_statuses
                                                    .length > 0 ? (
                                                    assignment.student_statuses.map(
                                                        (student) => (
                                                            <tr
                                                                key={student.id}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            student.name
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-500">
                                                                        {
                                                                            student.nisn
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span
                                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                                                                            student.status
                                                                        )}`}
                                                                    >
                                                                        {getStatusText(
                                                                            student.status
                                                                        )}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm text-gray-500">
                                                                        {student.submitted_at
                                                                            ? new Date(
                                                                                  student.submitted_at
                                                                              ).toLocaleString()
                                                                            : "-"}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium">
                                                                        {student.grade
                                                                            ? `${student.grade}/100`
                                                                            : "-"}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                    {student.has_submitted ? (
                                                                        <Link
                                                                            href={route(
                                                                                "teacher.submissions.show",
                                                                                student.submission_id
                                                                            )}
                                                                            className="text-blue-600 hover:text-blue-900 inline-block"
                                                                        >
                                                                            {student.grade
                                                                                ? "View"
                                                                                : "Grade"}
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="text-gray-400">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="6"
                                                            className="px-6 py-4 text-center text-gray-500"
                                                        >
                                                            No students found
                                                            for this class.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-3 mt-6 flex justify-end space-x-3">
                                <Link
                                    href={route("teacher.assignments.index", {
                                        subject_id: subject.id,
                                    })}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Back to Assignments
                                </Link>
                                <Link
                                    href={route(
                                        "teacher.submissions.index",
                                        assignment.id
                                    )}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                >
                                    View All Submissions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAssignmentShow;
