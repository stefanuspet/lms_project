import Header from "@/Components/Header";
import Sidebar from "@/Components/Sidebar";
import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function AuthenticatedLayout({ title, children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            // Consider mobile if width is less than 768px
            setIsMobile(window.innerWidth < 768);
            // Auto close sidebar on mobile
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Set initial state
        handleResize();

        // Add event listener
        window.addEventListener("resize", handleResize);

        // Clean up
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="font-jakarta min-h-screen flex flex-col">
            <Head title={title || "Default Title"} />

            {/* Mobile Header with menu toggle - only shown on mobile */}
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
                            SchoolHub
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 h-full">
                {/* Sidebar - responsive */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    isMobile={isMobile}
                />

                {/* Main content container */}
                <div
                    className={`transition-all duration-300 flex-1 flex flex-col bg-[#A7A9AA] bg-opacity-15 min-h-screen ${
                        isSidebarOpen && !isMobile ? "md:ml-64" : "ml-0"
                    } ${isMobile && isSidebarOpen ? "overflow-hidden" : ""}`}
                >
                    {/* Overlay for mobile when sidebar is open */}
                    {isMobile && isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-10"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* Header - visible on all screen sizes except mobile */}
                    <div className="hidden md:block">
                        <Header toggleSidebar={toggleSidebar} />
                    </div>

                    {/* Page content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
