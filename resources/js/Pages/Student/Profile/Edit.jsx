import React, { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    UserOctagon,
    Calendar,
    Message,
    Lock1,
    PasswordCheck,
    LockCircle,
    Teacher,
    LocationDiscover,
    Profile2User,
    Building,
} from "iconsax-reactjs";
import InputError from "@/Components/InputError";

const StudentProfileEdit = ({ student, current_class }) => {
    const [editPassword, setEditPassword] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: student.name || "",
            email: student.email || "",
            gender: student.gender || "",
            birth_date: student.birth_date || "",
            birth_place: student.birth_place || "",
            religion: student.religion || "",
            current_password: "",
            new_password: "",
            new_password_confirmation: "",
        });

    const handleSubmit = (e) => {
        e.preventDefault();

        patch(route("student.profile.update"), {
            preserveScroll: true,
            onSuccess: () => {
                if (editPassword) {
                    setData("current_password", "");
                    setData("new_password", "");
                    setData("new_password_confirmation", "");
                    setEditPassword(false);
                }
            },
        });
    };

    return (
        <StudentLayout title="My Profile">
            <Head title="My Profile" />

            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm mb-6">
                    <div className="px-6 py-5 border-b flex items-center">
                        <Profile2User
                            size="28"
                            className="text-blue-600 mr-3"
                        />
                        <h1 className="font-bold text-xl text-gray-800">
                            My Profile
                        </h1>
                    </div>

                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                                <UserOctagon
                                    variant="Bold"
                                    size="60"
                                    className="text-blue-600"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold">
                                    {student.name}
                                </h2>
                                <p className="text-blue-100">
                                    NISN: {student.nisn}
                                </p>
                                <p className="text-blue-100">{student.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column: Personal Info Form */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                    <div className="flex items-center mb-2">
                                        <Building
                                            size="20"
                                            className="text-blue-600 mr-2"
                                        />
                                        <h3 className="font-semibold">
                                            Current Class
                                        </h3>
                                    </div>
                                    {current_class ? (
                                        <div className="ml-7">
                                            <p className="text-gray-700">
                                                <span className="font-medium">
                                                    {current_class.class_name}
                                                </span>{" "}
                                                - {current_class.semester_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {current_class.semester_period}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="ml-7 text-gray-500 italic">
                                            No class information available
                                        </p>
                                    )}
                                </div>

                                <h3 className="font-semibold text-gray-800 border-b pb-2">
                                    Update Profile Information
                                </h3>

                                {recentlySuccessful && (
                                    <div className="bg-green-100 text-green-700 p-4 rounded-lg">
                                        Profile updated successfully.
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Profile2User
                                                        size="18"
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData(
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-10 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.name}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Message
                                                        size="18"
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData(
                                                            "email",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-10 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Your email address"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.email}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Gender
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={data.gender || ""}
                                                    onChange={(e) =>
                                                        setData(
                                                            "gender",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-3 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">
                                                        Select Gender
                                                    </option>
                                                    <option value="male">
                                                        Male
                                                    </option>
                                                    <option value="female">
                                                        Female
                                                    </option>
                                                </select>
                                            </div>
                                            <InputError
                                                message={errors.gender}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Religion
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={data.religion || ""}
                                                    onChange={(e) =>
                                                        setData(
                                                            "religion",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-3 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Your religion"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.religion}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Birth Date
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar
                                                        size="18"
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                                <input
                                                    type="date"
                                                    value={
                                                        data.birth_date || ""
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "birth_date",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-10 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.birth_date}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Birth Place
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <LocationDiscover
                                                        size="18"
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={
                                                        data.birth_place || ""
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "birth_place",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="pl-10 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="City of birth"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.birth_place}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Update Section */}
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-800">
                                                Change Password
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditPassword(
                                                        !editPassword
                                                    )
                                                }
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                {editPassword
                                                    ? "Cancel"
                                                    : "Update Password"}
                                            </button>
                                        </div>

                                        {editPassword && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Current Password
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <LockCircle
                                                                size="18"
                                                                className="text-gray-400"
                                                            />
                                                        </div>
                                                        <input
                                                            type="password"
                                                            value={
                                                                data.current_password
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "current_password",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="pl-10 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Enter current password"
                                                        />
                                                    </div>
                                                    <InputError
                                                        message={
                                                            errors.current_password
                                                        }
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            New Password
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <Lock1
                                                                    size="18"
                                                                    className="text-gray-400"
                                                                />
                                                            </div>
                                                            <input
                                                                type="password"
                                                                value={
                                                                    data.new_password
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "new_password",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="pl-10 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="Enter new password"
                                                            />
                                                        </div>
                                                        <InputError
                                                            message={
                                                                errors.new_password
                                                            }
                                                            className="mt-1"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Confirm New Password
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <PasswordCheck
                                                                    size="18"
                                                                    className="text-gray-400"
                                                                />
                                                            </div>
                                                            <input
                                                                type="password"
                                                                value={
                                                                    data.new_password_confirmation
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "new_password_confirmation",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="pl-10 pr-3 py-2 w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="Confirm new password"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75"
                                        >
                                            {processing
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Right Column: Info Cards */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-5 rounded-lg border">
                                    <h3 className="font-semibold text-gray-800 mb-3">
                                        Student Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <UserOctagon
                                                    size="18"
                                                    className="text-blue-600"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    NISN
                                                </p>
                                                <p className="font-medium">
                                                    {student.nisn}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <Building
                                                    size="18"
                                                    className="text-blue-600"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Class
                                                </p>
                                                <p className="font-medium">
                                                    {current_class
                                                        ? current_class.class_name
                                                        : "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <Calendar
                                                    size="18"
                                                    className="text-blue-600"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Semester
                                                </p>
                                                <p className="font-medium">
                                                    {current_class
                                                        ? current_class.semester_name
                                                        : "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                                    <h3 className="font-semibold text-blue-800 mb-3">
                                        Need Help?
                                    </h3>
                                    <p className="text-sm text-blue-700 mb-4">
                                        If you need to update information that
                                        you cannot change here, please contact
                                        your school administrator.
                                    </p>
                                    <div className="pt-2 border-t border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            School Contact: <br />
                                            <span className="font-medium">
                                                admin@school.edu
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentProfileEdit;
