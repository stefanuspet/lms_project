import React from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    Book1,
    Timer1,
    ClipboardTick,
    Clipboard,
    People,
    NotificationBing,
    Profile2User,
    Graph,
    Calendar,
    UserOctagon,
    DocumentText,
    MessageEdit,
    TickCircle,
    TrendUp,
} from "iconsax-reactjs";

const StudentDashboard = ({
    student,
    stats,
    upcoming_assignments,
    recent_materials,
    notifications,
    current_subjects,
}) => {
    return (
        <StudentLayout title="Student Dashboard">
            <div className="py-6 w-full">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-xl shadow-sm mb-6">
                    <div className="px-6 py-5 flex items-center justify-between">
                        <div>
                            <h1 className="text-white text-2xl font-bold">
                                Welcome back, {student.name}!
                            </h1>
                            <p className="text-blue-100 mt-1">
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Profile2User
                                variant="Bold"
                                size="80"
                                className="text-white opacity-70"
                            />
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">My Subjects</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.total_subjects}
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
                                Pending Assignments
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.pending_assignments}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <Clipboard
                                variant="Bold"
                                size="24"
                                className="text-red-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Completed Assignments
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.completed_assignments}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <ClipboardTick
                                variant="Bold"
                                size="24"
                                className="text-green-600"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Attendance Rate
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.attendance_rate}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Calendar
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
                        {/* Current Subjects */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Book1
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>My Subjects</span>
                                </h2>
                                <Link
                                    href={route("student.subjects.index")}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="px-6 py-4">
                                {current_subjects &&
                                current_subjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {current_subjects.map((subject) => (
                                            <Link
                                                key={subject.id}
                                                href={route(
                                                    "student.subjects.show",
                                                    subject.id
                                                )}
                                                className="block bg-gray-50 p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">
                                                            {subject.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                subject.teacher_name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <DocumentText
                                                            size="14"
                                                            className="text-blue-600"
                                                        />
                                                        <span>
                                                            {
                                                                subject.materials_count
                                                            }{" "}
                                                            Materials
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <ClipboardTick
                                                            size="14"
                                                            className="text-green-600"
                                                        />
                                                        <span>
                                                            {
                                                                subject.completed_assignments
                                                            }
                                                            /
                                                            {
                                                                subject.assignments_count
                                                            }{" "}
                                                            Completed
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>
                                            You don't have any subjects assigned
                                            yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Assignments */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <Timer1
                                        size="20"
                                        className="text-red-600"
                                    />
                                    <span>Upcoming Assignment Deadlines</span>
                                </h2>
                                <Link
                                    href={route("student.assignments.index")}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="px-6 py-4">
                                {upcoming_assignments &&
                                upcoming_assignments.length > 0 ? (
                                    <div className="divide-y">
                                        {upcoming_assignments.map(
                                            (assignment) => (
                                                <div
                                                    key={assignment.id}
                                                    className="py-3 first:pt-0 last:pb-0"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <Link
                                                                href={route(
                                                                    "student.assignments.show",
                                                                    assignment.id
                                                                )}
                                                                className="font-medium text-blue-600 hover:text-blue-800"
                                                            >
                                                                {
                                                                    assignment.title
                                                                }
                                                            </Link>
                                                            <p className="text-sm text-gray-500">
                                                                {
                                                                    assignment.subject_name
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                                                                {
                                                                    assignment.days_remaining
                                                                }{" "}
                                                                days left
                                                            </span>
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                Due:{" "}
                                                                {
                                                                    assignment.deadline
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1">
                                                            {assignment.is_submitted ? (
                                                                <>
                                                                    <TickCircle
                                                                        size="14"
                                                                        className="text-green-600"
                                                                    />
                                                                    <span className="text-green-600">
                                                                        Submitted
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Timer1
                                                                        size="14"
                                                                        className="text-red-600"
                                                                    />
                                                                    <span className="text-red-600">
                                                                        Not
                                                                        submitted
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {!assignment.is_submitted && (
                                                            <Link
                                                                href={route(
                                                                    "student.assignments.submit",
                                                                    assignment.id
                                                                )}
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                Submit Now
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>No upcoming assignment deadlines.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Materials */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <DocumentText
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <span>Recent Materials</span>
                                </h2>
                                <Link
                                    href={route("student.materials.index")}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="px-6 py-4">
                                {recent_materials &&
                                recent_materials.length > 0 ? (
                                    <div className="divide-y">
                                        {recent_materials.map((material) => (
                                            <div
                                                key={material.id}
                                                className="py-3 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <Link
                                                            href={route(
                                                                "student.materials.show",
                                                                material.id
                                                            )}
                                                            className="font-medium text-blue-600 hover:text-blue-800"
                                                        >
                                                            {material.title}
                                                        </Link>
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                material.subject_name
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                            {material.file_type ||
                                                                "Text"}
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-1">
                                                            {
                                                                material.created_at
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-end">
                                                    <Link
                                                        href={route(
                                                            "student.materials.show",
                                                            material.id
                                                        )}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        View Material
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>No recent materials.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Student Profile Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                            <div className="-mt-12 px-6 pb-6">
                                <div className="flex justify-center">
                                    <div className="h-24 w-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                                        <UserOctagon
                                            variant="Bold"
                                            size="60"
                                            className="text-blue-600"
                                        />
                                    </div>
                                </div>
                                <div className="text-center mt-2">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {student.name}
                                    </h2>
                                    <p className="text-gray-500">
                                        NISN: {student.nisn}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {student.email}
                                    </p>
                                </div>
                                <div className="mt-4 border-t pt-4">
                                    <div className="flex items-center justify-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-gray-500 text-xs">
                                                Class
                                            </span>
                                            <span className="text-gray-900 font-bold">
                                                {student.class_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href={route("student.profile.edit")}
                                        className="block text-center w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <NotificationBing
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>Recent Notifications</span>
                                </h2>
                                <Link
                                    href={route("student.notifications.index")}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="px-6 py-4">
                                {notifications && notifications.length > 0 ? (
                                    <div className="divide-y">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="py-3 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`p-2 rounded-full ${
                                                            notification.type ===
                                                            "system"
                                                                ? "bg-gray-100"
                                                                : notification.type ===
                                                                  "assignment"
                                                                ? "bg-blue-100"
                                                                : notification.type ===
                                                                  "grade"
                                                                ? "bg-green-100"
                                                                : "bg-amber-100"
                                                        }`}
                                                    >
                                                        <NotificationBing
                                                            size="16"
                                                            className={`${
                                                                notification.type ===
                                                                "system"
                                                                    ? "text-gray-600"
                                                                    : notification.type ===
                                                                      "assignment"
                                                                    ? "text-blue-600"
                                                                    : notification.type ===
                                                                      "grade"
                                                                    ? "text-green-600"
                                                                    : "text-amber-600"
                                                            }`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {
                                                                notification.created_at
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>No recent notifications.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b">
                                <h2 className="font-bold text-lg text-gray-800">
                                    Quick Actions
                                </h2>
                            </div>
                            <div className="px-6 py-4 space-y-2">
                                <Link
                                    href={route("student.subjects.index")}
                                    className="block w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                    <Book1
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>View All Subjects</span>
                                </Link>
                                <Link
                                    href={route("student.assignments.index")}
                                    className="block w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                                >
                                    <Clipboard
                                        size="20"
                                        className="text-blue-600"
                                    />
                                    <span>View Assignments</span>
                                </Link>
                                <Link
                                    href={route("student.materials.index")}
                                    className="block w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                                >
                                    <DocumentText
                                        size="20"
                                        className="text-green-600"
                                    />
                                    <span>Browse Materials</span>
                                </Link>
                                <Link
                                    href={route("student.grades.index")}
                                    className="block w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2"
                                >
                                    <TrendUp
                                        size="20"
                                        className="text-purple-600"
                                    />
                                    <span>View My Grades</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;
