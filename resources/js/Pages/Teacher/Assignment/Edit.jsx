import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { ArrowLeft2, DocumentDownload, CloseCircle } from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherAssignmentEdit = ({ assignment, subject }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT",
        title: assignment.title || "",
        description: assignment.description || "",
        file: null,
        remove_file: false,
        deadline: assignment.deadline
            ? new Date(assignment.deadline).toISOString().slice(0, 16)
            : "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("teacher.assignments.update", assignment.id), {
            forceFormData: true,
        });
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
            setData(name, files[0]);
            setSelectedFile(files[0] ? files[0].name : null);
        } else {
            setData(name, value);
        }
    };

    const handleRemoveFile = () => {
        setData("remove_file", true);
    };

    // Get min date for deadline (today)
    const getMinDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}T00:00`;
    };

    // Check if assignment already has submissions
    const hasSubmissions =
        assignment.stats && assignment.stats.submitted_count > 0;

    // Check if deadline is in the past
    const isPastDeadline = new Date() > new Date(assignment.deadline);

    return (
        <TeacherLayout title={`Edit Assignment - ${subject.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route(
                                    "teacher.assignments.show",
                                    assignment.id
                                )}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Edit Assignment
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {subject.name} - {subject.class_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        {/* Warning message if assignment has submissions */}
                        {hasSubmissions && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-yellow-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Caution:</strong> This
                                            assignment already has{" "}
                                            {assignment.stats.submitted_count}{" "}
                                            submissions.
                                            {isPastDeadline
                                                ? " The deadline has passed. You cannot change the deadline."
                                                : " Changing the deadline may impact students who are working on this assignment."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            <div className="grid grid-cols-1 gap-6">
                                {/* Assignment Title */}
                                <div>
                                    <InputLabel
                                        htmlFor="title"
                                        value="Assignment Title"
                                        className="text-base"
                                    />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={data.title}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter assignment title"
                                    />
                                    <InputError
                                        message={errors.title}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Assignment Description */}
                                <div>
                                    <InputLabel
                                        htmlFor="description"
                                        value="Assignment Instructions"
                                        className="text-base"
                                    />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="Enter detailed instructions for students"
                                    />
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Assignment Deadline */}
                                <div>
                                    <InputLabel
                                        htmlFor="deadline"
                                        value="Deadline"
                                        className="text-base"
                                    />
                                    <TextInput
                                        id="deadline"
                                        type="datetime-local"
                                        name="deadline"
                                        value={data.deadline}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                        min={getMinDate()}
                                        disabled={
                                            hasSubmissions && isPastDeadline
                                        }
                                    />
                                    {hasSubmissions && isPastDeadline && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            The deadline cannot be changed
                                            because it has already passed and
                                            there are submissions.
                                        </p>
                                    )}
                                    <InputError
                                        message={errors.deadline}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Current File */}
                                {assignment.file_path && !data.remove_file && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <InputLabel
                                            value="Current File"
                                            className="text-base mb-2"
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-700">
                                                    {assignment.file_path
                                                        .split("/")
                                                        .pop()}
                                                </span>
                                                <a
                                                    href={assignment.file_path}
                                                    target="_blank"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <DocumentDownload size="18" />
                                                    <span>Download</span>
                                                </a>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                            >
                                                <CloseCircle size="18" />
                                                <span>Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Assignment File */}
                                <div>
                                    <InputLabel
                                        htmlFor="file"
                                        value={
                                            assignment.file_path &&
                                            !data.remove_file
                                                ? "Replace File (optional)"
                                                : "Attachment (optional)"
                                        }
                                        className="text-base"
                                    />
                                    <div className="mt-1 flex items-center">
                                        <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-700 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-8 w-8 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>
                                            <span className="mt-2 text-sm font-medium">
                                                {selectedFile
                                                    ? selectedFile
                                                    : "Upload a file or drag and drop"}
                                            </span>
                                            <span className="mt-1 text-xs text-gray-500">
                                                PDF, Word, Excel, PowerPoint,
                                                Images, or Videos
                                            </span>
                                            <input
                                                id="file"
                                                type="file"
                                                name="file"
                                                className="hidden"
                                                onChange={handleChange}
                                            />
                                        </label>
                                    </div>
                                    <InputError
                                        message={errors.file}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Form Info */}
                                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                                    <p className="font-medium">Information:</p>
                                    <ul className="list-disc list-inside space-y-1 mt-1">
                                        <li>
                                            Set a reasonable deadline for
                                            students to complete the assignment.
                                        </li>
                                        <li>
                                            You can provide detailed
                                            instructions in the description
                                            field.
                                        </li>
                                        <li>File size limit is 10MB.</li>
                                        <li>
                                            Supported file types: PDF, DOC,
                                            DOCX, XLS, XLSX, PPT, PPTX, JPG,
                                            PNG, MP4.
                                        </li>
                                        <li>
                                            Students will be automatically
                                            notified of any changes to the
                                            deadline.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route(
                                        "teacher.assignments.show",
                                        assignment.id
                                    )}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Update Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAssignmentEdit;
