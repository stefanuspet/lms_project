import React from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    ArrowLeft2,
    ClipboardText,
    Calendar,
    Clock,
    Book1,
    Teacher,
    DocumentDownload,
    DocumentText,
    ClipboardTick,
    MessageEdit,
    Information,
    TickCircle,
    CloseCircle,
} from "iconsax-reactjs";

const StudentAssignmentShow = ({ assignment, submission, can_submit }) => {
    // Function to get days remaining text and color
    const getDaysRemainingText = (daysRemaining) => {
        if (daysRemaining > 7) {
            return {
                text: `${daysRemaining} days left`,
                color: "text-green-600",
            };
        } else if (daysRemaining > 3) {
            return {
                text: `${daysRemaining} days left`,
                color: "text-blue-600",
            };
        } else if (daysRemaining > 1) {
            return {
                text: `${daysRemaining} days left`,
                color: "text-yellow-600",
            };
        } else if (daysRemaining === 1) {
            return {
                text: "Due tomorrow",
                color: "text-orange-600",
            };
        } else if (daysRemaining === 0) {
            return {
                text: "Due today",
                color: "text-red-600",
            };
        } else {
            return {
                text: `${Math.abs(daysRemaining)} days overdue`,
                color: "text-red-600",
            };
        }
    };

    // Get days remaining info
    const daysRemainingInfo = getDaysRemainingText(assignment.days_remaining);

    return (
        <StudentLayout title={`Assignment: ${assignment.title}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("student.assignments.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Assignment Details
                            </h1>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            {assignment.file_path && (
                                <a
                                    href={`/storage/${assignment.file_path}`}
                                    download
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                    <DocumentDownload size="20" />
                                    <span>Download</span>
                                </a>
                            )}

                            {can_submit && (
                                <Link
                                    href={route(
                                        "student.assignments.submit",
                                        assignment.id
                                    )}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <ClipboardTick size="20" />
                                    <span>
                                        {submission
                                            ? "Resubmit"
                                            : "Submit Assignment"}
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Assignment Title and Info */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        {assignment.title}
                                    </h2>

                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Book1
                                                size="18"
                                                className="text-blue-600"
                                            />
                                            <span>
                                                {assignment.subject_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Teacher
                                                size="18"
                                                className="text-blue-600"
                                            />
                                            <span>
                                                {assignment.teacher_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar
                                                size="18"
                                                className="text-blue-600"
                                            />
                                            <span>
                                                Due:{" "}
                                                {assignment.formatted_deadline}
                                            </span>
                                        </div>

                                        {!assignment.is_overdue && (
                                            <div
                                                className={`flex items-center gap-2 text-sm ${daysRemainingInfo.color}`}
                                            >
                                                <Clock size="18" />
                                                <span>
                                                    {daysRemainingInfo.text}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Card */}
                                <div
                                    className={`p-4 rounded-lg ${
                                        submission && submission.grade !== null
                                            ? "bg-green-50 border border-green-200"
                                            : submission
                                            ? "bg-blue-50 border border-blue-200"
                                            : assignment.is_overdue
                                            ? "bg-red-50 border border-red-200"
                                            : "bg-yellow-50 border border-yellow-200"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {submission &&
                                        submission.grade !== null ? (
                                            <div className="p-2 bg-green-100 rounded-full">
                                                <TickCircle
                                                    size="20"
                                                    className="text-green-600"
                                                />
                                            </div>
                                        ) : submission ? (
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <TickCircle
                                                    size="20"
                                                    className="text-blue-600"
                                                />
                                            </div>
                                        ) : assignment.is_overdue ? (
                                            <div className="p-2 bg-red-100 rounded-full">
                                                <CloseCircle
                                                    size="20"
                                                    className="text-red-600"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-yellow-100 rounded-full">
                                                <Information
                                                    size="20"
                                                    className="text-yellow-600"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <h3
                                                className={`font-semibold ${
                                                    submission &&
                                                    submission.grade !== null
                                                        ? "text-green-800"
                                                        : submission
                                                        ? "text-blue-800"
                                                        : assignment.is_overdue
                                                        ? "text-red-800"
                                                        : "text-yellow-800"
                                                }`}
                                            >
                                                {submission &&
                                                submission.grade !== null
                                                    ? "Graded"
                                                    : submission
                                                    ? submission.is_late
                                                        ? "Submitted Late"
                                                        : "Submitted"
                                                    : assignment.is_overdue
                                                    ? "Deadline Passed"
                                                    : "Not Submitted"}
                                            </h3>

                                            <p
                                                className={`text-sm mt-1 ${
                                                    submission &&
                                                    submission.grade !== null
                                                        ? "text-green-700"
                                                        : submission
                                                        ? "text-blue-700"
                                                        : assignment.is_overdue
                                                        ? "text-red-700"
                                                        : "text-yellow-700"
                                                }`}
                                            >
                                                {submission &&
                                                submission.grade !== null
                                                    ? `Your grade: ${submission.grade}`
                                                    : submission
                                                    ? `Submitted on ${submission.submitted_at}`
                                                    : assignment.is_overdue
                                                    ? "You missed the deadline for this assignment"
                                                    : "This assignment is waiting for your submission"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Assignment File */}
                                {assignment.file_path && (
                                    <div className="bg-gray-50 p-5 rounded-lg border mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <DocumentText
                                                        size="24"
                                                        className="text-blue-600"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        Assignment File
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {assignment.file_name}
                                                    </p>
                                                </div>
                                            </div>

                                            <a
                                                href={`/storage/${assignment.file_path}`}
                                                download
                                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                                            >
                                                <DocumentDownload size="16" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Assignment Description */}
                                <div className="bg-white rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Description
                                    </h3>

                                    {assignment.description ? (
                                        <div className="prose max-w-none">
                                            {assignment.description
                                                .split("\n")
                                                .map((paragraph, idx) => (
                                                    <p
                                                        key={idx}
                                                        className="mb-4"
                                                    >
                                                        {paragraph}
                                                    </p>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">
                                            No additional description provided.
                                        </p>
                                    )}
                                </div>

                                {/* Submission Section */}
                                {submission && (
                                    <div className="mt-8 border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <MessageEdit
                                                size="20"
                                                className="text-blue-600"
                                            />
                                            <span>Your Submission</span>
                                        </h3>

                                        <div className="bg-gray-50 p-5 rounded-lg border mb-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <ClipboardTick
                                                            size="24"
                                                            className="text-blue-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            Submitted on{" "}
                                                            {
                                                                submission.submitted_at
                                                            }
                                                        </h4>
                                                        {submission.is_late && (
                                                            <p className="text-sm text-red-500">
                                                                Late submission
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={route(
                                                        "student.submissions.show",
                                                        submission.id
                                                    )}
                                                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 text-sm"
                                                >
                                                    <ClipboardTick size="16" />
                                                    <span>
                                                        View Full Submission
                                                    </span>
                                                </Link>
                                            </div>

                                            {submission.file_path && (
                                                <div className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg">
                                                    <DocumentText
                                                        size="20"
                                                        className="text-blue-600"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {
                                                                submission.file_name
                                                            }
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={`/storage/${submission.file_path}`}
                                                        download
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            )}

                                            {submission.submission_text && (
                                                <div className="bg-white p-3 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto">
                                                    {submission.submission_text
                                                        .split("\n")
                                                        .map(
                                                            (
                                                                paragraph,
                                                                idx
                                                            ) => (
                                                                <p
                                                                    key={idx}
                                                                    className="mb-2"
                                                                >
                                                                    {paragraph}
                                                                </p>
                                                            )
                                                        )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Grade Information */}
                                        {submission.grade !== null && (
                                            <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <ClipboardTick
                                                            size="24"
                                                            className="text-green-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            Your Grade
                                                        </h4>
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {submission.grade}
                                                        </p>
                                                    </div>
                                                </div>

                                                {submission.message_eval && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-2">
                                                            Teacher's Feedback:
                                                        </h4>
                                                        <div className="bg-white p-4 rounded-lg text-gray-700">
                                                            {submission.message_eval
                                                                .split("\n")
                                                                .map(
                                                                    (
                                                                        paragraph,
                                                                        idx
                                                                    ) => (
                                                                        <p
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="mb-2"
                                                                        >
                                                                            {
                                                                                paragraph
                                                                            }
                                                                        </p>
                                                                    )
                                                                )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Deadline Card */}
                                <div className="bg-white rounded-xl shadow-sm border p-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Calendar
                                            size="20"
                                            className="text-blue-600"
                                        />
                                        <span>Deadline</span>
                                    </h3>

                                    <div className="text-center py-3">
                                        <p className="text-2xl font-bold text-gray-800">
                                            {assignment.formatted_deadline}
                                        </p>
                                        <p
                                            className={`text-sm mt-1 font-medium ${daysRemainingInfo.color}`}
                                        >
                                            {daysRemainingInfo.text}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t">
                                        {!submission &&
                                            !assignment.is_overdue && (
                                                <Link
                                                    href={route(
                                                        "student.assignments.submit",
                                                        assignment.id
                                                    )}
                                                    className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2"
                                                >
                                                    Submit Assignment
                                                </Link>
                                            )}

                                        {submission &&
                                            !submission.grade &&
                                            can_submit && (
                                                <Link
                                                    href={route(
                                                        "student.assignments.submit",
                                                        assignment.id
                                                    )}
                                                    className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2"
                                                >
                                                    Resubmit Assignment
                                                </Link>
                                            )}

                                        {submission && (
                                            <Link
                                                href={route(
                                                    "student.submissions.show",
                                                    submission.id
                                                )}
                                                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mt-2"
                                            >
                                                View Your Submission
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Subject Card */}
                                <div className="bg-blue-50 rounded-xl shadow-sm p-5 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        <Book1
                                            size="20"
                                            className="text-blue-600"
                                        />
                                        <span>Subject Information</span>
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-blue-800 font-medium">
                                                Subject
                                            </p>
                                            <p className="text-blue-700">
                                                {assignment.subject_name}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-blue-800 font-medium">
                                                Teacher
                                            </p>
                                            <p className="text-blue-700">
                                                {assignment.teacher_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-blue-200">
                                        <Link
                                            href={route(
                                                "student.subjects.show",
                                                assignment.subject_id
                                            )}
                                            className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2"
                                        >
                                            Go to Subject Page
                                        </Link>
                                    </div>
                                </div>

                                {/* Instructions Card */}
                                <div className="bg-amber-50 rounded-xl shadow-sm p-5 border border-amber-100">
                                    <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                        <Information
                                            size="20"
                                            className="text-amber-600"
                                        />
                                        <span>Submission Guidelines</span>
                                    </h3>

                                    <ul className="space-y-2 text-sm text-amber-700">
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>
                                                Read the assignment instructions
                                                carefully
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>
                                                Submit before the deadline to
                                                avoid penalties
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>
                                                Make sure your file is in the
                                                correct format
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>
                                                You can submit text or upload a
                                                file
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>Maximum file size: 10MB</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex justify-between">
                        <Link
                            href={route("student.assignments.index")}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft2 size="18" />
                            <span>Back to Assignments</span>
                        </Link>

                        {!submission && !assignment.is_overdue && (
                            <Link
                                href={route(
                                    "student.assignments.submit",
                                    assignment.id
                                )}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <ClipboardTick size="18" />
                                <span>Submit Assignment</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentAssignmentShow;
