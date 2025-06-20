import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    Calendar,
    Clock,
    BookSquare,
    People,
    Timer1,
    SaveAdd,
} from "iconsax-reactjs";

const TeacherAttendanceCreate = ({ subjects, active_semester }) => {
    const [values, setValues] = useState({
        subject_id: "",
        date: new Date().toISOString().substr(0, 10), // Today's date in YYYY-MM-DD format
        expires_minutes: 60, // Default to 60 minutes
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // Handle form input changes
    const handleChange = (e) => {
        const key = e.target.id;
        const value = e.target.value;
        setValues((values) => ({
            ...values,
            [key]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        // Clear previous errors
        setErrors({});

        // Validate form
        let formErrors = {};
        if (!values.subject_id) {
            formErrors.subject_id = "Please select a subject";
        }
        if (!values.date) {
            formErrors.date = "Please select a date";
        }
        if (!values.expires_minutes || values.expires_minutes < 5) {
            formErrors.expires_minutes = "Session must be at least 5 minutes";
        }

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setProcessing(false);
            return;
        }

        // Submit form
        router.post(route("teacher.attendance.store"), values, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    return (
        <TeacherLayout title="Create Attendance Session">
            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.attendance.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Create Attendance Session
                            </h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Active semester check */}
                        {!active_semester && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-yellow-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
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
                                            No active semester found. Please
                                            contact administrator before
                                            creating attendance sessions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Subject Selection */}
                                <div className="col-span-1">
                                    <label
                                        htmlFor="subject_id"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Subject *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <BookSquare
                                                size="20"
                                                className="text-gray-400"
                                            />
                                        </div>
                                        <select
                                            id="subject_id"
                                            value={values.subject_id}
                                            onChange={handleChange}
                                            className={`pl-10 block w-full rounded-md border ${
                                                errors.subject_id
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                            disabled={
                                                processing || !active_semester
                                            }
                                        >
                                            <option value="">
                                                Select a subject
                                            </option>
                                            {subjects.map((subject) => (
                                                <option
                                                    key={subject.id}
                                                    value={subject.id}
                                                >
                                                    {subject.name} -{" "}
                                                    {subject.class_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.subject_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.subject_id}
                                        </p>
                                    )}
                                </div>

                                {/* Date Selection */}
                                <div className="col-span-1">
                                    <label
                                        htmlFor="date"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Date *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar
                                                size="20"
                                                className="text-gray-400"
                                            />
                                        </div>
                                        <input
                                            type="date"
                                            id="date"
                                            value={values.date}
                                            onChange={handleChange}
                                            className={`pl-10 block w-full rounded-md border ${
                                                errors.date
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                            disabled={
                                                processing || !active_semester
                                            }
                                        />
                                    </div>
                                    {errors.date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.date}
                                        </p>
                                    )}
                                </div>

                                {/* Session Duration */}
                                <div className="col-span-1 md:col-span-2">
                                    <label
                                        htmlFor="expires_minutes"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Session Duration (in minutes) *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Timer1
                                                size="20"
                                                className="text-gray-400"
                                            />
                                        </div>
                                        <input
                                            type="number"
                                            id="expires_minutes"
                                            value={values.expires_minutes}
                                            onChange={handleChange}
                                            min="5"
                                            max="1440" // 24 hours in minutes
                                            className={`pl-10 block w-full rounded-md border ${
                                                errors.expires_minutes
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                            disabled={
                                                processing || !active_semester
                                            }
                                        />
                                    </div>
                                    {errors.expires_minutes && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.expires_minutes}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        This will determine how long the session
                                        PIN will be valid.
                                    </p>
                                </div>

                                {/* Active Semester Info */}
                                {active_semester && (
                                    <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-lg flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-blue-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                Active Semester:{" "}
                                                {active_semester.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-blue-700">
                                                Attendance sessions will be
                                                created for the current active
                                                semester.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div className="col-span-1 md:col-span-2 mt-6 flex justify-end space-x-3">
                                    <Link
                                        href={route("teacher.attendance.index")}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        disabled={
                                            processing || !active_semester
                                        }
                                    >
                                        <SaveAdd size="20" />
                                        <span>Create Session</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherAttendanceCreate;
