import React, { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft2,
    Calendar,
    DocumentText,
    Timer1,
    ClipboardTick,
    People,
    CloseCircle,
    TickCircle,
    Timer,
    DocumentDownload,
    Edit2,
    Trash,
} from "iconsax-reactjs";
import { router } from "@inertiajs/react";

const AttendanceShow = ({ session, students, stats, flash }) => {
    const [selectedStatus, setSelectedStatus] = useState("hadir");
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [extendDuration, setExtendDuration] = useState("30");
    const [searchTerm, setSearchTerm] = useState("");
    const { post, processing } = useForm();
    const [selectedClass, setSelectedClass] = useState("all");
    console.log(selectedClass);
    console.log(students);
    

    const availableClasses = React.useMemo(() => {
        const map = new Map();

        students.forEach((student) => {
            (student.classes || []).forEach((cls) => {
                if (!map.has(cls.id)) {
                    map.set(cls.id, cls);
                }
            });
        });

        return Array.from(map.values());
    }, [students]);

    // Function to download QR code
    const downloadQRCode = async (qrToken, sessionTitle) => {
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrToken)}`;

            // Fetch the QR code image
            const response = await fetch(qrUrl);
            const blob = await response.blob();

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create and trigger download
            const link = document.createElement("a");
            link.href = url;
            link.download = `QR_${sessionTitle.replace(/\s+/g, "_")}_${qrToken.substring(0, 8)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the temporary URL
            window.URL.revokeObjectURL(url);

            // Show success message
            alert("QR Code berhasil didownload!");
        } catch (error) {
            console.error("Error downloading QR code:", error);
            alert("Gagal mendownload QR Code. Silakan coba lagi.");
        }
    };

    // Function to update attendance
    const updateAttendance = (student, status) => {
        router.post(
            route("admin.attendance.update-attendance", session.id),
            {
                student_id: student.id,
                status: status,
            },
            {
                preserveScroll: true,
            },
        );
    };

    // Function to extend session
    const handleExtendSession = () => {
        router.post(
            route("admin.attendance.extend-session", session.id),
            {
                minutes: extendDuration,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowExtendModal(false);
                },
            },
        );
    };

    // Function to delete attendance
    const handleDeleteAttendance = (attendanceId, studentName) => {
        if (!attendanceId) {
            alert("Absensi belum ada, tidak bisa dihapus");
            return;
        }

        if (
            confirm(`Apakah Anda yakin ingin menghapus absensi ${studentName}?`)
        ) {
            router.delete(
                route("admin.attendance.delete-attendance", [
                    session.id,
                    attendanceId,
                ]),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    // Function to close session
    const handleCloseSession = () => {
        if (
            confirm(
                "Apakah Anda yakin ingin menutup sesi absensi ini? QR tidak dapat dipindai setelah ditutup.",
            )
        ) {
            post(route("admin.attendance.close-session", session.id), {
                preserveScroll: true,
            });
        }
    };

    // Function to filter students by search term
    const filteredStudents = students.filter((student) => {
        // 🔍 search
        const matchSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nisn.toLowerCase().includes(searchTerm.toLowerCase());

        // 🏫 filter kelas
        const matchClass =
            selectedClass === "all" ||
            (student.classes || []).some(
                (cls) => String(cls.id) === String(selectedClass),
            );

        return matchSearch && matchClass;
    });

    // Group students by attendance status
    const groupedStudents = {
        present: filteredStudents.filter(
            (student) => student.status === "hadir",
        ),
        absent: filteredStudents.filter(
            (student) => student.status === "alpha",
        ),
        sick: filteredStudents.filter((student) => student.status === "sakit"),
        excused: filteredStudents.filter(
            (student) => student.status === "izin",
        ),
        not_submitted: filteredStudents.filter(
            (student) => student.status === null,
        ),
    };

    // Function to get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "hadir":
                return "bg-green-100 text-green-800";
            case "alpha":
                return "bg-red-100 text-red-800";
            case "sakit":
                return "bg-orange-100 text-orange-800";
            case "izin":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Function to get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "hadir":
                return <TickCircle size="16" className="text-green-500" />;
            case "alpha":
                return <CloseCircle size="16" className="text-red-500" />;
            case "sakit":
                return <Timer size="16" className="text-orange-500" />;
            case "izin":
                return <ClipboardTick size="16" className="text-blue-500" />;
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout title={`Sesi Absensi: ${session.title}`}>
            {/* Flash message */}
            {flash?.success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.success}</p>
                </div>
            )}

            {flash?.error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                    role="alert"
                >
                    <p>{flash.error}</p>
                </div>
            )}

            <div className="py-6 w-full">
                {/* Session Details Card */}
                <div className="w-full bg-white rounded-xl shadow-sm mb-6">
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
                                {session.title}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-3">
                            {session.is_active ? (
                                <>
                                    <button
                                        onClick={() => setShowExtendModal(true)}
                                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        Perpanjang Sesi
                                    </button>
                                    <button
                                        onClick={handleCloseSession}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Tutup Sesi
                                    </button>
                                </>
                            ) : (
                                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                                    Sesi Berakhir
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {/* QR and Date Info */}
                        <div className="flex flex-col md:flex-row md:space-x-6 mb-6">
                            <div className="flex-1 bg-amber-50 p-6 rounded-lg mb-4 md:mb-0">
                                <h2 className="text-amber-800 text-xl font-bold mb-4">
                                    QR Absensi
                                </h2>
                                <div className="bg-white p-4 rounded-lg text-center">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                                            session.qr_token,
                                        )}`}
                                        alt="QR Absensi"
                                        className="mx-auto"
                                    />
                                    <p className="font-mono text-sm mt-3 break-all text-gray-800">
                                        {session.qr_token}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            downloadQRCode(
                                                session.qr_token,
                                                session.title,
                                            )
                                        }
                                        className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                                        title="Download QR Code"
                                    >
                                        <DocumentDownload size="16" />
                                        Download QR
                                    </button>
                                    <p className="text-sm text-gray-500 mt-3">
                                        {session.is_active ? (
                                            <span className="flex items-center justify-center">
                                                <Timer1
                                                    size="16"
                                                    className="mr-1 text-green-500"
                                                />
                                                Aktif hingga{" "}
                                                {session.expires_at}
                                            </span>
                                        ) : (
                                            <span className="text-red-500">
                                                Berakhir
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Session Details */}
                            <div className="flex-1 bg-gray-50 p-6 rounded-lg">
                                <h2 className="text-gray-800 text-xl font-bold mb-4">
                                    Detail Sesi
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Calendar
                                            size="20"
                                            className="text-blue-500 mr-3"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Tanggal
                                            </p>
                                            <p className="text-gray-900">
                                                {session.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <DocumentText
                                            size="20"
                                            className="text-amber-500 mr-3"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Deskripsi
                                            </p>
                                            <p className="text-gray-900">
                                                {session.description || "-"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Timer1
                                            size="20"
                                            className="text-green-500 mr-3"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Semester & Jenis
                                            </p>
                                            <p className="text-gray-900">
                                                {session.semester
                                                    ? session.semester.name
                                                    : "-"}{" "}
                                                ·{" "}
                                                {session.session_type ===
                                                "arrival"
                                                    ? "Berangkat"
                                                    : "Pulang"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Waktu:{" "}
                                                {session.start_time
                                                    ? `${session.start_time} - ${session.expires_at}`
                                                    : session.expires_at}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-500 uppercase font-semibold">
                                        Total
                                    </p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {stats.total}
                                    </p>
                                </div>
                                <People size="32" className="text-blue-400" />
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-green-500 uppercase font-semibold">
                                        Hadir
                                    </p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {stats.present}
                                    </p>
                                </div>
                                <TickCircle
                                    size="32"
                                    className="text-green-400"
                                />
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-orange-500 uppercase font-semibold">
                                        Sakit
                                    </p>
                                    <p className="text-2xl font-bold text-orange-700">
                                        {stats.sick}
                                    </p>
                                </div>
                                <Timer size="32" className="text-orange-400" />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-500 uppercase font-semibold">
                                        Izin
                                    </p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {stats.excused}
                                    </p>
                                </div>
                                <ClipboardTick
                                    size="32"
                                    className="text-blue-400"
                                />
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-red-500 uppercase font-semibold">
                                        Tidak Hadir
                                    </p>
                                    <p className="text-2xl font-bold text-red-700">
                                        {stats.absent + stats.not_submitted}
                                    </p>
                                </div>
                                <CloseCircle
                                    size="32"
                                    className="text-red-400"
                                />
                            </div>
                        </div>

                        {/* Note about QR usage */}
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-blue-700">
                                <strong>Catatan:</strong> QR ini akan dipindai
                                melalui aplikasi mobile siswa. Pastikan mereka
                                berada di lokasi kampus (sekitar koordinat
                                -7.780518, 110.415770) saat memindai. QR akan
                                kedaluwarsa pada {session.expires_at}.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Students Attendance Card */}
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <h2 className="font-bold text-lg text-gray-800">
                            Absensi Siswa
                        </h2>

                        <div className="flex gap-2">
                            <select
                                value={selectedClass}
                                onChange={(e) =>
                                    setSelectedClass(e.target.value)
                                }
                                className="ml-3 rounded-full border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all" className="pr-10">
                                    Semua Kelas
                                </option>
                                {availableClasses.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                            {/* Search Box */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan nama atau NISN"
                                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 placeholder:text-sm"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="px-6 pt-4 border-b">
                        <div className="flex overflow-x-auto">
                            <button
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                    selectedStatus === "all"
                                        ? "bg-gray-100 text-gray-900 border-b-2 border-gray-500"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedStatus("all")}
                            >
                                Semua ({filteredStudents.length})
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                    selectedStatus === "hadir"
                                        ? "bg-green-100 text-green-800 border-b-2 border-green-500"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedStatus("hadir")}
                            >
                                Hadir ({groupedStudents.present.length})
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                    selectedStatus === "sakit"
                                        ? "bg-orange-100 text-orange-800 border-b-2 border-orange-500"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedStatus("sakit")}
                            >
                                Sakit ({groupedStudents.sick.length})
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                    selectedStatus === "izin"
                                        ? "bg-blue-100 text-blue-800 border-b-2 border-blue-500"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedStatus("izin")}
                            >
                                Izin ({groupedStudents.excused.length})
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${
                                    selectedStatus === "alpha"
                                        ? "bg-red-100 text-red-800 border-b-2 border-red-500"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => setSelectedStatus("alpha")}
                            >
                                Alpha ({groupedStudents.absent.length})
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                                    selectedStatus === "not_submitted"
                                        ? "bg-gray-100 text-gray-800 border-b-2 border-gray-500"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() =>
                                    setSelectedStatus("not_submitted")
                                }
                            >
                                Belum Mengisi (
                                {groupedStudents.not_submitted.length})
                            </button>
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Siswa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            NISN
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Waktu Pengisian
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents
                                        .filter(
                                            (student) =>
                                                selectedStatus === "all" ||
                                                (selectedStatus ===
                                                    "not_submitted" &&
                                                    student.status === null) ||
                                                student.status ===
                                                    selectedStatus,
                                        )
                                        .map((student) => (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 ">
                                                    <div className="text-sm font-medium text-gray-900 text-wrap">
                                                        {student.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.nisn}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.status ? (
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                                                student.status,
                                                            )}`}
                                                        >
                                                            <span className="flex items-center">
                                                                {getStatusIcon(
                                                                    student.status,
                                                                )}
                                                                <span className="ml-1 capitalize">
                                                                    {
                                                                        student.status
                                                                    }
                                                                </span>
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">
                                                            Belum mengisi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.submitted_at ||
                                                        "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                updateAttendance(
                                                                    student,
                                                                    "hadir",
                                                                )
                                                            }
                                                            className={`p-1 rounded ${
                                                                student.status ===
                                                                "hadir"
                                                                    ? "bg-green-100"
                                                                    : "hover:bg-green-50"
                                                            }`}
                                                            title="Tandai Hadir"
                                                        >
                                                            <TickCircle
                                                                size="20"
                                                                className="text-green-500"
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateAttendance(
                                                                    student,
                                                                    "sakit",
                                                                )
                                                            }
                                                            className={`p-1 rounded ${
                                                                student.status ===
                                                                "sakit"
                                                                    ? "bg-orange-100"
                                                                    : "hover:bg-orange-50"
                                                            }`}
                                                            title="Tandai Sakit"
                                                        >
                                                            <Timer
                                                                size="20"
                                                                className="text-orange-500"
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateAttendance(
                                                                    student,
                                                                    "izin",
                                                                )
                                                            }
                                                            className={`p-1 rounded ${
                                                                student.status ===
                                                                "izin"
                                                                    ? "bg-blue-100"
                                                                    : "hover:bg-blue-50"
                                                            }`}
                                                            title="Tandai Izin"
                                                        >
                                                            <ClipboardTick
                                                                size="20"
                                                                className="text-blue-500"
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateAttendance(
                                                                    student,
                                                                    "alpha",
                                                                )
                                                            }
                                                            className={`p-1 rounded ${
                                                                student.status ===
                                                                "alpha"
                                                                    ? "bg-red-100"
                                                                    : "hover:bg-red-50"
                                                            }`}
                                                            title="Tandai Alpha"
                                                        >
                                                            <CloseCircle
                                                                size="20"
                                                                className="text-red-500"
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteAttendance(
                                                                    student.attendance_id,
                                                                    student.name,
                                                                )
                                                            }
                                                            className="p-1 rounded hover:bg-red-50"
                                                            title="Hapus Absensi"
                                                        >
                                                            <Trash
                                                                size="20"
                                                                className="text-red-600"
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    {filteredStudents.filter(
                                        (student) =>
                                            selectedStatus === "all" ||
                                            (selectedStatus ===
                                                "not_submitted" &&
                                                student.status === null) ||
                                            student.status === selectedStatus,
                                    ).length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-4 text-center text-gray-500"
                                            >
                                                Tidak ada siswa dengan status
                                                ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Extend Session Modal */}
            {showExtendModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Perpanjang Sesi Absensi
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            QR absensi akan tetap aktif untuk waktu tambahan.
                        </p>

                        <div className="mb-4">
                            <label
                                htmlFor="extendDuration"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Durasi Perpanjangan
                            </label>
                            <select
                                id="extendDuration"
                                value={extendDuration}
                                onChange={(e) =>
                                    setExtendDuration(e.target.value)
                                }
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            >
                                <option value="15">15 menit</option>
                                <option value="30">30 menit</option>
                                <option value="60">1 jam</option>
                                <option value="120">2 jam</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowExtendModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleExtendSession}
                                disabled={processing}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                            >
                                {processing
                                    ? "Memproses..."
                                    : "Perpanjang Sesi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
};

export default AttendanceShow;
