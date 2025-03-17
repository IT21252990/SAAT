import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ContributorBarChart = ({ contributors }) => {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={contributors}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="login"
            axisLine={{ stroke: "#4b5563" }}
            tick={{ fill: "#4b5563" }}
          />
          <YAxis
            axisLine={{ stroke: "#4b5563" }}
            tick={{ fill: "#4b5563" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e3a8a",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Bar
            dataKey="contributions"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            label={{ position: "top", fill: "#4b5563" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ContributorBarChart;