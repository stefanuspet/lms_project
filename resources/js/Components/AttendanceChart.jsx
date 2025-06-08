import React, { useState, useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

const AttendanceChart = ({ attendanceData = null }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [period, setPeriod] = useState("Weekly");
    const [grade, setGrade] = useState("Grade 3");
    const [selectedDay, setSelectedDay] = useState(null);

    // Sample data jika tidak ada data yang diberikan
    const defaultData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        present: [65, 75, 95, 72, 71],
        absent: [58, 64, 72, 82, 65],
    };

    // Gunakan data yang diberikan atau default data
    const data = attendanceData || defaultData;

    // Menghitung persentase kehadiran untuk hari yang dipilih
    const getSelectedDayPercentage = () => {
        if (selectedDay === null) return null;

        const dayIndex = data.labels.findIndex((day) => day === selectedDay);
        if (dayIndex === -1) return null;

        const present = data.present[dayIndex];
        const total = present + data.absent[dayIndex];
        return Math.round((present / total) * 100);
    };

    // Inisialisasi dan update chart saat data berubah
    useEffect(() => {
        if (chartRef.current) {
            // Hancurkan instance chart sebelumnya jika ada
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Buat chart baru
            const ctx = chartRef.current.getContext("2d");

            // Konfigurasi chart
            chartInstance.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: data.labels,
                    datasets: [
                        {
                            label: "Present",
                            data: data.present,
                            backgroundColor: "#FADF7F",
                            borderRadius: 10,
                            borderSkipped: false,
                            barPercentage: 0.5,
                            categoryPercentage: 0.8,
                        },
                        {
                            label: "Absent",
                            data: data.absent,
                            backgroundColor: "#B3E5FC",
                            borderRadius: 10,
                            borderSkipped: false,
                            barPercentage: 0.5,
                            categoryPercentage: 0.8,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false,
                            },
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 25,
                                padding: 10,
                            },
                            grid: {
                                color: "#EEEEEE",
                                drawBorder: false,
                            },
                        },
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            enabled: true,
                            mode: "index",
                            intersect: false,
                            callbacks: {
                                label: function (context) {
                                    return `${context.dataset.label}: ${context.raw}`;
                                },
                            },
                        },
                    },
                    onClick: (event, elements) => {
                        if (elements && elements.length > 0) {
                            const index = elements[0].index;
                            setSelectedDay(data.labels[index]);
                        } else {
                            setSelectedDay(null);
                        }
                    },
                },
            });
        }

        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    // Update chart jika hari yang dipilih berubah
    useEffect(() => {
        if (chartInstance.current && selectedDay !== null) {
            const index = data.labels.findIndex((day) => day === selectedDay);
            if (index !== -1) {
                // Highlight bar yang dipilih (tidak diimplementasikan di Chart.js secara langsung)
                // Ini dapat diimplementasikan dengan tooltip kustom atau menambahkan penanda lain
            }
        }
    }, [selectedDay, data.labels]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
            {/* Header dengan dropdown */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                    Attendance
                </h2>
                <div className="flex space-x-4">
                    <div className="relative">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="appearance-none bg-gray-100 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="appearance-none bg-gray-100 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Grade 1</option>
                            <option>Grade 2</option>
                            <option>Grade 3</option>
                            <option>Grade 4</option>
                            <option>Grade 5</option>
                            <option>Grade 6</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-8 mb-6">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#FADF7F] mr-2"></div>
                    <span className="text-gray-700">Total Present</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#B3E5FC] mr-2"></div>
                    <span className="text-gray-700">Total Absent</span>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative h-64 w-full">
                <canvas ref={chartRef} height="250"></canvas>

                {/* Overlay untuk persentase kehadiran jika ada hari yang dipilih */}
                {selectedDay && (
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-lg shadow-lg text-center min-w-[80px]">
                        <div className="text-2xl font-bold">
                            {getSelectedDayPercentage()}%
                        </div>
                        <div className="text-gray-500 text-sm">Present</div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-t-white border-l-transparent border-r-transparent"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceChart;
