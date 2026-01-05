import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";
import React from "react";

const StaffShow = ({ staff }) => {
    return (
        <AuthenticatedLayout title={`Detail Staf: ${staff.name}`}>
            <div className="w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <h1 className="font-bold text-xl text-gray-800">
                            Detail Staf / Security
                        </h1>
                        <Link
                            href={route("admin.staff.index")}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Kembali ke Daftar Staf
                        </Link>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 flex flex-col items-center">
                            <img
                                src={
                                    staff.profile_picture ||
                                    "/assets/images/default-avatar.png"
                                }
                                alt={staff.name}
                                className="h-32 w-32 rounded-full object-cover border mb-3"
                            />
                            <h2 className="text-lg font-semibold text-gray-800">
                                {staff.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {staff.position || "-"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {staff.category === "security"
                                    ? "Security"
                                    : "Staf"}
                            </p>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Informasi Utama
                                </h3>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div>
                                        <dt className="text-gray-500">NIP</dt>
                                        <dd className="font-medium text-gray-900">
                                            {staff.nip || "-"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">
                                            Nomor Telepon
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                            {staff.phone || "-"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">
                                            Tanggal Bergabung
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                            {staff.join_date || "-"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500">
                                            Status
                                        </dt>
                                        <dd className="font-medium text-gray-900">
                                            {staff.is_active
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Alamat
                                </h3>
                                <p className="text-sm text-gray-800">
                                    {staff.address || "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default StaffShow;

