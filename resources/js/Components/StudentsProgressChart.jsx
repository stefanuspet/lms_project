import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const StudentsProgressChart = ({ data = [] }) => {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1200
    );

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Gunakan data yang diberikan atau data default jika tidak ada
    const chartData =
        data.length > 0
            ? data
            : [
                  { name: "Jan", jumlah: 12 },
                  { name: "Feb", jumlah: 19 },
                  { name: "Mar", jumlah: 15 },
                  { name: "Apr", jumlah: 8 },
                  { name: "Mei", jumlah: 25 },
                  { name: "Jun", jumlah: 17 },
                  { name: "Jul", jumlah: 14 },
                  { name: "Ags", jumlah: 28 },
                  { name: "Sep", jumlah: 10 },
                  { name: "Okt", jumlah: 13 },
                  { name: "Nov", jumlah: 7 },
                  { name: "Des", jumlah: 9 },
              ];

    // For mobile, only show a subset of months to avoid crowding
    const displayData =
        windowWidth < 640
            ? chartData.filter((_, index) => index % 2 === 0) // Show every other month on small screens
            : windowWidth < 768
            ? chartData.filter(
                  (_, index) =>
                      index % 3 === 0 || index === chartData.length - 1
              ) // Show fewer months on medium screens
            : chartData; // Show all months on larger screens

    return (
        <div className="h-full w-full pt-0">
            <p className="text-sm text-gray-500 pt-2 mb-2 px-4">
                Jumlah siswa terdaftar per bulan
            </p>

            <ResponsiveContainer
                width="100%"
                height={windowWidth < 640 ? 150 : "70%"}
            >
                <BarChart
                    data={windowWidth < 1024 ? displayData : chartData}
                    margin={{
                        top: 10,
                        right: windowWidth < 640 ? 10 : 20,
                        left: windowWidth < 640 ? 0 : 10,
                        bottom: 5,
                    }}
                    barSize={windowWidth < 640 ? 15 : 10}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        scale="point"
                        fontSize={windowWidth < 640 ? 10 : 11}
                        tickMargin={5}
                    />
                    <YAxis
                        fontSize={windowWidth < 640 ? 10 : 11}
                        tickCount={windowWidth < 640 ? 5 : 7}
                        domain={[0, "auto"]}
                        width={windowWidth < 640 ? 25 : 35}
                    />
                    <Tooltip
                        formatter={(value) => [`${value} siswa`, "Jumlah"]}
                        contentStyle={{ fontSize: "12px" }}
                        cursor={{ fill: "rgba(14, 165, 233, 0.1)" }}
                    />
                    <Bar
                        dataKey="jumlah"
                        fill="#0EA5E9"
                        radius={[2, 2, 0, 0]}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Additional info for small screens */}
            {windowWidth < 640 && (
                <div className="text-xs text-center text-gray-500 mt-2">
                    * Menampilkan data bulan terpilih
                </div>
            )}
        </div>
    );
};

export default StudentsProgressChart;
