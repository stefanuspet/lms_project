import Header from "@/Components/Header";
import Sidebar from "@/Components/Sidebar";
import { Head } from "@inertiajs/react";

export default function AuthenticatedLayout({ title, children }) {
    return (
        <div className="font-jakarta">
            <Head title={title || "Default Title"} />
            <div className="w-full flex h-full">
                <Sidebar />
                <div className="w-5/6 bg-[#A7A9AA] bg-opacity-15 container px-6 py-3">
                    <Header />
                    {children}
                </div>
            </div>
        </div>
    );
}
