import React from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const SemesterCreate = ({ academic_years }) => {
    const { data, setData, post, processing, errors } = useForm({
        academic_year_id: academic_years?.[0]?.id || "",
        name: "",
        start_date: "",
        end_date: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.semesters.store"));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <AuthenticatedLayout title="Tambah Semester Baru">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.semesters.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Tambah Semester Baru
                            </h1>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Semester Information Section */}
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Informasi Semester
                                    </h2>
                                </div>

                                {/* Academic Year */}
                                <div>
                                    <InputLabel
                                        htmlFor="academic_year_id"
                                        value="Tahun Ajar"
                                    />
                                    <select
                                        id="academic_year_id"
                                        name="academic_year_id"
                                        value={data.academic_year_id}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        required
                                    >
                                        <option value="">
                                            Pilih Tahun Ajar
                                        </option>
                                        {academic_years?.map((year) => (
                                            <option
                                                key={year.id}
                                                value={year.id}
                                            >
                                                {year.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.academic_year_id}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Semester Name */}
                                <div className="md:col-span-2">
                                    <InputLabel
                                        htmlFor="name"
                                        value="Nama Semester"
                                    />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                        placeholder="contoh: Semester Ganjil 2025/2026"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Start Date */}
                                <div>
                                    <InputLabel
                                        htmlFor="start_date"
                                        value="Tanggal Mulai"
                                    />
                                    <TextInput
                                        id="start_date"
                                        type="date"
                                        name="start_date"
                                        value={data.start_date}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.start_date}
                                        className="mt-2"
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <InputLabel
                                        htmlFor="end_date"
                                        value="Tanggal Selesai"
                                    />
                                    <TextInput
                                        id="end_date"
                                        type="date"
                                        name="end_date"
                                        value={data.end_date}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.end_date}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.semesters.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Simpan Semester
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default SemesterCreate;
