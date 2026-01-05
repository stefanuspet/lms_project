import React from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const AcademicYearCreate = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        start_date: "",
        end_date: "",
        is_active: false,
    });

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setData(name, type === "checkbox" ? checked : value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.academic-years.store"));
    };

    return (
        <AuthenticatedLayout title="Tambah Tahun Ajar">
            <div className="w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.academic-years.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Tambah Tahun Ajar
                            </h1>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Informasi Tahun Ajar
                                    </h2>
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Nama Tahun Ajar"
                                    />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        placeholder="Contoh: 2024/2025"
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

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
                                    />
                                    <InputError
                                        message={errors.start_date}
                                        className="mt-2"
                                    />
                                </div>

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
                                    />
                                    <InputError
                                        message={errors.end_date}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-amber-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="is_active"
                                        className="text-sm text-gray-700"
                                    >
                                        Jadikan tahun ajar ini sebagai aktif
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.academic-years.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
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

export default AcademicYearCreate;

