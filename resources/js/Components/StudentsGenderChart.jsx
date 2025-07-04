import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";

const StudentsGenderChart = ({ boysCount, girlsCount }) => {
    const data = [
        { name: "Laki-laki", value: boysCount, color: "#0EA5E9" },
        { name: "Perempuan", value: girlsCount, color: "#38BDF8" },
    ];

    const COLORS = ["#0EA5E9", "#38BDF8"];
    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
    }) => {
        // Hide labels on small screens or when segments are too small
        if (window.innerWidth < 400 || percent < 0.1) return null;

        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize={window.innerWidth < 768 ? "10" : "14"}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="h-full w-full flex flex-col">
            <ResponsiveContainer
                width="100%"
                height={window.innerWidth < 640 ? 150 : 200}
            >
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={window.innerWidth < 640 ? "70%" : "80%"}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value} siswa`, null]}
                        contentStyle={{ fontSize: "12px" }}
                    />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{
                            fontSize: window.innerWidth < 640 ? "10px" : "12px",
                            paddingTop: "10px",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StudentsGenderChart;
