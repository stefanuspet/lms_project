import React, { useState } from "react";
import { router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ChartSuccess,
    Calendar,
    Profile2User,
    DocumentText,
    DocumentDownload,
    TickCircle,
    CloseCircle,
    Timer,
    ClipboardTick,
} from "iconsax-reactjs";

const AttendanceReports = ({
    filters,
    filterOptions,
    attendanceData,
    sessionDates,
    hasData,
}) => {
    const [semesterId, setSemesterId] = useState(filters.semester_id || "");
    const [studentId, setStudentId] = useState(filters.student_id || "");
    const [classId, setClassId] = useState(filters.class_id || "");
    const [dateFrom, setDateFrom] = useState(filters.date_from || "");
    const [dateTo, setDateTo] = useState(filters.date_to || "");

    const handleGenerateReport = (e) => {
        e.preventDefault();

        router.get(route("admin.attendance.reports"), {
            semester_id: semesterId,
            student_id: studentId,
            class_id: classId,
            date_from: dateFrom,
            date_to: dateTo,
        });
    };

    const handleExport = () => {
        const params = {
            semester_id: semesterId || undefined,
            student_id: studentId || undefined,
            class_id: classId || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        };

        // Gunakan GET biasa supaya browser memicu download CSV
        window.location.href = route("admin.attendance.export-report", params);
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
            case "not_submitted":
                return "bg-gray-100 text-gray-800";
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

    const renderStudentReport = () => {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Laporan Kehadiran Siswa
                        </h2>
                        <p className="text-gray-500">
                            {attendanceData.student.name} (
                            {attendanceData.student.nisn})
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <DocumentDownload size="20" className="mr-2" />
                        Ekspor Laporan
                    </button>
                </div>

                {/* Attendance Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-500 uppercase font-semibold">
                                Total
                            </p>
                            <p className="text-2xl font-bold text-blue-700">
                                {attendanceData.stats.total}
                            </p>
                        </div>
                        <Profile2User size="32" className="text-blue-400" />
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-500 uppercase font-semibold">
                                Hadir
                            </p>
                            <p className="text-2xl font-bold text-green-700">
                                {attendanceData.stats.present}
                            </p>
                            <p className="text-xs text-green-600">
                                {attendanceData.stats.total > 0
                                    ? `${Math.round(
                                          (attendanceData.stats.present /
                                              attendanceData.stats.total) *
                                              100
                                      )}%`
                                    : "0%"}
                            </p>
                        </div>
                        <TickCircle size="32" className="text-green-400" />
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-orange-500 uppercase font-semibold">
                                Sakit
                            </p>
                            <p className="text-2xl font-bold text-orange-700">
                                {attendanceData.stats.sick}
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
                                {attendanceData.stats.excused}
                            </p>
                        </div>
                        <ClipboardTick size="32" className="text-blue-400" />
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-xs text-red-500 uppercase font-semibold">
                                Tidak Hadir
                            </p>
                            <p className="text-2xl font-bold text-red-700">
                                {attendanceData.stats.absent +
                                    attendanceData.stats.not_submitted}
                            </p>
                        </div>
                        <CloseCircle size="32" className="text-red-400" />
                    </div>
                </div>

                {/* Attendance Records Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Judul Kegiatan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Waktu Pengisian
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceData.attendances.map(
                                (attendance, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {attendance.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {attendance.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {attendance.status !==
                                            "not_submitted" ? (
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                                        attendance.status
                                                    )}`}
                                                >
                                                    <span className="flex items-center">
                                                        {getStatusIcon(
                                                            attendance.status
                                                        )}
                                                        <span className="ml-1 capitalize">
                                                            {attendance.status}
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
                                            {attendance.submitted_at}
                                        </td>
                                    </tr>
                                )
                            )}
                            {attendanceData.attendances.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        Tidak ada catatan kehadiran ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderAllStudentsReport = () => {
        const semesterObj = filterOptions.semesters.find(
            (s) => s.id == semesterId
        );

        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Laporan Kehadiran Semua Siswa
                        </h2>
                        <p className="text-gray-500">
                            Semester: {semesterObj?.name || "Semua Semester"}
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                        <DocumentDownload size="20" className="mr-2" />
                        Ekspor Laporan
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500">
                        Total sesi absensi:{" "}
                        <span className="font-semibold">
                            {attendanceData.session_count}
                        </span>
                    </p>
                </div>

                {/* Students Attendance Table */}
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
                                    Hadir
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sakit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Izin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tidak Hadir
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tingkat Kehadiran
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceData.students.map((studentData) => (
                                <tr
                                    key={studentData.student.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {studentData.student.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {studentData.student.nisn}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <TickCircle
                                                size="16"
                                                className="text-green-500 mr-2"
                                            />
                                            {studentData.stats.present}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <Timer
                                                size="16"
                                                className="text-orange-500 mr-2"
                                            />
                                            {studentData.stats.sick}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <ClipboardTick
                                                size="16"
                                                className="text-blue-500 mr-2"
                                            />
                                            {studentData.stats.excused}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <CloseCircle
                                                size="16"
                                                className="text-red-500 mr-2"
                                            />
                                            {studentData.stats.absent +
                                                studentData.stats.not_submitted}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex flex-col flex-1 max-w-[200px]">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {
                                                        studentData.stats
                                                            .attendance_rate
                                                    }
                                                    %
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                                    <div
                                                        className={`h-2.5 rounded-full ${
                                                            studentData.stats
                                                                .attendance_rate >=
                                                            80
                                                                ? "bg-green-600"
                                                                : studentData
                                                                      .stats
                                                                      .attendance_rate >=
                                                                  60
                                                                ? "bg-yellow-400"
                                                                : "bg-red-600"
                                                        }`}
                                                        style={{
                                                            width: `${studentData.stats.attendance_rate}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {attendanceData.students.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        Tidak ada siswa yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout title="Laporan Kehadiran">
            <div className="py-8">
                {/* Filters Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <ChartSuccess
                            size="24"
                            className="text-green-500 mr-2"
                        />
                        <h2 className="text-xl font-bold text-gray-800">
                            Buat Laporan Kehadiran
                        </h2>
                    </div>

                    <form onSubmit={handleGenerateReport}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          {/* Semester filter */}
                          <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Semester
                                </label>
                                <select
                                    value={semesterId}
                                    onChange={(e) =>
                                        setSemesterId(e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                    <option value="">Pilih Semester</option>
                                    {filterOptions.semesters.map((semester) => (
                                        <option
                                            key={semester.id}
                                            value={semester.id}
                                        >
                                            {semester.name}
                                        </option>
                                    ))}
                                </select>
                          </div>

                          {/* Class filter (optional) */}
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Kelas (Opsional)
                              </label>
                              <select
                                  value={classId}
                                  onChange={(e) => setClassId(e.target.value)}
                                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              >
                                  <option value="">Semua Kelas</option>
                                  {filterOptions.classes?.map((cls) => (
                                      <option key={cls.id} value={cls.id}>
                                          {cls.name}
                                      </option>
                                  ))}
                              </select>
                          </div>

                          {/* Student filter (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Siswa (Opsional)
                                </label>
                                <select
                                    value={studentId}
                                    onChange={(e) =>
                                        setStudentId(e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                >
                                    <option value="">Semua Siswa</option>
                                    {filterOptions.students.map((student) => (
                                        <option
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {student.name} ({student.nisn})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date From filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Dari (Opsional)
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                            </div>

                            {/* Date To filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Hingga (Opsional)
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center"
                                disabled={!semesterId}
                            >
                                <ChartSuccess size="20" className="mr-2" />
                                Buat Laporan
                            </button>
                        </div>
                    </form>
                </div>

                {/* Report Display */}
                {hasData ? (
                    studentId ? (
                        renderStudentReport()
                    ) : (
                        renderAllStudentsReport()
                    )
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                        <div className="flex flex-col items-center justify-center py-12">
                            <ChartSuccess
                                size="64"
                                className="text-gray-300 mb-4"
                            />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">
                                Belum Ada Laporan yang Dibuat
                            </h3>
                            <p className="text-gray-500 max-w-md">
                                Pilih semester dan klik "Buat Laporan" untuk
                                melihat statistik kehadiran. Anda juga dapat
                                memilih siswa tertentu untuk melihat catatan
                                kehadiran detailnya.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default AttendanceReports;
