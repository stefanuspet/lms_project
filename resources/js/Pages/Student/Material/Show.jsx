import React from "react";
import { Link, usePage } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    ArrowLeft2,
    DocumentText,
    Calendar,
    Book1,
    Teacher,
    DocumentDownload,
    Document,
    VideoPlay,
    Image as ImageIcon,
    // PdfDocument,
    DocumentCloud,
    // EmptyPageCircle,
} from "iconsax-reactjs";

const StudentMaterialShow = ({ material, related_materials }) => {
    const { flash } = usePage().props;

    // Function to get file icon based on file type
    const getFileIcon = (fileType, fileExtension, size = "24") => {
        if (!fileType)
            return <DocumentText size={size} className="text-blue-600" />;

        const type = fileType.toLowerCase();
        const ext = fileExtension ? fileExtension.toLowerCase() : "";

        if (type.includes("pdf") || ext === "pdf") {
            return <Document size={size} className="text-red-600" />;
        } else if (
            type.includes("video") ||
            ["mp4", "avi", "mov", "wmv"].includes(ext)
        ) {
            return <VideoPlay size={size} className="text-purple-600" />;
        } else if (
            type.includes("image") ||
            ["jpg", "jpeg", "png", "gif"].includes(ext)
        ) {
            return <ImageIcon size={size} className="text-green-600" />;
        } else if (["doc", "docx", "odt"].includes(ext)) {
            return <Document size={size} className="text-blue-600" />;
        } else if (["xls", "xlsx", "csv"].includes(ext)) {
            return <Document size={size} className="text-green-600" />;
        } else if (["ppt", "pptx"].includes(ext)) {
            return <Document size={size} className="text-orange-600" />;
        } else {
            return <DocumentCloud size={size} className="text-gray-600" />;
        }
    };

    // Function to render appropriate file preview
    const renderFilePreview = () => {
        if (!material.file_path) return null;

        const fileType = material.file_type?.toLowerCase() || "";
        const ext = material.file_extension?.toLowerCase() || "";

        // PDF preview
        if (fileType.includes("pdf") || ext === "pdf") {
            return (
                <div className="bg-gray-100 p-4 rounded-lg mb-6 flex flex-col items-center">
                    <Document size="80" className="text-red-600 mb-3" />
                    <p className="text-gray-800 font-medium mb-2">
                        {material.file_name}
                    </p>
                    <div className="flex space-x-3">
                        <a
                            href={`/storage/${material.file_path}`}
                            target="_blank"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            {/* <EmptyPageCircle size="18" /> */}
                            <span>Open PDF</span>
                        </a>
                        <a
                            href={route(
                                "student.materials.download",
                                material.id
                            )}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                            <DocumentDownload size="18" />
                            <span>Download</span>
                        </a>
                    </div>
                </div>
            );
        }

        // Image preview
        else if (
            fileType.includes("image") ||
            ["jpg", "jpeg", "png", "gif"].includes(ext)
        ) {
            return (
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <div className="mb-3 text-center">
                        <img
                            src={`/storage/${material.file_path}`}
                            alt={material.title}
                            className="max-w-full h-auto mx-auto rounded-lg max-h-[500px]"
                        />
                    </div>
                    <div className="flex justify-center">
                        <a
                            href={route(
                                "student.materials.download",
                                material.id
                            )}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                            <DocumentDownload size="18" />
                            <span>Download Image</span>
                        </a>
                    </div>
                </div>
            );
        }

        // Video preview
        else if (
            fileType.includes("video") ||
            ["mp4", "webm", "ogg"].includes(ext)
        ) {
            return (
                <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <div className="mb-3">
                        <video
                            controls
                            className="w-full rounded-lg max-h-[500px]"
                        >
                            <source
                                src={`/storage/${material.file_path}`}
                                type={material.file_type}
                            />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="flex justify-center">
                        <a
                            href={route(
                                "student.materials.download",
                                material.id
                            )}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                            <DocumentDownload size="18" />
                            <span>Download Video</span>
                        </a>
                    </div>
                </div>
            );
        }

        // Generic file download
        else {
            return (
                <div className="bg-gray-100 p-6 rounded-lg mb-6 flex flex-col items-center">
                    {getFileIcon(
                        material.file_type,
                        material.file_extension,
                        "80"
                    )}
                    <p className="text-gray-800 font-medium my-3">
                        {material.file_name}
                    </p>
                    <a
                        href={route("student.materials.download", material.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <DocumentDownload size="18" />
                        <span>Download File</span>
                    </a>
                </div>
            );
        }
    };

    return (
        <StudentLayout title={material.title}>
            {/* Flash messages */}
            {flash?.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>{flash.success}</p>
                </div>
            )}

            {flash?.error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>{flash.error}</p>
                </div>
            )}

            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("student.materials.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Learning Material
                            </h1>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            <Link
                                href={route(
                                    "student.subjects.show",
                                    material.subject_id
                                )}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                <Book1 size="20" />
                                <span>Go to Subject</span>
                            </Link>

                            {material.file_path && (
                                <a
                                    href={route(
                                        "student.materials.download",
                                        material.id
                                    )}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                >
                                    <DocumentDownload size="20" />
                                    <span>Download</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Content - Left/Center Column */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Material Title and Info */}
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        {material.title}
                                    </h2>

                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Book1
                                                size="18"
                                                className="text-blue-600"
                                            />
                                            <span>{material.subject_name}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Teacher
                                                size="18"
                                                className="text-blue-600"
                                            />
                                            <span>{material.teacher_name}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar
                                                size="18"
                                                className="text-blue-600"
                                            />
                                            <span>{material.created_at}</span>
                                        </div>

                                        {material.file_type && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                {getFileIcon(
                                                    material.file_type,
                                                    material.file_extension,
                                                    "18"
                                                )}
                                                <span>
                                                    {material.file_type}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* File Preview if available */}
                                {material.file_path && renderFilePreview()}

                                {/* Material Content */}
                                <div className="bg-white rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Content
                                    </h3>

                                    {material.content ? (
                                        <div className="prose max-w-none">
                                            {material.content
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
                                            No additional content provided.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar - Right Column */}
                            <div className="space-y-6">
                                {/* Related Materials Card */}
                                <div className="bg-gray-50 rounded-lg border p-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <DocumentText
                                            size="20"
                                            className="text-blue-600"
                                        />
                                        <span>Related Materials</span>
                                    </h3>

                                    {related_materials &&
                                    related_materials.length > 0 ? (
                                        <div className="space-y-3">
                                            {related_materials.map(
                                                (relatedMaterial) => (
                                                    <Link
                                                        key={relatedMaterial.id}
                                                        href={route(
                                                            "student.materials.show",
                                                            relatedMaterial.id
                                                        )}
                                                        className="block p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                                {getFileIcon(
                                                                    relatedMaterial.file_type,
                                                                    null,
                                                                    "18"
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
                                                                    {
                                                                        relatedMaterial.title
                                                                    }
                                                                </h4>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {
                                                                        relatedMaterial.created_at
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">
                                            No related materials found.
                                        </p>
                                    )}

                                    <div className="mt-4 pt-3 border-t">
                                        <Link
                                            href={route(
                                                "student.materials.index",
                                                {
                                                    subject_id:
                                                        material.subject_id,
                                                }
                                            )}
                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                        >
                                            <span>
                                                View all materials for this
                                                subject
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Subject Info Card */}
                                <div className="bg-blue-50 rounded-lg border border-blue-100 p-5">
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
                                                {material.subject_name}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-blue-800 font-medium">
                                                Teacher
                                            </p>
                                            <p className="text-blue-700">
                                                {material.teacher_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-blue-200">
                                        <Link
                                            href={route(
                                                "student.subjects.show",
                                                material.subject_id
                                            )}
                                            className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2"
                                        >
                                            Go to Subject Page
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t flex justify-between">
                        <Link
                            href={route("student.materials.index")}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft2 size="18" />
                            <span>Back to Materials</span>
                        </Link>

                        {material.file_path && (
                            <a
                                href={route(
                                    "student.materials.download",
                                    material.id
                                )}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <DocumentDownload size="18" />
                                <span>Download Material</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentMaterialShow;
