import React, { useState, useEffect } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const TeacherCreate = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        nip: "",
        phone: "",
        address: "",
    });

    const [clientErrors, setClientErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    // Validate form whenever data changes
    useEffect(() => {
        validateForm();
    }, [data]);

    // Form validation logic
    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!data.name) newErrors.name = "Nama wajib diisi";
        if (!data.email) newErrors.email = "Email wajib diisi";
        if (!data.nip) newErrors.nip = "NIP wajib diisi";

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
            newErrors.email = "Masukkan alamat email yang valid";
        }

        // Password validation
        if (!data.password) {
            newErrors.password = "Password wajib diisi";
        } else if (data.password.length < 8) {
            newErrors.password = "Password minimal 8 karakter";
        }

        // Password confirmation validation
        if (data.password && !data.password_confirmation) {
            newErrors.password_confirmation = "Konfirmasi password wajib diisi";
        } else if (data.password !== data.password_confirmation) {
            newErrors.password_confirmation = "Konfirmasi password tidak sama";
        }

        setClientErrors(newErrors);

        // Form is valid if there are no errors
        setIsFormValid(Object.keys(newErrors).length === 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Double-check validation before submitting
        validateForm();

        if (isFormValid) {
            post(route("admin.teachers.store"));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    // Get displayed error (priority to server-side errors)
    const getErrorMessage = (field) => {
        return errors[field] || clientErrors[field];
    };

    return (
        <AuthenticatedLayout title="Kelola Data Guru">
            <div className="w-full">
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
                                Tambah Guru Baru
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
                                        Profil Guru
                                    </h2>
                                </div>

                                {/* Teacher Name */}
                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Nama Guru"
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
                                        message={getErrorMessage("name")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* School ID / NIP */}
                                <div>
                                    <InputLabel htmlFor="nip" value="NIP" />
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
                                        message={getErrorMessage("nip")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <InputLabel
                                        htmlFor="phone"
                                        value="Nomor Telepon"
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
                                        message={getErrorMessage("phone")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <InputLabel
                                        htmlFor="address"
                                        value="Alamat"
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
                                        message={getErrorMessage("address")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Account Information Section */}
                                <div className="md:col-span-2 mt-4">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Informasi Akun
                                    </h2>
                                </div>

                                {/* Email */}
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Alamat Email"
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
                                        message={getErrorMessage("email")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password (minimal 8 karakter)"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={getErrorMessage("password")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Konfirmasi Password"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={getErrorMessage(
                                            "password_confirmation"
                                        )}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* Password Requirements Hint */}
                            <div className="mt-4 text-sm text-gray-500">
                                <p>
                                    Password harus terdiri dari minimal 8
                                    karakter.
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.teachers.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || !isFormValid}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default TeacherCreate;
