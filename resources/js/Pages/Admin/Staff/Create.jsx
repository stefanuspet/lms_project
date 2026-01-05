import React from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const StaffCreate = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        nip: "",
        phone: "",
        address: "",
        position: "",
        category: "staff",
        join_date: "",
        is_active: true,
    });

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setData(name, type === "checkbox" ? checked : value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.staff.store"));
    };

    return (
        <AuthenticatedLayout title="Kelola Staf & Security">
            <div className="w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.staff.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Tambah Staf / Security
                            </h1>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Profil Staf */}
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Profil Staf
                                    </h2>
                                </div>

                                {/* Nama */}
                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Nama Lengkap"
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

                                {/* NIP */}
                                <div>
                                    <InputLabel
                                        htmlFor="nip"
                                        value="NIP (opsional)"
                                    />
                                    <TextInput
                                        id="nip"
                                        type="text"
                                        name="nip"
                                        value={data.nip}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.nip}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Telepon */}
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
                                        message={errors.phone}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Tanggal Bergabung */}
                                <div>
                                    <InputLabel
                                        htmlFor="join_date"
                                        value="Tanggal Bergabung"
                                    />
                                    <TextInput
                                        id="join_date"
                                        type="date"
                                        name="join_date"
                                        value={data.join_date}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.join_date}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Jabatan */}
                                <div>
                                    <InputLabel
                                        htmlFor="position"
                                        value="Jabatan"
                                    />
                                    <TextInput
                                        id="position"
                                        type="text"
                                        name="position"
                                        value={data.position}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        placeholder="Contoh: Tata Usaha, Satpam"
                                    />
                                    <InputError
                                        message={errors.position}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Kategori */}
                                <div>
                                    <InputLabel
                                        htmlFor="category"
                                        value="Kategori"
                                    />
                                    <select
                                        id="category"
                                        name="category"
                                        value={data.category}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                    >
                                        <option value="staff">Staf</option>
                                        <option value="security">
                                            Security
                                        </option>
                                    </select>
                                    <InputError
                                        message={errors.category}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Alamat */}
                                <div className="md:col-span-2">
                                    <InputLabel
                                        htmlFor="address"
                                        value="Alamat"
                                    />
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={data.address}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        rows={3}
                                    />
                                    <InputError
                                        message={errors.address}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Status Aktif */}
                                <div className="md:col-span-2 flex items-center gap-3">
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
                                        Aktif
                                    </label>
                                </div>

                                {/* Akun Login */}
                                <div className="md:col-span-2 mt-4">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Akun Login
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
                                        message={errors.email}
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
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Konfirmasi Password */}
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
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* Hint Password */}
                            <div className="mt-4 text-sm text-gray-500">
                                <p>
                                    Password harus terdiri dari minimal 8
                                    karakter.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.staff.index")}
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

export default StaffCreate;
