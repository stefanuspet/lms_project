import React from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    Edit2,
    Trash,
    DocumentDownload,
    Video,
    Document,
    Gallery,
    Clock,
    Calendar,
} from "iconsax-reactjs";
import { router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";

const TeacherMaterialShow = ({ material, subject }) => {
    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this material?")) {
            router.delete(route("teacher.materials.destroy", material.id), {
                onSuccess: () => {
                    router.visit(
                        route("teacher.materials.index", {
                            subject_id: subject.id,
                        })
                    );
                },
            });
        }
    };

    // Get icon for file type
    const getFileTypeIcon = (fileType) => {
        if (!fileType) return <Document size="20" className="text-gray-600" />;

        if (fileType.includes("pdf")) {
            return <Document size="20" className="text-red-600" />;
        } else if (fileType.includes("video")) {
            return <Video size="20" className="text-blue-600" />;
        } else if (fileType.includes("image")) {
            return <Gallery size="20" className="text-green-600" />;
        } else if (fileType.includes("word") || fileType.includes("doc")) {
            return <Document size="20" className="text-blue-600" />;
        } else if (
            fileType.includes("excel") ||
            fileType.includes("sheet") ||
            fileType.includes("xls")
        ) {
            return <Document size="20" className="text-green-600" />;
        } else if (
            fileType.includes("ppt") ||
            fileType.includes("presentation")
        ) {
            return <Document size="20" className="text-amber-600" />;
        } else {
            return <Document size="20" className="text-gray-600" />;
        }
    };

    return (
        <TeacherLayout title={`Material: ${material.title}`}>
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
                                    Material Details
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {subject.name} - {subject.class_name}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={route(
                                    "teacher.materials.edit",
                                    material.id
                                )}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                <Edit2 size="20" />
                                <span>Edit</span>
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <Trash size="20" />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Material Title */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {material.title}
                                </h2>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar size="16" />
                                        <span>
                                            Uploaded: {material.created_at}
                                        </span>
                                    </div>
                                    {material.created_at !==
                                        material.updated_at && (
                                        <div className="flex items-center gap-1">
                                            <Clock size="16" />
                                            <span>
                                                Updated: {material.updated_at}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* File Information */}
                            {material.file_path && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Attached File
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getFileTypeIcon(
                                                material.file_type
                                            )}
                                            <span className="text-gray-700">
                                                {material.file_path
                                                    .split("/")
                                                    .pop()}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                ({material.file_type})
                                            </span>
                                        </div>
                                        <a
                                            href={material.file_path}
                                            target="_blank"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <DocumentDownload size="20" />
                                            <span>Download</span>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Material Content */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">
                                    Content
                                </h3>
                                {material.content ? (
                                    <div className="prose max-w-none">
                                        <div className="bg-white border rounded-lg p-4">
                                            {material.content
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
                                        No content provided.
                                    </p>
                                )}
                            </div>

                            {/* Preview for supported file types */}
                            {material.file_type && material.file_path && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Preview
                                    </h3>
                                    {material.file_type.includes("pdf") && (
                                        <div className="border rounded-lg overflow-hidden h-96">
                                            <iframe
                                                src={`${material.file_path}#toolbar=0`}
                                                className="w-full h-full"
                                                title={material.title}
                                            />
                                        </div>
                                    )}

                                    {material.file_type.includes("image") && (
                                        <div className="border rounded-lg overflow-hidden flex justify-center">
                                            <img
                                                src={material.file_path}
                                                alt={material.title}
                                                className="max-h-96 object-contain"
                                            />
                                        </div>
                                    )}

                                    {material.file_type.includes("video") && (
                                        <div className="border rounded-lg overflow-hidden">
                                            <video
                                                src={material.file_path}
                                                controls
                                                className="w-full max-h-96"
                                            />
                                        </div>
                                    )}

                                    {!material.file_type.includes("pdf") &&
                                        !material.file_type.includes("image") &&
                                        !material.file_type.includes(
                                            "video"
                                        ) && (
                                            <p className="text-gray-500 italic">
                                                Preview not available for this
                                                file type. Please download the
                                                file to view it.
                                            </p>
                                        )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("teacher.materials.index", {
                                        subject_id: subject.id,
                                    })}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Back to Materials
                                </Link>
                                <Link
                                    href={route(
                                        "teacher.materials.edit",
                                        material.id
                                    )}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Edit Material
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherMaterialShow;
