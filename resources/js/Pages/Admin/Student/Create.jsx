import React from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const StudentCreate = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        nisn: "",
        gender: "",
        birth_date: "",
        birth_place: "",
        religion: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.students.store"));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <AuthenticatedLayout title="Add New Student">
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
                                Add New Student
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
                                        message={errors.name}
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
                                        message={errors.nisn}
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
                                        message={errors.gender}
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
                                        message={errors.religion}
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
                                        message={errors.birth_date}
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
                                        message={errors.birth_place}
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

                                {/* Password */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
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
                                        required
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
                                    href={route("admin.students.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Save Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default StudentCreate;
