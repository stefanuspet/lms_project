import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { ArrowLeft2 } from "iconsax-reactjs";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherMaterialCreate = ({ subject }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        subject_id: subject.id,
        title: "",
        content: "",
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("teacher.materials.store"), {
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

    return (
        <TeacherLayout title={`Add Material - ${subject.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.materials.index", {
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
                                    Add New Material
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {subject.name} - {subject.class_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            <div className="grid grid-cols-1 gap-6">
                                {/* Material Title */}
                                <div>
                                    <InputLabel
                                        htmlFor="title"
                                        value="Material Title"
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
                                        placeholder="Enter material title"
                                    />
                                    <InputError
                                        message={errors.title}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Material Content */}
                                <div>
                                    <InputLabel
                                        htmlFor="content"
                                        value="Content"
                                        className="text-base"
                                    />
                                    <textarea
                                        id="content"
                                        name="content"
                                        value={data.content}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="Enter material content or description"
                                    />
                                    <InputError
                                        message={errors.content}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Material File */}
                                <div>
                                    <InputLabel
                                        htmlFor="file"
                                        value="Attachment (optional)"
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
                                            You can provide text content, a
                                            file, or both.
                                        </li>
                                        <li>File size limit is 20MB.</li>
                                        <li>
                                            Supported file types: PDF, DOC,
                                            DOCX, XLS, XLSX, PPT, PPTX, JPG,
                                            PNG, MP4.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("teacher.materials.index", {
                                        subject_id: subject.id,
                                    })}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Upload Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherMaterialCreate;
