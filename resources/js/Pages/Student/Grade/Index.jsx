import React from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    Chart,
    DocumentText,
    TrendUp,
    Book1,
    ClipboardText,
    TrendDown,
    Teacher,
    StatusUp,
    EmptyWallet,
    Graph,
} from "iconsax-reactjs";

const StudentGradeIndex = ({ grade_summary, subjects, recent_grades }) => {
    // Function to get grade level color
    const getGradeLevelColor = (grade) => {
        if (!grade) return "bg-gray-100 text-gray-800";

        if (grade >= 90) return "bg-green-100 text-green-800";
        if (grade >= 80) return "bg-blue-100 text-blue-800";
        if (grade >= 70) return "bg-yellow-100 text-yellow-800";
        if (grade >= 60) return "bg-orange-100 text-orange-800";
        return "bg-red-100 text-red-800";
    };

    // Function to get grade trend icon
    // Function to get grade trend icon
    const getGradeTrendIcon = (grade) => {
        if (!grade) return null;

        if (grade >= 80)
            return <TrendUp size="16" className="text-green-600" />;
        if (grade >= 70)
            return <StatusUp size="16" className="text-blue-600" />;
        return <TrendDown size="16" className="text-red-600" />;
    };

    return (
        <StudentLayout title="My Grades">
            <div className="py-6 w-full">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Total Subjects
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {grade_summary.total_subjects || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Book1
                                variant="Bold"
                                size="24"
                                className="text-blue-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Total Assignments
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {grade_summary.total_assignments || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-full">
                            <ClipboardText
                                variant="Bold"
                                size="24"
                                className="text-amber-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Graded Assignments
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {grade_summary.graded_assignments || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <DocumentText
                                variant="Bold"
                                size="24"
                                className="text-green-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Average Grade
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {grade_summary.average_grade || "-"}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Chart
                                variant="Bold"
                                size="24"
                                className="text-purple-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Grade by Subject Card */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Graph
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>Grades by Subject</span>
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                {subjects && subjects.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Subject
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Teacher
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Assignments
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Average
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Details
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {subjects.map((subject) => (
                                                    <tr key={subject.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Book1
                                                                    size="16"
                                                                    className="text-blue-600 mr-2"
                                                                />
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        subject.name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Teacher
                                                                    size="16"
                                                                    className="text-gray-500 mr-2"
                                                                />
                                                                <div className="text-sm text-gray-500">
                                                                    {
                                                                        subject.teacher_name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {
                                                                    subject.graded_assignments
                                                                }
                                                                /
                                                                {
                                                                    subject.total_assignments
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                {getGradeTrendIcon(
                                                                    subject.average_grade
                                                                )}
                                                                <span
                                                                    className={`ml-1 px-2 py-1 text-xs rounded-full ${getGradeLevelColor(
                                                                        subject.average_grade
                                                                    )}`}
                                                                >
                                                                    {subject.average_grade ||
                                                                        "N/A"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <Link
                                                                href={route(
                                                                    "student.grades.subject",
                                                                    subject.id
                                                                )}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Chart
                                            size="48"
                                            className="mx-auto text-gray-300 mb-3"
                                        />
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            No Grades Available
                                        </h3>
                                        <p className="text-gray-500">
                                            You don't have any graded
                                            assignments yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grade Distribution */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <EmptyWallet
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <span>Grade Range Distribution</span>
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                {grade_summary.graded_assignments > 0 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Excellent (90-100)
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {
                                                        subjects.filter(
                                                            (s) =>
                                                                s.average_grade >=
                                                                90
                                                        ).length
                                                    }{" "}
                                                    subjects
                                                </span>
                                            </div>
                                            <div className="bg-gray-200 h-2 rounded-full">
                                                <div
                                                    className="bg-green-500 h-full rounded-full"
                                                    style={{
                                                        width: `${
                                                            subjects.length > 0
                                                                ? (subjects.filter(
                                                                      (s) =>
                                                                          s.average_grade >=
                                                                          90
                                                                  ).length /
                                                                      subjects.length) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Good (80-89)
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {
                                                        subjects.filter(
                                                            (s) =>
                                                                s.average_grade >=
                                                                    80 &&
                                                                s.average_grade <
                                                                    90
                                                        ).length
                                                    }{" "}
                                                    subjects
                                                </span>
                                            </div>
                                            <div className="bg-gray-200 h-2 rounded-full">
                                                <div
                                                    className="bg-blue-500 h-full rounded-full"
                                                    style={{
                                                        width: `${
                                                            subjects.length > 0
                                                                ? (subjects.filter(
                                                                      (s) =>
                                                                          s.average_grade >=
                                                                              80 &&
                                                                          s.average_grade <
                                                                              90
                                                                  ).length /
                                                                      subjects.length) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Satisfactory (70-79)
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {
                                                        subjects.filter(
                                                            (s) =>
                                                                s.average_grade >=
                                                                    70 &&
                                                                s.average_grade <
                                                                    80
                                                        ).length
                                                    }{" "}
                                                    subjects
                                                </span>
                                            </div>
                                            <div className="bg-gray-200 h-2 rounded-full">
                                                <div
                                                    className="bg-yellow-500 h-full rounded-full"
                                                    style={{
                                                        width: `${
                                                            subjects.length > 0
                                                                ? (subjects.filter(
                                                                      (s) =>
                                                                          s.average_grade >=
                                                                              70 &&
                                                                          s.average_grade <
                                                                              80
                                                                  ).length /
                                                                      subjects.length) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Needs Improvement (60-69)
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {
                                                        subjects.filter(
                                                            (s) =>
                                                                s.average_grade >=
                                                                    60 &&
                                                                s.average_grade <
                                                                    70
                                                        ).length
                                                    }{" "}
                                                    subjects
                                                </span>
                                            </div>
                                            <div className="bg-gray-200 h-2 rounded-full">
                                                <div
                                                    className="bg-orange-500 h-full rounded-full"
                                                    style={{
                                                        width: `${
                                                            subjects.length > 0
                                                                ? (subjects.filter(
                                                                      (s) =>
                                                                          s.average_grade >=
                                                                              60 &&
                                                                          s.average_grade <
                                                                              70
                                                                  ).length /
                                                                      subjects.length) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Below Standard less than 60
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {
                                                        subjects.filter(
                                                            (s) =>
                                                                s.average_grade <
                                                                    60 &&
                                                                s.average_grade !==
                                                                    null
                                                        ).length
                                                    }{" "}
                                                    subjects
                                                </span>
                                            </div>
                                            <div className="bg-gray-200 h-2 rounded-full">
                                                <div
                                                    className="bg-red-500 h-full rounded-full"
                                                    style={{
                                                        width: `${
                                                            subjects.length > 0
                                                                ? (subjects.filter(
                                                                      (s) =>
                                                                          s.average_grade <
                                                                              60 &&
                                                                          s.average_grade !==
                                                                              null
                                                                  ).length /
                                                                      subjects.length) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Not Graded
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {
                                                        subjects.filter(
                                                            (s) =>
                                                                s.average_grade ===
                                                                null
                                                        ).length
                                                    }{" "}
                                                    subjects
                                                </span>
                                            </div>
                                            <div className="bg-gray-200 h-2 rounded-full">
                                                <div
                                                    className="bg-gray-500 h-full rounded-full"
                                                    style={{
                                                        width: `${
                                                            subjects.length > 0
                                                                ? (subjects.filter(
                                                                      (s) =>
                                                                          s.average_grade ===
                                                                          null
                                                                  ).length /
                                                                      subjects.length) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>
                                            No grade distribution data available
                                            yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Recent Grades */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <DocumentText
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <span>Recent Grades</span>
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                {recent_grades && recent_grades.length > 0 ? (
                                    <div className="divide-y">
                                        {recent_grades.map((grade) => (
                                            <div
                                                key={grade.id}
                                                className="py-3 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`p-2 rounded-full ${getGradeLevelColor(
                                                            grade.grade
                                                        )}`}
                                                    >
                                                        <DocumentText size="18" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <Link
                                                                    href={route(
                                                                        "student.submissions.show",
                                                                        grade.id
                                                                    )}
                                                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                                                >
                                                                    {
                                                                        grade.assignment_title
                                                                    }
                                                                </Link>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {
                                                                        grade.subject_name
                                                                    }
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`px-2 py-1 h-fit rounded-lg text-sm font-semibold ${getGradeLevelColor(
                                                                    grade.grade
                                                                )}`}
                                                            >
                                                                {grade.grade}
                                                            </span>
                                                        </div>
                                                        {grade.feedback && (
                                                            <p className="text-sm text-gray-600 mt-2 italic">
                                                                "
                                                                {grade.feedback
                                                                    .length >
                                                                100
                                                                    ? grade.feedback.substring(
                                                                          0,
                                                                          100
                                                                      ) + "..."
                                                                    : grade.feedback}
                                                                "
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Graded on:{" "}
                                                            {grade.graded_at}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>No recent grades available.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grade Scale Info Card */}
                        <div className="bg-blue-50 rounded-xl shadow-sm p-5 border border-blue-100">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <Chart size="20" className="text-blue-600" />
                                <span>Grade Scale</span>
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                    <span className="text-sm font-medium text-blue-700">
                                        90-100 - Excellent
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                    <span className="text-sm font-medium text-blue-700">
                                        80-89 - Good
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                    <span className="text-sm font-medium text-blue-700">
                                        70-79 - Satisfactory
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                                    <span className="text-sm font-medium text-blue-700">
                                        60-69 - Needs Improvement
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                    <span className="text-sm font-medium text-blue-700">
                                        Below 60 - Below Standard
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-blue-200">
                                <p className="text-sm text-blue-700">
                                    Click on "View Details" for any subject to
                                    see individual assignment grades and
                                    performance over time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentGradeIndex;
