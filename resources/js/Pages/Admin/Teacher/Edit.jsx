import React from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const TeacherEdit = ({ teacher }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: teacher.name || "",
        email: teacher.user?.email || "",
        password: "",
        password_confirmation: "",
        nip: teacher.nip || "",
        phone: teacher.phone || "",
        address: teacher.address || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("admin.teachers.update", teacher.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Success handled by redirect with flash message
            },
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <AuthenticatedLayout title="Edit Teacher">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.teachers.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Edit Teacher
                            </h1>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Teacher Profile Section */}
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Teacher Profile
                                    </h2>
                                </div>

                                {/* Teacher Name */}
                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Teacher Name"
                                    />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                {/* School ID / NIP */}
                                <div>
                                    <InputLabel
                                        htmlFor="nip"
                                        value="School ID / NIP"
                                    />
                                    <TextInput
                                        id="nip"
                                        type="text"
                                        name="nip"
                                        value={data.nip}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.nip}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <InputLabel
                                        htmlFor="phone"
                                        value="Phone Number"
                                    />
                                    <TextInput
                                        id="phone"
                                        type="text"
                                        name="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.phone}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <InputLabel
                                        htmlFor="address"
                                        value="Address"
                                    />
                                    <TextInput
                                        id="address"
                                        type="text"
                                        name="address"
                                        value={data.address}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.address}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Account Information Section */}
                                <div className="md:col-span-2 mt-4">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Login Information
                                    </h2>
                                </div>

                                {/* Email */}
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email Address"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Password (Optional for Edit) */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password (leave blank to keep current)"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.teachers.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Update Teacher
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default TeacherEdit;
