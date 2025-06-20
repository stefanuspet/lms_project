import React from "react";
import { Link } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import {
    ArrowLeft2,
    Calendar,
    Clock,
    BookSquare,
    People,
    Timer1,
    Lock1,
    NotificationBing,
    Eye,
} from "iconsax-reactjs";

const TeacherActiveSessionsView = ({ active_sessions, today_date, flash }) => {
    return (
        <TeacherLayout title="Active Attendance Sessions">
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

            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.attendance.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Active Attendance Sessions
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {today_date}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Information Alert */}
                    <div className="p-6 border-b bg-blue-50">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <NotificationBing
                                    size="24"
                                    className="text-blue-500"
                                />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    About Active Attendance Sessions
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Active sessions have PIN codes that
                                        students can use to mark their
                                        attendance. These sessions are created
                                        by administrators and will expire based
                                        on the set time limit.
                                    </p>
                                    <p className="mt-2">
                                        Teachers can view the PIN codes and
                                        monitor attendance in real-time, but
                                        cannot create or modify sessions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                            Today's Active Sessions
                        </h2>

                        {active_sessions && active_sessions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {active_sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                            <h3 className="font-medium text-gray-800">
                                                {session.class_name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {session.subject_name}
                                            </p>
                                        </div>
                                        <div className="p-4">
                                            <div className="mb-4">
                                                <div className="bg-purple-100 p-6 rounded-lg text-center">
                                                    <h4 className="text-sm font-medium text-purple-800 mb-2">
                                                        Attendance PIN
                                                    </h4>
                                                    <p className="text-3xl font-bold text-purple-900 tracking-wider">
                                                        {session.pin}
                                                    </p>
                                                    {session.time_remaining !==
                                                        null && (
                                                        <p className="text-xs text-purple-700 mt-2">
                                                            <Clock
                                                                size="14"
                                                                className="inline mr-1"
                                                            />
                                                            Expires in{" "}
                                                            {
                                                                session.time_remaining
                                                            }{" "}
                                                            minutes
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Present Students
                                                        </p>
                                                        <p className="text-lg font-medium text-gray-900">
                                                            {
                                                                session.present_count
                                                            }
                                                            /
                                                            {
                                                                session.total_students
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Present Rate
                                                        </p>
                                                        <p className="text-lg font-medium text-gray-900">
                                                            {
                                                                session.present_rate
                                                            }
                                                            %
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full"
                                                            style={{
                                                                width: `${session.present_rate}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Link
                                                    href={route(
                                                        "teacher.attendance.daily",
                                                        {
                                                            date: session.date
                                                                .split(" ")
                                                                .slice(0, 3)
                                                                .join(" "),
                                                            class_id:
                                                                session.class_id,
                                                        }
                                                    )}
                                                    className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm leading-5 font-medium rounded-md text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800 active:bg-blue-50 transition ease-in-out duration-150"
                                                >
                                                    <Eye
                                                        size="16"
                                                        className="mr-2"
                                                    />
                                                    View Attendance Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-8 rounded-lg text-center">
                                <Lock1
                                    size="48"
                                    className="text-gray-300 mx-auto mb-2"
                                />
                                <p className="text-gray-600 font-medium">
                                    No active sessions found
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    There are no active attendance sessions for
                                    today.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherActiveSessionsView;
