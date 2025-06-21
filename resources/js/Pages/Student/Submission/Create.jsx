import React, { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    ArrowLeft2,
    ClipboardText,
    Calendar,
    Clock,
    MessageEdit,
    DocumentUpload,
    Information,
    ClipboardTick,
    Book1,
    Teacher,
    CloseCircle,
} from "iconsax-reactjs";

const StudentSubmissionCreate = ({
    assignment,
    existing_submission,
    is_resubmission,
}) => {
    const [submissionType, setSubmissionType] = useState("text");
    const [uploadedFile, setUploadedFile] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        submission_text: existing_submission
            ? existing_submission.submission_text || ""
            : "",
        submission_file: null,
    });

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData("submission_file", file);
        setUploadedFile(file);
    };

    // Handle text change
    const handleTextChange = (e) => {
        setData("submission_text", e.target.value);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure at least one of text or file is provided
        if (!data.submission_text && !data.submission_file) {
            alert("Please provide either text or a file for your submission.");
            return;
        }

        // Submit the form
        post(route("student.submissions.store", assignment.id), {
            onSuccess: () => {
                reset();
                setUploadedFile(null);
            },
        });
    };

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
        <StudentLayout title={`Submit Assignment: ${assignment.title}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route(
                                    "student.assignments.show",
                                    assignment.id
                                )}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                {is_resubmission
                                    ? "Resubmit Assignment"
                                    : "Submit Assignment"}
                            </h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column - Main Form */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Assignment Details Summary */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <ClipboardText
                                                size="24"
                                                className="text-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-blue-800">
                                                {assignment.title}
                                            </h2>
                                            <p className="text-sm text-blue-700">
                                                {assignment.subject_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-blue-700">
                                            <Calendar size="16" />
                                            <span>
                                                Due:{" "}
                                                {assignment.formatted_deadline}
                                            </span>
                                        </div>
                                        <div
                                            className={`flex items-center gap-2 ${daysRemainingInfo.color}`}
                                        >
                                            <Clock size="16" />
                                            <span>
                                                {daysRemainingInfo.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submission Form */}
                                <form onSubmit={handleSubmit}>
                                    <div className="bg-white p-6 rounded-lg border">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            Your Submission
                                        </h3>

                                        {/* Submission Type Selection */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Submission Type
                                            </label>
                                            <div className="flex space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSubmissionType(
                                                            "text"
                                                        )
                                                    }
                                                    className={`px-4 py-2 rounded-md ${
                                                        submissionType ===
                                                        "text"
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    } transition-colors flex items-center gap-2`}
                                                >
                                                    <MessageEdit size="18" />
                                                    <span>Text Submission</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSubmissionType(
                                                            "file"
                                                        )
                                                    }
                                                    className={`px-4 py-2 rounded-md ${
                                                        submissionType ===
                                                        "file"
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    } transition-colors flex items-center gap-2`}
                                                >
                                                    <DocumentUpload size="18" />
                                                    <span>File Upload</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Text Submission */}
                                        {submissionType === "text" && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Submission Text
                                                </label>
                                                <textarea
                                                    value={data.submission_text}
                                                    onChange={handleTextChange}
                                                    rows="8"
                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                                    placeholder="Type your submission here..."
                                                ></textarea>
                                                {errors.submission_text && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.submission_text}
                                                    </p>
                                                )}

                                                <p className="mt-2 text-sm text-gray-500">
                                                    You can include both text
                                                    and a file in your
                                                    submission.
                                                </p>
                                            </div>
                                        )}

                                        {/* File Upload */}
                                        {submissionType === "file" && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Upload File
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-500 transition-colors">
                                                    {!uploadedFile ? (
                                                        <>
                                                            <DocumentUpload
                                                                size="48"
                                                                className="mx-auto text-gray-400 mb-3"
                                                            />
                                                            <p className="text-gray-600 mb-2">
                                                                Drag and drop
                                                                your file here,
                                                                or click to
                                                                browse
                                                            </p>
                                                            <p className="text-xs text-gray-500 mb-3">
                                                                Maximum file
                                                                size: 10MB
                                                            </p>
                                                            <input
                                                                type="file"
                                                                onChange={
                                                                    handleFileChange
                                                                }
                                                                className="hidden"
                                                                id="file-upload"
                                                            />
                                                            <label
                                                                htmlFor="file-upload"
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                                                            >
                                                                Browse Files
                                                            </label>
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <div className="flex items-center justify-center mb-3">
                                                                <DocumentUpload
                                                                    size="32"
                                                                    className="text-blue-600 mr-2"
                                                                />
                                                                <span className="text-gray-800 font-medium">
                                                                    {
                                                                        uploadedFile.name
                                                                    }
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-3">
                                                                File size:{" "}
                                                                {(
                                                                    uploadedFile.size /
                                                                    1024 /
                                                                    1024
                                                                ).toFixed(
                                                                    2
                                                                )}{" "}
                                                                MB
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setUploadedFile(
                                                                        null
                                                                    );
                                                                    setData(
                                                                        "submission_file",
                                                                        null
                                                                    );
                                                                }}
                                                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                                                            >
                                                                Remove File
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {errors.submission_file && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.submission_file}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Existing Submission Info */}
                                        {is_resubmission && (
                                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Information
                                                        size="20"
                                                        className="text-yellow-600"
                                                    />
                                                    <h4 className="font-medium text-yellow-800">
                                                        Resubmission Information
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-yellow-700 mb-2">
                                                    You've already submitted
                                                    this assignment on{" "}
                                                    {
                                                        existing_submission.submitted_at
                                                    }
                                                    . Submitting again will
                                                    replace your previous
                                                    submission.
                                                </p>

                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className="flex-1">
                                                        {existing_submission.file_name && (
                                                            <p className="text-sm text-yellow-700">
                                                                Previous file:{" "}
                                                                {
                                                                    existing_submission.file_name
                                                                }
                                                            </p>
                                                        )}
                                                        {existing_submission.submission_text && (
                                                            <p className="text-sm text-yellow-700">
                                                                Previous text
                                                                submission:{" "}
                                                                {
                                                                    existing_submission
                                                                        .submission_text
                                                                        .length
                                                                }{" "}
                                                                characters
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            "student.submissions.show",
                                                            existing_submission.id
                                                        )}
                                                        className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                                                    >
                                                        View Previous
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submission Button */}
                                        <div className="mt-6 flex justify-end space-x-3">
                                            <Link
                                                href={route(
                                                    "student.assignments.show",
                                                    assignment.id
                                                )}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    (!data.submission_text &&
                                                        !data.submission_file)
                                                }
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <ClipboardTick size="18" />
                                                <span>
                                                    {processing
                                                        ? "Submitting..."
                                                        : is_resubmission
                                                        ? "Resubmit Assignment"
                                                        : "Submit Assignment"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Right Column - Info */}
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
                                </div>

                                {/* Submission Guidelines */}
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
                                                You can submit text, a file, or
                                                both
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>Maximum file size: 10MB</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>
                                                Acceptable file formats: PDF,
                                                DOC, DOCX, JPG, PNG
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>
                                                Make sure your name is included
                                                in your submission
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>
                                                Late submissions may be
                                                penalized
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            <span>
                                                You can resubmit until the
                                                deadline
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentSubmissionCreate;
