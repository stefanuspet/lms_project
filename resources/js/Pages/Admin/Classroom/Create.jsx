import React, { useEffect, useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import Toast from "@/Components/Toast";
import { ArrowLeft2 } from "iconsax-reactjs";

const ClassroomCreate = ({ semesters, flash }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        semester_id: "",
    });

    const [clientErrors, setClientErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(true);
    const [toast, setToast] = useState(null);

    // Tampilkan toast jika ada error global dari server
    useEffect(() => {
        if (errors?.error) {
            setToast({ type: "error", message: errors.error });
        } else if (flash?.error) {
            setToast({ type: "error", message: flash.error });
        }
    }, [errors, flash]);

    const validateForm = () => {
        const newErrors = {};

        if (!data.name) newErrors.name = "Nama kelas wajib diisi.";

        setClientErrors(newErrors);
        setIsFormValid(Object.keys(newErrors).length === 0);
    };

    useEffect(() => {
        validateForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const handleSubmit = (e) => {
        e.preventDefault();
        validateForm();

        if (isFormValid) {
            post(route("admin.classrooms.store"));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const getErrorMessage = (field) => {
        return errors[field] || clientErrors[field];
    };

    return (
        <AuthenticatedLayout title="Tambah Kelas Baru">
            <Toast
                type={toast?.type}
                message={toast?.message}
                onClose={() => setToast(null)}
            />
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.classrooms.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Tambah Kelas Baru
                            </h1>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Class Details Section */}
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Detail Kelas
                                    </h2>
                                </div>

                                {/* Class Name */}
                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Nama Kelas"
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

                                {/* Active Semester */}
                                <div>
                                    <InputLabel
                                        htmlFor="semester_id"
                                        value="Semester Aktif (opsional)"
                                    />
                                    <SelectInput
                                        id="semester_id"
                                        name="semester_id"
                                        value={data.semester_id}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Tidak ada Semester Aktif
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
                                    <p className="mt-1 text-xs text-gray-500">
                                        Semester aktif diperlukan untuk
                                        pendaftaran siswa.
                                    </p>
                                </div>

                                {/* Description - Full width */}
                                <div className="md:col-span-2">
                                    <InputLabel
                                        htmlFor="description"
                                        value="Deskripsi (opsional)"
                                    />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description || ""}
                                        onChange={handleChange}
                                        rows="4"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        placeholder="Masukkan deskripsi kelas di sini..."
                                    ></textarea>
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.classrooms.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Simpan Kelas
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ClassroomCreate;
