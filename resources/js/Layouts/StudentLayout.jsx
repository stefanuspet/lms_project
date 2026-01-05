import StudentSidebar from "@/Components/StudentSidebar";
import HeaderStudent from "@/Components/HeaderStudent";
import { Head } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const StudentLayout = ({ title, children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="font-jakarta min-h-screen flex flex-col">
            <Head title={title || "Default Title"} />

            {/* Mobile Header dengan tombol menu */}
            <div className="md:hidden bg-white p-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-100"
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
                    <div className="flex items-center">
                        <img
                            src="/assets/images/Logo.png"
                            alt="logo"
                            className="w-6"
                        />
                        <h1 className="font-extrabold text-xl text-center pl-2">
                            SMK Amaliyah Jakarta
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 h-full">
                {/* Sidebar responsif */}
                <StudentSidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    isMobile={isMobile}
                />

                {/* Kontainer utama */}
                <div
                    className={`transition-all duration-300 flex-1 flex flex-col bg-[#A7A9AA] bg-opacity-15 min-h-screen ${
                        isSidebarOpen && !isMobile ? "md:ml-64" : "ml-0"
                    } ${isMobile && isSidebarOpen ? "overflow-hidden" : ""}`}
                >
                    {/* Overlay ketika sidebar mobile terbuka */}
                    {isMobile && isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-10"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                {/* Konten halaman */}
                <div className="flex-1 overflow-y-auto">
                    {/* Header hanya tampil di md ke atas */}
                    <div className="hidden md:block">
                        <HeaderStudent
                            toggleSidebar={toggleSidebar}
                            title={title}
                        />
                    </div>

                    <div className="p-4 md:p-6">{children}</div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLayout;
