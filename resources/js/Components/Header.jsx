import React from "react";
import { Link } from "@inertiajs/react";
import {
    NotificationBing,
    MessageQuestion,
    Setting,
    User,
} from "iconsax-reactjs";

const Header = ({ toggleSidebar }) => {
    return (
        <header className="bg-white border-b border-gray-200 py-2 px-4">
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

                    {/* Page Title - show on larger screens */}
                    <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
                        Dashboard
                    </h1>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notification */}
                    {/* <button className="p-2 rounded-full hover:bg-gray-100">
                        <div className="relative">
                            <NotificationBing
                                size="22"
                                className="text-gray-600"
                            />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                                3
                            </span>
                        </div>
                    </button> */}

                    {/* Help */}
                    {/* <button className="p-2 rounded-full hover:bg-gray-100 hidden sm:block">
                        <MessageQuestion size="22" className="text-sky-600" />
                    </button> */}

                    {/* Settings */}
                    {/* <button className="p-2 rounded-full hover:bg-gray-100 hidden sm:block">
                        <Setting size="22" className="text-sky-600" />
                    </button> */}

                    {/* User Profile */}
                    <div className="flex items-center">
                        <button className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 pl-1 pr-2">
                            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white">
                                <User size="20" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                Admin
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
