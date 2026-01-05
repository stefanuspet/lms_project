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
        arrival_start_time: "07:00",
        arrival_duration: "45",
        departure_start_time: "15:00",
        departure_duration: "45",
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
        <AuthenticatedLayout title="Buat Sesi Presensi">
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
                                Buat Sesi Presensi
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
                                        Detail Sesi Presensi
                                    </h2>
                                </div>

                                {/* Title */}
                                <div className="md:col-span-2">
                                    <InputLabel
                                        htmlFor="title"
                                        value="Judul Sesi"
                                    />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={data.title}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        placeholder="Masukkan judul yang jelas untuk sesi presensi (misalnya 'Apel Pagi', 'Pertemuan Kelas')"
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
                                        value="Deskripsi (opsional)"
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
                                    <InputLabel
                                        htmlFor="date"
                                        value="Tanggal"
                                    />
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
                                            Pilih Semester
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

                                {/* Jam & durasi berangkat */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel
                                            htmlFor="arrival_start_time"
                                            value="Jam Mulai Berangkat"
                                        />
                                        <TextInput
                                            id="arrival_start_time"
                                            name="arrival_start_time"
                                            type="time"
                                            value={data.arrival_start_time}
                                            className="mt-1 block w-full"
                                            onChange={handleChange}
                                            required
                                        />
                                        <InputError
                                            message={errors.arrival_start_time}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="arrival_duration"
                                            value="Durasi Berangkat (menit)"
                                        />
                                        <TextInput
                                            id="arrival_duration"
                                            name="arrival_duration"
                                            type="number"
                                            min="5"
                                            max="300"
                                            value={data.arrival_duration}
                                            className="mt-1 block w-full"
                                            onChange={handleChange}
                                            required
                                        />
                                        <InputError
                                            message={errors.arrival_duration}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                {/* Jam & durasi pulang */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel
                                            htmlFor="departure_start_time"
                                            value="Jam Mulai Pulang"
                                        />
                                        <TextInput
                                            id="departure_start_time"
                                            name="departure_start_time"
                                            type="time"
                                            value={data.departure_start_time}
                                            className="mt-1 block w-full"
                                            onChange={handleChange}
                                            required
                                        />
                                        <InputError
                                            message={
                                                errors.departure_start_time
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="departure_duration"
                                            value="Durasi Pulang (menit)"
                                        />
                                        <TextInput
                                            id="departure_duration"
                                            name="departure_duration"
                                            type="number"
                                            min="5"
                                            max="300"
                                            value={data.departure_duration}
                                            className="mt-1 block w-full"
                                            onChange={handleChange}
                                            required
                                        />
                                        <InputError
                                            message={errors.departure_duration}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                {/* Note about QR */}
                                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg mt-2">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                                        Cara Penggunaan Absensi
                                    </h3>
                                    <p className="text-sm text-blue-600">
                                        Sistem ini akan membuat QR unik yang dapat
                                        dipindai oleh siswa melalui aplikasi mobile
                                        untuk menandai kehadiran. QR aktif selama
                                        durasi yang ditentukan. Bagikan QR atau token
                                        kepada siswa melalui pengumuman/WhatsApp atau
                                        tampilkan di layar kelas. Cocok untuk kegiatan
                                        sekolah seperti upacara, kegiatan ekstrakurikuler,
                                        atau pertemuan umum.
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
