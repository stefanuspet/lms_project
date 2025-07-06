import React, { useState, useEffect } from "react";
import { Link, router, useForm } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    UserEdit,
    LockCircle,
    InfoCircle,
    Save2,
    Book1,
    People,
    Teacher,
    ClipboardTick,
    Calendar,
    Security,
    DeviceMessage,
    Call,
    LocationAdd,
    CloseCircle,
    TickCircle,
} from "iconsax-reactjs";

const TeacherProfileEdit = ({ teacher, stats, flash }) => {
    const [activeTab, setActiveTab] = useState("personal");

    // Profile form
    const {
        data: profileData,
        setData: setProfileData,
        post: postProfile,
        processing: profileProcessing,
        errors: profileErrors,
        reset: resetProfile,
    } = useForm({
        name: teacher.name || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        address: teacher.address || "",
    });

    // Password form
    const {
        data: passwordData,
        setData: setPasswordData,
        post: postPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handleProfileChange = (e) => {
        const { id, value } = e.target;
        setProfileData(id, value);
    };

    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        setPasswordData(id, value);
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        // Use PUT method as defined in routes
        router.put(route("teacher.profile.update"), profileData, {
            preserveScroll: true,
            onSuccess: () => {
                // Profile updated successfully
            },
            onError: (errors) => {
                // Handle profile update errors
                console.log("Profile update errors:", errors);
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        // Use PUT method as defined in routes
        router.put(route("teacher.profile.update"), passwordData, {
            preserveScroll: true,
            onSuccess: () => {
                resetPassword();
            },
            onError: (errors) => {
                // Handle password update errors
                console.log("Password update errors:", errors);
            },
        });
    };

    return (
        <TeacherLayout title="Edit Profile">
            {/* Flash message */}
            {flash?.success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.success}</p>
                </div>
            )}

            {flash?.error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.error}</p>
                </div>
            )}

            <div className="py-8 w-full">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                            <div className="-mt-12 px-6 pb-6">
                                <div className="flex justify-center">
                                    <div className="h-24 w-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                                        <Teacher
                                            variant="Bold"
                                            size="60"
                                            className="text-blue-600"
                                        />
                                    </div>
                                </div>
                                <div className="text-center mt-2">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {teacher.name}
                                    </h2>
                                    <p className="text-gray-500">
                                        NIP: {teacher.nip}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {teacher.email}
                                    </p>
                                </div>
                                <div className="mt-6 border-t pt-4">
                                    <h3 className="text-sm font-medium text-gray-600 mb-3">
                                        Teaching Statistics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Book1
                                                    size="20"
                                                    className="text-blue-600"
                                                />
                                                <span className="text-sm text-blue-700">
                                                    Subjects
                                                </span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                                {stats.subjects_count || 0}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <People
                                                    size="20"
                                                    className="text-purple-600"
                                                />
                                                <span className="text-sm text-purple-700">
                                                    Classes
                                                </span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                                {stats.classes_count || 0}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <ClipboardTick
                                                    size="20"
                                                    className="text-green-600"
                                                />
                                                <span className="text-sm text-green-700">
                                                    Materials
                                                </span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                                {stats.materials_count || 0}
                                            </p>
                                        </div>
                                        <div className="bg-amber-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <ClipboardTick
                                                    size="20"
                                                    className="text-amber-600"
                                                />
                                                <span className="text-sm text-amber-700">
                                                    Assignments
                                                </span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                                {stats.assignments_count || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Forms */}
                    <div className="w-full md:w-2/3">
                        <div className="bg-white rounded-xl shadow-sm">
                            {/* Navigation Tabs */}
                            <div className="px-6 pt-6 border-b">
                                <div className="flex space-x-6">
                                    <button
                                        onClick={() => setActiveTab("personal")}
                                        className={`pb-3 ${
                                            activeTab === "personal"
                                                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        Personal Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("security")}
                                        className={`pb-3 ${
                                            activeTab === "security"
                                                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        Security
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {/* Personal Information Tab */}
                                {activeTab === "personal" && (
                                    <form onSubmit={handleProfileSubmit}>
                                        <div className="space-y-6">
                                            {/* Full Name */}
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Full Name
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <UserEdit
                                                            size="20"
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        value={profileData.name}
                                                        onChange={
                                                            handleProfileChange
                                                        }
                                                        className={`pl-10 block w-full rounded-md border ${
                                                            profileErrors.name
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                                        disabled={
                                                            profileProcessing
                                                        }
                                                    />
                                                </div>
                                                {profileErrors.name && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {profileErrors.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <DeviceMessage
                                                            size="20"
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        value={
                                                            profileData.email
                                                        }
                                                        onChange={
                                                            handleProfileChange
                                                        }
                                                        className={`pl-10 block w-full rounded-md border ${
                                                            profileErrors.email
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                                        disabled={
                                                            profileProcessing
                                                        }
                                                    />
                                                </div>
                                                {profileErrors.email && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {profileErrors.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label
                                                    htmlFor="phone"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Phone Number
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Call
                                                            size="20"
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="phone"
                                                        value={
                                                            profileData.phone
                                                        }
                                                        onChange={
                                                            handleProfileChange
                                                        }
                                                        className={`pl-10 block w-full rounded-md border ${
                                                            profileErrors.phone
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                                        disabled={
                                                            profileProcessing
                                                        }
                                                    />
                                                </div>
                                                {profileErrors.phone && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {profileErrors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Address */}
                                            <div>
                                                <label
                                                    htmlFor="address"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Address
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                                                        <LocationAdd
                                                            size="20"
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                    <textarea
                                                        id="address"
                                                        value={
                                                            profileData.address
                                                        }
                                                        onChange={
                                                            handleProfileChange
                                                        }
                                                        rows="3"
                                                        className={`pl-10 block w-full rounded-md border ${
                                                            profileErrors.address
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                                        disabled={
                                                            profileProcessing
                                                        }
                                                    ></textarea>
                                                </div>
                                                {profileErrors.address && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {profileErrors.address}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    disabled={profileProcessing}
                                                >
                                                    <Save2 size="20" />
                                                    <span>
                                                        {profileProcessing
                                                            ? "Saving..."
                                                            : "Save Changes"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {/* Security Tab */}
                                {activeTab === "security" && (
                                    <form onSubmit={handlePasswordSubmit}>
                                        <div className="space-y-6">
                                            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                                                <div className="flex-shrink-0">
                                                    <InfoCircle
                                                        size="24"
                                                        className="text-blue-500"
                                                    />
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-blue-800">
                                                        Password Requirements
                                                    </h3>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        Your password must be at
                                                        least 8 characters long
                                                        and should include a mix
                                                        of letters, numbers, and
                                                        special characters for
                                                        better security.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Current Password */}
                                            <div>
                                                <label
                                                    htmlFor="current_password"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <LockCircle
                                                            size="20"
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        id="current_password"
                                                        value={
                                                            passwordData.current_password
                                                        }
                                                        onChange={
                                                            handlePasswordChange
                                                        }
                                                        className={`pl-10 block w-full rounded-md border ${
                                                            passwordErrors.current_password
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                                        disabled={
                                                            passwordProcessing
                                                        }
                                                    />
                                                </div>
                                                {passwordErrors.current_password && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            passwordErrors.current_password
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* New Password */}
                                            <div>
                                                <label
                                                    htmlFor="password"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Security
                                                            size="20"
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        id="password"
                                                        value={
                                                            passwordData.password
                                                        }
                                                        onChange={
                                                            handlePasswordChange
                                                        }
                                                        className={`pl-10 block w-full rounded-md border ${
                                                            passwordErrors.password
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                                        disabled={
                                                            passwordProcessing
                                                        }
                                                    />
                                                </div>
                                                {passwordErrors.password && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            passwordErrors.password
                                                        }
                                                    </p>
                                                )}
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="flex items-center">
                                                        {passwordData.password
                                                            .length >= 8 ? (
                                                            <TickCircle
                                                                size="16"
                                                                className="text-green-500 mr-1"
                                                            />
                                                        ) : (
                                                            <CloseCircle
                                                                size="16"
                                                                className="text-red-500 mr-1"
                                                            />
                                                        )}
                                                        <span className="text-xs text-gray-600">
                                                            At least 8
                                                            characters
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Confirm Password */}
                                            <div>
                                                <label
                                                    htmlFor="password_confirmation"
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    Confirm New Password
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <LockCircle
                                                            size="20"
                                                            className="text-gray-400"
                                                        />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        id="password_confirmation"
                                                        value={
                                                            passwordData.password_confirmation
                                                        }
                                                        onChange={
                                                            handlePasswordChange
                                                        }
                                                        className={`pl-10 block w-full rounded-md border ${
                                                            passwordErrors.password_confirmation
                                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        } py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
                                                        disabled={
                                                            passwordProcessing
                                                        }
                                                    />
                                                </div>
                                                {passwordErrors.password_confirmation && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            passwordErrors.password_confirmation
                                                        }
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center">
                                                    {passwordData.password &&
                                                    passwordData.password ===
                                                        passwordData.password_confirmation ? (
                                                        <TickCircle
                                                            size="16"
                                                            className="text-green-500 mr-1"
                                                        />
                                                    ) : (
                                                        <CloseCircle
                                                            size="16"
                                                            className="text-red-500 mr-1"
                                                        />
                                                    )}
                                                    <span className="text-xs text-gray-600">
                                                        Passwords match
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    disabled={
                                                        passwordProcessing
                                                    }
                                                >
                                                    <Security size="20" />
                                                    <span>
                                                        {passwordProcessing
                                                            ? "Updating..."
                                                            : "Update Password"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherProfileEdit;
