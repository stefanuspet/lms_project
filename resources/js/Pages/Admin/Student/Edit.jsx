import React, { useState, useEffect } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const StudentEdit = ({ student }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: student.name || "",
        email: student.user?.email || "",
        password: "",
        password_confirmation: "",
        nisn: student.nisn || "",
        gender: student.gender || "",
        birth_date: student.birth_date || "",
        birth_place: student.birth_place || "",
        religion: student.religion || "",
    });

    const [clientErrors, setClientErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(true); // Default to true for edit form since password is optional

    // Validate form whenever data changes
    useEffect(() => {
        validateForm();
    }, [data]);

    // Form validation logic
    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!data.name) newErrors.name = "Name is required";
        if (!data.email) newErrors.email = "Email is required";
        if (!data.nisn) newErrors.nisn = "NISN is required";

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Password validation - only if password field is not empty
        if (data.password && data.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        // Password confirmation validation - only if password field is not empty
        if (data.password && !data.password_confirmation) {
            newErrors.password_confirmation = "Please confirm your password";
        } else if (
            data.password &&
            data.password !== data.password_confirmation
        ) {
            newErrors.password_confirmation = "Passwords do not match";
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
            put(route("admin.students.update", student.id));
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
        <AuthenticatedLayout title="Edit Student">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.students.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Edit Student
                            </h1>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Profile Section */}
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Student Profile
                                    </h2>
                                </div>

                                {/* Student Name */}
                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Student Name"
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

                                {/* NISN */}
                                <div>
                                    <InputLabel htmlFor="nisn" value="NISN" />
                                    <TextInput
                                        id="nisn"
                                        type="text"
                                        name="nisn"
                                        value={data.nisn}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={getErrorMessage("nisn")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <InputLabel
                                        htmlFor="gender"
                                        value="Gender"
                                    />
                                    <SelectInput
                                        id="gender"
                                        name="gender"
                                        value={data.gender}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </SelectInput>
                                    <InputError
                                        message={getErrorMessage("gender")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Religion */}
                                <div>
                                    <InputLabel
                                        htmlFor="religion"
                                        value="Religion"
                                    />
                                    <SelectInput
                                        id="religion"
                                        name="religion"
                                        value={data.religion}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Religion
                                        </option>
                                        <option value="Islam">Islam</option>
                                        <option value="Kristen">Kristen</option>
                                        <option value="Katolik">Katolik</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Buddha">Buddha</option>
                                        <option value="Konghucu">
                                            Konghucu
                                        </option>
                                    </SelectInput>
                                    <InputError
                                        message={getErrorMessage("religion")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Birth Date */}
                                <div>
                                    <InputLabel
                                        htmlFor="birth_date"
                                        value="Birth Date"
                                    />
                                    <TextInput
                                        id="birth_date"
                                        type="date"
                                        name="birth_date"
                                        value={data.birth_date}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={getErrorMessage("birth_date")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Birth Place */}
                                <div>
                                    <InputLabel
                                        htmlFor="birth_place"
                                        value="Birth Place"
                                    />
                                    <TextInput
                                        id="birth_place"
                                        type="text"
                                        name="birth_place"
                                        value={data.birth_place}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={getErrorMessage("birth_place")}
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
                                        message={getErrorMessage("email")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Password (Optional for Edit) */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password (leave blank to keep current, min 8 characters if changing)"
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
                                        message={getErrorMessage("password")}
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
                                    If updating password, it must be at least 8
                                    characters long.
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.students.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || !isFormValid}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    Update Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default StudentEdit;
