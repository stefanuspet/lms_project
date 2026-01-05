import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { User } from "iconsax-reactjs";

const HeaderStudent = ({ toggleSidebar, title }) => {
    const { auth } = usePage().props;
    const user = auth?.user;

    const profilePicture =
        user?.student?.profile_picture ||
        user?.profile_picture ||
        "/assets/images/default-avatar.png";

    return (
        <header className="bg-white border-b border-gray-200 pt-5 pb-4 px-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Mobile only menu toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-100 md:hidden"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                    </button>

                    {/* Page Title */}
                    <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
                        {title || "Dashboard"}
                    </h1>
                </div>

                {/* User Profile */}
                <Link
                    href={route("student.profile.edit")}
                    className="flex items-center"
                >
                    <button className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 pl-1 pr-2">
                        <img
                            src={profilePicture}
                            alt={user?.name || "Siswa"}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">
                            {user?.name || "Siswa"}
                        </span>
                    </button>
                </Link>
            </div>
        </header>
    );
};

export default HeaderStudent;

