import TeacherSidebar from "@/Components/TeacherSidebar";
import { Head } from "@inertiajs/react";
import React from "react";

const TeacherLayout = ({ title, children }) => {
    return (
        <div className="font-jakarta">
            <Head title={title || "Default Title"} />
            <div className="w-full flex h-full">
                <TeacherSidebar />
                <div className="w-5/6 bg-[#A7A9AA] bg-opacity-15 container px-6 py-3">
                    {/* <Header /> */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default TeacherLayout;
