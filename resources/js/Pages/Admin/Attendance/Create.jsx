import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import TextArea from "@/Components/TextArea";
import SelectInput from "@/Components/SelectInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const AttendanceCreate = ({ semesters }) => {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        date: new Date().toISOString().substr(0, 10), // Today's date
        semester_id: semesters.length > 0 ? semesters[0].id : "",
        duration: "60", // Default 60 minutes
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Log data yang akan dikirim untuk debugging
        console.log("Submitting data:", data);

        post(route("admin.attendance.store"), {
            onSuccess: (page) => {
                console.log("Success:", page);
            },
            onError: (errors) => {
                console.error("Error submitting form:", errors);
            },
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <AuthenticatedLayout title="Create Attendance Session">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.attendance.index")}
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

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Session Details Section */}
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Attendance Session Details
                                    </h2>
                                </div>

                                {/* Title */}
                                <div className="md:col-span-2">
                                    <InputLabel
                                        htmlFor="title"
                                        value="Session Title"
                                    />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={data.title}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        placeholder="Enter a descriptive title for this attendance session (e.g., 'Morning Assembly', 'Class Meeting')"
                                        required
                                    />
                                    <InputError
                                        message={errors.title}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <InputLabel
                                        htmlFor="description"
                                        value="Description (Optional)"
                                    />
                                    <TextArea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        placeholder="Add additional information about this attendance session"
                                        rows={3}
                                    />
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <InputLabel htmlFor="date" value="Date" />
                                    <TextInput
                                        id="date"
                                        type="date"
                                        name="date"
                                        value={data.date}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.date}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Semester */}
                                <div>
                                    <InputLabel
                                        htmlFor="semester_id"
                                        value="Semester"
                                    />
                                    <SelectInput
                                        id="semester_id"
                                        name="semester_id"
                                        value={data.semester_id}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Semester
                                        </option>
                                        {semesters.map((semester) => (
                                            <option
                                                key={semester.id}
                                                value={semester.id}
                                            >
                                                {semester.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError
                                        message={errors.semester_id}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <InputLabel
                                        htmlFor="duration"
                                        value="Duration (minutes)"
                                    />
                                    <SelectInput
                                        id="duration"
                                        name="duration"
                                        value={data.duration}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                        <option value="240">4 hours</option>
                                        <option value="480">8 hours</option>
                                        <option value="720">12 hours</option>
                                        <option value="1440">24 hours</option>
                                    </SelectInput>
                                    <InputError
                                        message={errors.duration}
                                        className="mt-2"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        The PIN code will be valid for this
                                        duration.
                                    </p>
                                </div>

                                {/* Note about PIN */}
                                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg mt-2">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                                        Cara Penggunaan Absensi
                                    </h3>
                                    <p className="text-sm text-blue-600">
                                        Sistem ini akan membuat kode PIN 6 digit
                                        yang dapat digunakan oleh semua siswa
                                        dari semua kelas untuk menandai
                                        kehadiran mereka. Kode PIN ini aktif
                                        selama durasi yang ditentukan. Anda
                                        dapat membagikan PIN ini kepada siswa
                                        melalui berbagai cara (pengumuman,
                                        WhatsApp, dll) atau menandai kehadiran
                                        mereka secara manual di sistem. Cocok
                                        untuk kegiatan sekolah seperti upacara,
                                        kegiatan ekstrakurikuler, atau pertemuan
                                        umum.
                                    </p>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.attendance.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Buat Sesi Absensi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AttendanceCreate;
