import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    BookSquare,
    People,
    ClipboardTick,
    DocumentText,
    TickCircle,
    CloseCircle,
    InfoCircle,
    Clock,
    Eye,
    Teacher,
    Chart,
} from "iconsax-reactjs";

const TeacherProgressSubject = ({ subject, assignments, students }) => {
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [filterStatus, setFilterStatus] = useState("all");

    // Sort students based on current sort settings
    const sortedStudents = [...students].sort((a, b) => {
        let valueA, valueB;

        if (sortBy === "name") {
            valueA = a.name.toLowerCase();
            valueB = b.name.toLowerCase();
        } else if (sortBy === "completion_rate") {
            valueA = a.completion_rate;
            valueB = b.completion_rate;
        } else if (sortBy === "average_grade") {
            valueA = a.average_grade;
            valueB = b.average_grade;
        }

        const compareResult = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        return sortOrder === "asc" ? compareResult : -compareResult;
    });

    // Filter students based on performance
    const filteredStudents =
        filterStatus === "all"
            ? sortedStudents
            : filterStatus === "excellent"
            ? sortedStudents.filter((student) => student.average_grade >= 90)
            : filterStatus === "good"
            ? sortedStudents.filter(
                  (student) =>
                      student.average_grade >= 75 && student.average_grade < 90
              )
            : filterStatus === "average"
            ? sortedStudents.filter(
                  (student) =>
                      student.average_grade >= 60 && student.average_grade < 75
              )
            : sortedStudents.filter(
                  (student) =>
                      student.average_grade < 60 || student.average_grade === 0
              );

    // Handle sorting
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    // Get status indicator for submission
    const getSubmissionStatus = (submitted, graded, late) => {
        if (!submitted) {
            return (
                <CloseCircle
                    size="16"
                    className="text-red-500"
                    title="Not Submitted"
                />
            );
        } else if (graded) {
            return (
                <TickCircle
                    size="16"
                    className="text-green-500"
                    title="Graded"
                />
            );
        } else if (late) {
            return (
                <Clock
                    size="16"
                    className="text-orange-500"
                    title="Late Submission"
                />
            );
        } else {
            return (
                <InfoCircle
                    size="16"
                    className="text-blue-500"
                    title="Pending Grading"
                />
            );
        }
    };

    // Get grade display with color
    const getGradeDisplay = (grade) => {
        if (grade === null) return "-";

        let colorClass;
        if (grade >= 90) colorClass = "text-green-600";
        else if (grade >= 75) colorClass = "text-blue-600";
        else if (grade >= 60) colorClass = "text-yellow-600";
        else colorClass = "text-red-600";

        return <span className={`font-bold ${colorClass}`}>{grade}</span>;
    };

    // Get progress color based on rate
    const getProgressColor = (rate) => {
        if (rate >= 90) return "bg-green-500";
        if (rate >= 75) return "bg-blue-500";
        if (rate >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <TeacherLayout title={`Subject Progress: ${subject.name}`}>
            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.progress.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Subject Progress Analysis
                            </h1>
                        </div>
                    </div>

                    {/* Subject Info */}
                    <div className="p-6 border-b">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Subject
                                </h3>
                                <div className="flex items-center gap-2">
                                    <BookSquare
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.name}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                    Class
                                </h3>
                                <div className="flex items-center gap-2">
                                    <People
                                        size="20"
                                        className="text-purple-600"
                                    />
                                    <p className="text-lg font-medium text-gray-900">
                                        {subject.class_name}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-500 mb-1">
                                    Assignments Overview
                                </h3>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {assignments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                            <div className="bg-white p-3 rounded-lg border border-blue-200">
                                                <p className="text-xs text-gray-500">
                                                    Total Assignments
                                                </p>
                                                <p className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                    <ClipboardTick
                                                        size="20"
                                                        className="text-blue-600"
                                                    />
                                                    {assignments.length}
                                                </p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-blue-200">
                                                <p className="text-xs text-gray-500">
                                                    Past Due
                                                </p>
                                                <p className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                    <Clock
                                                        size="20"
                                                        className="text-orange-600"
                                                    />
                                                    {
                                                        assignments.filter(
                                                            (a) =>
                                                                a.is_past_deadline
                                                        ).length
                                                    }
                                                </p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-blue-200">
                                                <p className="text-xs text-gray-500">
                                                    Class Average
                                                </p>
                                                <p className="text-xl font-bold text-blue-600 flex items-center gap-2">
                                                    <Chart
                                                        size="20"
                                                        className="text-blue-600"
                                                    />
                                                    {students.length > 0
                                                        ? Math.round(
                                                              students.reduce(
                                                                  (
                                                                      sum,
                                                                      student
                                                                  ) =>
                                                                      sum +
                                                                      student.average_grade,
                                                                  0
                                                              ) /
                                                                  students.length
                                                          )
                                                        : 0}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-blue-700">
                                            No assignments found for this
                                            subject.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-3 bg-gray-50 border-b flex items-center space-x-2 overflow-x-auto">
                        <span className="text-sm text-gray-600">
                            Filter by performance:
                        </span>
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "all"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            All Students
                        </button>
                        <button
                            onClick={() => setFilterStatus("excellent")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "excellent"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Excellent (≥90)
                        </button>
                        <button
                            onClick={() => setFilterStatus("good")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "good"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Good (75-89)
                        </button>
                        <button
                            onClick={() => setFilterStatus("average")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "average"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Average (60-74)
                        </button>
                        <button
                            onClick={() => setFilterStatus("poor")}
                            className={`px-3 py-1 rounded-full text-sm ${
                                filterStatus === "poor"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            Needs Attention less than 60
                        </button>
                    </div>

                    {/* Student Progress Matrix */}
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            {assignments.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() =>
                                                    handleSort("name")
                                                }
                                            >
                                                <div className="flex items-center">
                                                    <span>Student</span>
                                                    {sortBy === "name" && (
                                                        <span className="ml-1">
                                                            {sortOrder === "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>

                                            {/* Assignment columns */}
                                            {assignments.map((assignment) => (
                                                <th
                                                    key={assignment.id}
                                                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <span
                                                            className="text-[10px] normal-case line-clamp-2"
                                                            title={
                                                                assignment.title
                                                            }
                                                        >
                                                            {assignment.title}
                                                        </span>
                                                        <span className="text-[9px] text-gray-400 mt-1">
                                                            {
                                                                assignment.deadline
                                                            }
                                                        </span>
                                                        {assignment.is_past_deadline && (
                                                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[8px] mt-1">
                                                                Due
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}

                                            <th
                                                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() =>
                                                    handleSort(
                                                        "completion_rate"
                                                    )
                                                }
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span>Completion</span>
                                                    {sortBy ===
                                                        "completion_rate" && (
                                                        <span className="ml-1">
                                                            {sortOrder === "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>

                                            <th
                                                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() =>
                                                    handleSort("average_grade")
                                                }
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span>Average</span>
                                                    {sortBy ===
                                                        "average_grade" && (
                                                        <span className="ml-1">
                                                            {sortOrder === "asc"
                                                                ? "↑"
                                                                : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>

                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
                                                <tr
                                                    key={student.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {student.nisn}
                                                        </div>
                                                    </td>

                                                    {/* Assignment status cells */}
                                                    {assignments.map(
                                                        (assignment) => {
                                                            const assignmentDetail =
                                                                student.assignment_details.find(
                                                                    (detail) =>
                                                                        detail.id ===
                                                                        assignment.id
                                                                );

                                                            const hasSubmitted =
                                                                assignmentDetail?.has_submitted ||
                                                                false;
                                                            const isGraded =
                                                                assignmentDetail?.grade !==
                                                                null;
                                                            const isLate =
                                                                assignmentDetail?.is_late ||
                                                                false;
                                                            const grade =
                                                                assignmentDetail?.grade;

                                                            return (
                                                                <td
                                                                    key={`${student.id}-${assignment.id}`}
                                                                    className="px-2 py-4 whitespace-nowrap text-center"
                                                                >
                                                                    <div className="flex flex-col items-center">
                                                                        <div>
                                                                            {getSubmissionStatus(
                                                                                hasSubmitted,
                                                                                isGraded,
                                                                                isLate
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            {getGradeDisplay(
                                                                                grade
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            );
                                                        }
                                                    )}

                                                    {/* Completion rate */}
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col items-center">
                                                            <div className="text-sm font-medium">
                                                                {
                                                                    student.completion_rate
                                                                }
                                                                %
                                                            </div>
                                                            <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                                                                <div
                                                                    className={`${getProgressColor(
                                                                        student.completion_rate
                                                                    )} h-1.5 rounded-full`}
                                                                    style={{
                                                                        width: `${student.completion_rate}%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Average grade */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        {student.average_grade >
                                                        0 ? (
                                                            <span
                                                                className={`text-lg font-bold ${
                                                                    student.average_grade >=
                                                                    90
                                                                        ? "text-green-600"
                                                                        : student.average_grade >=
                                                                          75
                                                                        ? "text-blue-600"
                                                                        : student.average_grade >=
                                                                          60
                                                                        ? "text-yellow-600"
                                                                        : "text-red-600"
                                                                }`}
                                                            >
                                                                {
                                                                    student.average_grade
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        <Link
                                                            href={route(
                                                                "teacher.progress.student",
                                                                student.id
                                                            )}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye size="20" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        4 + assignments.length
                                                    }
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    No students match the
                                                    selected filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="bg-gray-50 p-8 rounded-lg text-center">
                                    <DocumentText
                                        size="48"
                                        className="text-gray-300 mx-auto mb-2"
                                    />
                                    <p className="text-gray-600 font-medium">
                                        No assignments created yet
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Create assignments to track student
                                        progress.
                                    </p>
                                    <Link
                                        href={route(
                                            "teacher.assignments.create",
                                            { subject_id: subject.id }
                                        )}
                                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <ClipboardTick
                                            size="20"
                                            className="mr-2"
                                        />
                                        Create Assignment
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        {assignments.length > 0 && (
                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">
                                    Legend
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-1">
                                        <TickCircle
                                            size="16"
                                            className="text-green-500"
                                        />
                                        <span className="text-xs text-gray-600">
                                            Graded
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <InfoCircle
                                            size="16"
                                            className="text-blue-500"
                                        />
                                        <span className="text-xs text-gray-600">
                                            Submitted (Pending)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock
                                            size="16"
                                            className="text-orange-500"
                                        />
                                        <span className="text-xs text-gray-600">
                                            Late Submission
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CloseCircle
                                            size="16"
                                            className="text-red-500"
                                        />
                                        <span className="text-xs text-gray-600">
                                            Not Submitted
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end">
                            <Link
                                href={route("teacher.progress.index")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Back to Progress Overview
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherProgressSubject;
