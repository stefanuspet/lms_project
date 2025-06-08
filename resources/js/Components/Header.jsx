import { Messages1, Notification } from "iconsax-reactjs";
import React from "react";

const Header = () => {
    return (
        <div className="">
            <div className="flex justify-end items-center h-12 pt-8 w-full gap-x-4 ">
                <div className="bg-white px-1.5 py-1.5 rounded-full flex justify-center items-center">
                    <Messages1 variant="Bold" color="#242424" size="20" />
                </div>
                <div className="bg-white px-1.5 py-1.5 rounded-full flex justify-center items-center">
                    <Notification size="20" color="#242424" variant="Bold" />
                </div>
                <div className="flex items-center gap-x-2">
                    <div className="pl-4">
                        <p className="text-sm font-semibold">Catherine lois</p>
                        <p className="text-sm text-right">Admin</p>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Profile Picture"
                        className="rounded-full w-10 h-10 object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
