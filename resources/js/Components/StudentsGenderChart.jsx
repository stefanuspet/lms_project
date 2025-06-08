import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const StudentsGenderChart = ({ boysCount, girlsCount }) => {
    const total = boysCount + girlsCount;
    console.log(boysCount);

    const boysPercentage = Math.round((boysCount / total) * 100);
    const girlsPercentage = Math.round((girlsCount / total) * 100);

    // Chart data
    const data = {
        labels: ["Boys", "Girls"],
        datasets: [
            {
                labels: "Boys",
                data: [boysCount, girlsCount],
                backgroundColor: ["#F7F8FA", "#C3EBFA"],
                borderRadius: 100,
                borderWidth: 0,
                cutout: "55%",
                radius: "100%",
            },
            {
                labels: "Girls",
                data: [boysCount, girlsCount],
                backgroundColor: ["#FAE27C", "#F7F8FA"],
                borderRadius: 100,
                borderWidth: 0,
                cutout: "55%",
                radius: "90%",
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
        },
        maintainAspectRatio: false,
        cutout: "40%",
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Students</h2>
                <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
            </div>

            <div className="relative h-44 w-full">
                {/* Chart container */}
                <Doughnut data={data} options={options} />

                {/* Center content with icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="flex justify-center">
                            <div className="text-[#A8E0F0]">
                                <img src="/assets/icons/BoyGirl.svg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics at the bottom */}
            <div className="flex justify-between mt-6">
                <div className="text-center">
                    <div className="w-4 h-4 bg-[#C3EBFA] rounded-full mx-auto"></div>
                    <div className="text-lg font-bold mt-2">{boysCount}</div>
                    <div className="text-gray-400 text-sm">
                        Boys ({boysPercentage}%)
                    </div>
                </div>
                <div className="text-center">
                    <div className="w-4 h-4 bg-[#FAE27C] rounded-full mx-auto"></div>
                    <div className="text-lg font-bold mt-2">
                        {girlsCount.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">
                        Girls ({girlsPercentage}%)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentsGenderChart;
