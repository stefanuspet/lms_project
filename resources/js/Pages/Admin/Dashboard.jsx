import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";
import { usePage } from "@inertiajs/react";
import StudentsGenderChart from "@/Components/StudentsGenderChart";
import CardCount from "@/Components/CardCount";

const Dashboard = () => {
    const { teachersCount, studentsCount, boysCount, girlsCount } =
        usePage().props;

    return (
        <AuthenticatedLayout title="Dashboard">
            <div className="py-10 w-full">
                <div className="flex gap-x-5 w-full">
                    <CardCount
                        color={"#CFCEFF"}
                        count={studentsCount}
                        title={"Students"}
                    />
                    <CardCount
                        color={"#FAE27C"}
                        count={teachersCount}
                        title={"Teachers"}
                    />
                    <CardCount
                        color={"#CFCEFF"}
                        count={studentsCount}
                        title={"students"}
                    />
                    <CardCount
                        color={"#FAE27C"}
                        count={studentsCount}
                        title={"students"}
                    />
                </div>
                <div className="flex gap-x-5 w-full py-10">
                    <div className="h-80 w-64 bg-white rounded-xl">
                        <StudentsGenderChart
                            boysCount={boysCount}
                            girlsCount={girlsCount}
                        />
                    </div>
                    <div className="h-80 w-[30.5rem] bg-white rounded-xl"></div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
