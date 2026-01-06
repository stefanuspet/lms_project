import React, { useEffect, useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import Toast from "@/Components/Toast";
import { ArrowLeft2 } from "iconsax-reactjs";

const StaffEdit = ({ staff, flash }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: staff.name || "",
        email: staff.email || "",
        password: "",
        password_confirmation: "",
        nip: staff.nip || "",
        phone: staff.phone || "",
        address: staff.address || "",
        position: staff.position || "",
        category: staff.category || "staff",
        join_date: staff.join_date || "",
        is_active: staff.is_active,
        profile_picture: null,
    });

    const [previewProfilePicture, setPreviewProfilePicture] = useState(
        staff.profile_picture || "/assets/images/default-avatar.png"
    );
    const [clientErrors, setClientErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(true);
    const [toast, setToast] = useState(null);

    // Tampilkan toast jika ada error global dari server (mis. email/NIP sudah dipakai)
    useEffect(() => {
        if (errors?.error) {
            setToast({ type: "error", message: errors.error });
        } else if (flash?.error) {
            setToast({ type: "error", message: flash.error });
        }
    }, [errors, flash]);

    // Validasi sederhana di sisi client agar user dapat feedback cepat
    useEffect(() => {
        validateForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const validateForm = () => {
        const newErrors = {};

        if (!data.name) newErrors.name = "Nama wajib diisi.";
        if (!data.email) {
            newErrors.email = "Email wajib diisi.";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                newErrors.email = "Masukkan alamat email yang valid.";
            }
        }

        if (data.password && data.password.length < 8) {
            newErrors.password = "Password minimal 8 karakter.";
        }

        if (data.password && !data.password_confirmation) {
            newErrors.password_confirmation =
                "Konfirmasi password wajib diisi.";
        } else if (
            data.password &&
            data.password_confirmation &&
            data.password !== data.password_confirmation
        ) {
            newErrors.password_confirmation = "Konfirmasi password tidak sama.";
        }

        setClientErrors(newErrors);
        setIsFormValid(Object.keys(newErrors).length === 0);
    };

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setData(name, type === "checkbox" ? checked : value);
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setData("profile_picture", file || null);

        if (file) {
            setPreviewProfilePicture(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validateForm();

        if (isFormValid) {
            post(route("admin.staff.update", staff.id), {
                preserveScroll: true,
                forceFormData: true,
            });
        }
    };

    const getErrorMessage = (field) => {
        if (errors[field]) {
            return errors[field];
        }

        if (field === "password_confirmation" && errors.password) {
            return errors.password;
        }

        return clientErrors[field];
    };

    return (
        <AuthenticatedLayout title="Edit Staf">
            <Toast
                type={toast?.type}
                message={toast?.message}
                onClose={() => setToast(null)}
            />
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
                                Edit Data Staf / Security
                            </h1>
                        </div>
                    </div>

                    <div className="p-6">
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Profil Staf */}
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Profil Staf
                                    </h2>
                                </div>

                                {/* Foto Profil */}
                                <div className="md:col-span-2 flex items-center gap-6 mb-2">
                                    <div>
                                        <img
                                            src={previewProfilePicture}
                                            alt={data.name || "Foto profil"}
                                            className="h-24 w-24 rounded-full object-cover border"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <InputLabel
                                            htmlFor="profile_picture"
                                            value="Foto Profil"
                                        />
                                        <input
                                            id="profile_picture"
                                            type="file"
                                            accept="image/*"
                                            className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            onChange={
                                                handleProfilePictureChange
                                            }
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Kosongkan jika tidak ingin mengubah
                                            foto profil.
                                        </p>
                                        <InputError
                                            message={errors.profile_picture}
                                            className="mt-2"
                                        />
                                    </div>
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
                                        message={getErrorMessage("name")}
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
                                        message={getErrorMessage("nip")}
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
                                        message={getErrorMessage("phone")}
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
                                        message={getErrorMessage("join_date")}
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
                                        message={getErrorMessage("position")}
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
                                        message={getErrorMessage("email")}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Password (opsional) */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password (kosongkan jika tidak diubah)"
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
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default StaffEdit;
