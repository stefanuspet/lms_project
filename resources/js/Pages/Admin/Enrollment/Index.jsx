import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    SearchNormal1,
    ArrowRight,
    ArrowLeft2,
    TickCircle,
    CloseCircle,
    Refresh,
    People,
    Book1,
    InfoCircle,
    DocumentText,
} from "iconsax-reactjs";

const EnrollmentIndex = ({
    students,
    semesters,
    classes,
    active_semester,
    selected_class,
    class_stats,
    filters,
    pagination,
    flash,
}) => {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(
        pagination?.current_page || 1
    );
    const [selectAll, setSelectAll] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState({
        semester_id: active_semester?.id || "",
        class_id: "",
        student_ids: [],
    });
    const [promotionData, setPromotionData] = useState({
        from_semester_id: active_semester?.id || "",
        to_semester_id: "",
        class_mapping: [],
        student_ids: [],
    });

    // Update currentPage when pagination changes
    useEffect(() => {
        if (pagination?.current_page) {
            setCurrentPage(pagination.current_page);
        }
    }, [pagination]);

    // Reset selected students when students data changes
    useEffect(() => {
        setSelectedStudents([]);
        setSelectAll(false);
    }, [students.data]);

    // Update selectAll state if all students are selected
    useEffect(() => {
        if (students.data && students.data.length > 0) {
            setSelectAll(
                selectedStudents.length === students.data.length &&
                    students.data.every((student) =>
                        selectedStudents.includes(student.id)
                    )
            );
        } else {
            setSelectAll(false);
        }
    }, [selectedStudents, students.data]);

    // Update enrollment and promotion data when selected students change
    useEffect(() => {
        setEnrollmentData((prev) => ({
            ...prev,
            student_ids: selectedStudents,
        }));

        setPromotionData((prev) => ({
            ...prev,
            student_ids: selectedStudents,
        }));
    }, [selectedStudents]);

    console.log(selectedStudents);

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route("admin.enrollments.index"),
            {
                search: searchTerm,
                semester_id: active_semester?.id,
                class_id: selected_class,
                page: 1, // Reset to page 1 when searching
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["students", "pagination", "filters"],
            }
        );
    };

    // Handle semester change
    const handleSemesterChange = (e) => {
        const semesterId = e.target.value;

        router.get(
            route("admin.enrollments.index"),
            {
                semester_id: semesterId,
                class_id: selected_class,
                search: searchTerm,
            },
            {
                preserveState: true,
                preserveScroll: false,
            }
        );
    };

    // Handle class filter change
    const handleClassChange = (e) => {
        const classId = e.target.value;

        router.get(
            route("admin.enrollments.index"),
            {
                semester_id: active_semester?.id,
                class_id: classId,
                search: searchTerm,
            },
            {
                preserveState: true,
                preserveScroll: false,
            }
        );
    };

    // Fungsi untuk navigasi halaman
    const goToPage = (page) => {
        if (
            page === currentPage ||
            page === "..." ||
            page < 1 ||
            page > pagination.last_page
        ) {
            return;
        }

        router.get(
            route("admin.enrollments.index"),
            {
                page: page,
                search: searchTerm,
                semester_id: active_semester?.id,
                class_id: selected_class,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["students", "pagination"],
            }
        );
    };

    // Fungsi untuk toggle select siswa
    const toggleSelectStudent = (studentId) => {
        setSelectedStudents((prev) => {
            if (prev.includes(studentId)) {
                return prev.filter((id) => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    // Fungsi untuk toggle select all siswa
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.data.map((student) => student.id));
        }
        setSelectAll(!selectAll);
    };

    // Handle enroll form submit
    const handleEnroll = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route("admin.enrollments.enroll"), enrollmentData, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                setShowEnrollModal(false);
                setSelectedStudents([]);
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

    // Handle unenroll
    const handleUnenroll = () => {
        if (
            confirm(
                `Are you sure you want to unenroll ${selectedStudents.length} students from ${active_semester?.name}?`
            )
        ) {
            setProcessing(true);

            router.post(
                route("admin.enrollments.unenroll"),
                {
                    semester_id: active_semester?.id,
                    student_ids: selectedStudents,
                    class_id: selected_class,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(false);
                        setSelectedStudents([]);
                    },
                    onError: () => {
                        setProcessing(false);
                    },
                }
            );
        }
    };

    // Handle promote form submit
    const handlePromote = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(route("admin.enrollments.promote"), promotionData, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                setShowPromoteModal(false);
                setSelectedStudents([]);
            },
            onError: () => {
                setProcessing(false);
            },
        });
    };

    // Fungsi untuk generate page numbers
    const generatePageNumbers = (current, total) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (current <= 3) {
            return [1, 2, 3, 4, "...", total];
        }

        if (current >= total - 2) {
            return [1, "...", total - 3, total - 2, total - 1, total];
        }

        return [1, "...", current - 1, current, current + 1, "...", total];
    };

    // Generate page numbers
    const pageNumbers = generatePageNumbers(
        currentPage,
        pagination?.last_page || 1
    );

    // Handle class mapping change for promotion
    const handleClassMappingChange = (fromClassId, toClassId) => {
        setPromotionData((prev) => {
            const updatedMapping = [...prev.class_mapping];
            const index = updatedMapping.findIndex(
                (item) => item.from_class_id === fromClassId
            );

            if (index !== -1) {
                updatedMapping[index] = {
                    from_class_id: fromClassId,
                    to_class_id: toClassId,
                };
            } else {
                updatedMapping.push({
                    from_class_id: fromClassId,
                    to_class_id: toClassId,
                });
            }

            return {
                ...prev,
                class_mapping: updatedMapping,
            };
        });
    };

    return (
        <AuthenticatedLayout title="Student Enrollment Management">
            {/* Flash message */}
            {flash?.success && (
                <div
                    className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-lg"
                    role="alert"
                >
                    <p>{flash.success}</p>
                </div>
            )}

            {flash?.error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg"
                    role="alert"
                >
                    <p>{flash.error}</p>
                </div>
            )}

            <div className="py-6 w-full">
                {/* Filters and Semester Selection */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                Enrollment Management
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Manage student enrollment across semesters and
                                classes
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Semester Selector */}
                            <div className="w-full sm:w-48">
                                <label
                                    htmlFor="semester_id"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Semester
                                </label>
                                <select
                                    id="semester_id"
                                    name="semester_id"
                                    value={active_semester?.id || ""}
                                    onChange={handleSemesterChange}
                                    className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm"
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map((semester) => (
                                        <option
                                            key={semester.id}
                                            value={semester.id}
                                        >
                                            {semester.name}{" "}
                                            {semester.is_active
                                                ? "(Active)"
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Class Filter */}
                            <div className="w-full sm:w-48">
                                <label
                                    htmlFor="class_id"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Class Filter
                                </label>
                                <select
                                    id="class_id"
                                    name="class_id"
                                    value={selected_class || ""}
                                    onChange={handleClassChange}
                                    className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm"
                                >
                                    <option value="">All Classes</option>
                                    {classes.map((classItem) => (
                                        <option
                                            key={classItem.id}
                                            value={classItem.id}
                                        >
                                            {classItem.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Class Statistics */}
                    {active_semester &&
                        class_stats &&
                        class_stats.length > 0 && (
                            <div className="mt-6 pt-4 border-t">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Class Statistics for {active_semester.name}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {class_stats.map((stat) => (
                                        <div
                                            key={stat.id}
                                            className={`p-3 rounded-lg border ${
                                                selected_class === stat.id
                                                    ? "bg-amber-50 border-amber-300"
                                                    : "bg-gray-50 border-gray-200"
                                            }`}
                                        >
                                            <div className="text-sm font-medium">
                                                {stat.name}
                                            </div>
                                            <div className="text-lg font-semibold text-amber-600 mt-1 flex items-center">
                                                <People
                                                    size="16"
                                                    className="mr-1"
                                                />
                                                {stat.student_count} students
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>

                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Actions Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-b">
                        <div className="mb-4 md:mb-0">
                            <form
                                onSubmit={handleSearch}
                                className="relative max-w-md"
                            >
                                <SearchNormal1
                                    size="20"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by Name, NISN, or Email"
                                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full placeholder:text-sm"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <button type="submit" className="hidden">
                                    Search
                                </button>
                            </form>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedStudents.length > 0 && (
                                <>
                                    {/* Enroll Button */}
                                    <button
                                        onClick={() => setShowEnrollModal(true)}
                                        disabled={
                                            processing || !active_semester
                                        }
                                        className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                                    >
                                        <TickCircle size="16" />
                                        <span>Enroll Selected</span>
                                    </button>

                                    {/* Unenroll Button */}
                                    <button
                                        onClick={handleUnenroll}
                                        disabled={
                                            processing ||
                                            !active_semester ||
                                            selectedStudents.every(
                                                (id) =>
                                                    !students.data.find(
                                                        (student) =>
                                                            student.id === id
                                                    )?.is_enrolled
                                            )
                                        }
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                                    >
                                        <CloseCircle size="16" />
                                        <span>Unenroll Selected</span>
                                    </button>

                                    {/* Promote Button */}
                                    <button
                                        onClick={() =>
                                            setShowPromoteModal(true)
                                        }
                                        disabled={
                                            processing ||
                                            !active_semester ||
                                            selectedStudents.every(
                                                (id) =>
                                                    !students.data.find(
                                                        (student) =>
                                                            student.id === id
                                                    )?.is_enrolled
                                            )
                                        }
                                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                                    >
                                        <ArrowRight size="16" />
                                        <span>Promote Selected</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                checked={selectAll}
                                                onChange={toggleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NISN
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gender
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.data && students.data.length > 0 ? (
                                    students.data.map((student) => (
                                        <tr
                                            key={student.id}
                                            className={
                                                selectedStudents.includes(
                                                    student.id
                                                )
                                                    ? "bg-amber-50"
                                                    : "hover:bg-gray-50"
                                            }
                                        >
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                    checked={selectedStudents.includes(
                                                        student.id
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectStudent(
                                                            student.id
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.nisn}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {student.gender || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {student.is_enrolled ? (
                                                    <div>
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Enrolled
                                                        </span>
                                                        {student.enrollment_details && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Class:{" "}
                                                                {
                                                                    student
                                                                        .enrollment_details
                                                                        .class_name
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Not Enrolled
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route(
                                                        "admin.enrollments.history",
                                                        student.id
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900 inline-block ml-2"
                                                    title="View Enrollment History"
                                                >
                                                    <DocumentText size="18" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No students found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total > 0 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="flex items-center text-sm text-gray-500">
                                <span>
                                    Showing {pagination.from} to {pagination.to}{" "}
                                    of {pagination.total} students
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                                    <div>
                                        <nav
                                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                            aria-label="Pagination"
                                        >
                                            {pageNumbers.map((number, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() =>
                                                        goToPage(number)
                                                    }
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        number === currentPage
                                                            ? "z-10 bg-amber-50 border-amber-500 text-amber-600"
                                                            : number === "..."
                                                            ? "bg-white border-gray-300 text-gray-500 cursor-default"
                                                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
                                                    }`}
                                                    disabled={number === "..."}
                                                >
                                                    {number}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    disabled={
                                        currentPage === pagination.last_page
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Enroll Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h3 className="font-semibold text-lg text-gray-900">
                                Enroll Students
                            </h3>
                            <button
                                onClick={() => setShowEnrollModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <CloseCircle size="20" />
                            </button>
                        </div>

                        <form onSubmit={handleEnroll}>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Selected Students
                                    </label>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-sm text-gray-600">
                                            {selectedStudents.length} students
                                            selected
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="modal_semester_id"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Semester
                                    </label>
                                    <select
                                        id="modal_semester_id"
                                        name="semester_id"
                                        value={enrollmentData.semester_id}
                                        onChange={(e) =>
                                            setEnrollmentData({
                                                ...enrollmentData,
                                                semester_id: e.target.value,
                                            })
                                        }
                                        className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm"
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
                                                {semester.name}{" "}
                                                {semester.is_active
                                                    ? "(Active)"
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="modal_class_id"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Class
                                    </label>
                                    <select
                                        id="modal_class_id"
                                        name="class_id"
                                        value={enrollmentData.class_id}
                                        onChange={(e) =>
                                            setEnrollmentData({
                                                ...enrollmentData,
                                                class_id: e.target.value,
                                            })
                                        }
                                        className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map((classItem) => (
                                            <option
                                                key={classItem.id}
                                                value={classItem.id}
                                            >
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start">
                                    <InfoCircle
                                        size="18"
                                        className="text-amber-500 mr-2 mt-0.5 flex-shrink-0"
                                    />
                                    <div className="text-xs text-amber-800">
                                        Students who are already enrolled in
                                        this semester will have their class
                                        updated.
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEnrollModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !enrollmentData.semester_id ||
                                        !enrollmentData.class_id
                                    }
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Enroll Students
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Promote Modal */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h3 className="font-semibold text-lg text-gray-900">
                                Promote Students to Next Semester
                            </h3>
                            <button
                                onClick={() => setShowPromoteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <CloseCircle size="20" />
                            </button>
                        </div>

                        <form onSubmit={handlePromote}>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Selected Students
                                    </label>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-sm text-gray-600">
                                            {selectedStudents.length} students
                                            selected
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="from_semester_id"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        From Semester
                                    </label>
                                    <select
                                        id="from_semester_id"
                                        name="from_semester_id"
                                        value={promotionData.from_semester_id}
                                        onChange={(e) =>
                                            setPromotionData({
                                                ...promotionData,
                                                from_semester_id:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm"
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
                                                {semester.name}{" "}
                                                {semester.is_active
                                                    ? "(Active)"
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="to_semester_id"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        To Semester
                                    </label>
                                    <select
                                        id="to_semester_id"
                                        name="to_semester_id"
                                        value={promotionData.to_semester_id}
                                        onChange={(e) =>
                                            setPromotionData({
                                                ...promotionData,
                                                to_semester_id: e.target.value,
                                            })
                                        }
                                        className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="">
                                            Select Semester
                                        </option>
                                        {semesters
                                            .filter(
                                                (semester) =>
                                                    semester.id !==
                                                    promotionData.from_semester_id
                                            )
                                            .map((semester) => (
                                                <option
                                                    key={semester.id}
                                                    value={semester.id}
                                                >
                                                    {semester.name}{" "}
                                                    {semester.is_active
                                                        ? "(Active)"
                                                        : ""}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Class Mapping */}
                                {class_stats && class_stats.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Class Mapping
                                        </label>
                                        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                            {class_stats.map((fromClass) => (
                                                <div
                                                    key={fromClass.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="w-1/3 text-sm">
                                                        {fromClass.name}
                                                    </div>
                                                    <ArrowRight
                                                        size="16"
                                                        className="text-gray-400"
                                                    />
                                                    <div className="flex-1">
                                                        <select
                                                            value={
                                                                promotionData.class_mapping.find(
                                                                    (item) =>
                                                                        item.from_class_id ===
                                                                        fromClass.id
                                                                )
                                                                    ?.to_class_id ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleClassMappingChange(
                                                                    fromClass.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-md shadow-sm text-sm"
                                                            required
                                                        >
                                                            <option value="">
                                                                Select Target
                                                                Class
                                                            </option>
                                                            {classes.map(
                                                                (toClass) => (
                                                                    <option
                                                                        key={
                                                                            toClass.id
                                                                        }
                                                                        value={
                                                                            toClass.id
                                                                        }
                                                                    >
                                                                        {
                                                                            toClass.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start">
                                    <InfoCircle
                                        size="18"
                                        className="text-amber-500 mr-2 mt-0.5 flex-shrink-0"
                                    />
                                    <div className="text-xs text-amber-800">
                                        Students will be moved to the selected
                                        semester with their class mapping. Any
                                        existing enrollments in the target
                                        semester will be overwritten.
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPromoteModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !promotionData.from_semester_id ||
                                        !promotionData.to_semester_id ||
                                        promotionData.class_mapping.length === 0
                                    }
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Promote Students
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
};

export default EnrollmentIndex;
