import React from "react";
import { Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { ArrowLeft2, Calendar, Book1, ClockCircle } from "iconsax-reactjs";

const EnrollmentHistory = ({ student, enrollments }) => {
    return (
        <AuthenticatedLayout title={`Enrollment History: ${student.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.enrollments.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Enrollment History
                            </h1>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="px-6 py-5 border-b">
                        <h2 className="font-semibold text-gray-700 mb-3">
                            Student Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">
                                    Name
                                </div>
                                <div className="font-medium">
                                    {student.name}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">
                                    NISN
                                </div>
                                <div className="font-medium">
                                    {student.nisn}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">
                                    Email
                                </div>
                                <div className="font-medium">
                                    {student.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-6">
                        <h2 className="font-semibold text-gray-700 mb-4">
                            Enrollment Timeline
                        </h2>

                        {enrollments && enrollments.length > 0 ? (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200"></div>

                                {/* Timeline items */}
                                <div className="space-y-8">
                                    {enrollments.map((enrollment, index) => (
                                        <div
                                            key={enrollment.id}
                                            className="relative pl-10"
                                        >
                                            {/* Timeline dot */}
                                            <div className="absolute left-0 top-1 h-7 w-7 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center">
                                                <Calendar
                                                    size="16"
                                                    className="text-amber-600"
                                                />
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {
                                                            enrollment.semester
                                                                .name
                                                        }
                                                    </h3>
                                                    <div className="text-sm text-gray-500 mt-1 md:mt-0">
                                                        <div className="flex items-center">
                                                            <Calendar
                                                                size="14"
                                                                className="mr-1"
                                                            />
                                                            {
                                                                enrollment
                                                                    .semester
                                                                    .start_date
                                                            }{" "}
                                                            to{" "}
                                                            {
                                                                enrollment
                                                                    .semester
                                                                    .end_date
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-4 mt-3">
                                                    <div className="flex items-center bg-white px-3 py-2 rounded border border-gray-200">
                                                        <Book1
                                                            size="16"
                                                            className="text-blue-500 mr-2"
                                                        />
                                                        <span className="text-sm">
                                                            Class:{" "}
                                                            <span className="font-medium">
                                                                {
                                                                    enrollment
                                                                        .class
                                                                        .name
                                                                }
                                                            </span>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center bg-white px-3 py-2 rounded border border-gray-200">
                                                        <ClockCircle
                                                            size="16"
                                                            className="text-gray-500 mr-2"
                                                        />
                                                        <span className="text-sm">
                                                            Enrolled on:{" "}
                                                            <span className="font-medium">
                                                                {
                                                                    enrollment.enrolled_at
                                                                }
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                                <p className="text-gray-500">
                                    No enrollment history found for this student
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 border-t flex justify-end space-x-3">
                        <Link
                            href={route("admin.enrollments.index")}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Back to Enrollment Management
                        </Link>
                        <Link
                            href={route("admin.students.show", student.id)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            View Student Profile
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default EnrollmentHistory;
