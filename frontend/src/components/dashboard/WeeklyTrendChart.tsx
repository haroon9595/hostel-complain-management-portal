"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { WeeklyTrendItem } from "@/lib/types";

interface WeeklyTrendChartProps {
  totalCount: number;
  data: WeeklyTrendItem[];
  loading?: boolean;
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({
  totalCount,
  data,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-base font-bold text-slate-800 tracking-tight">
          Total Complaints
        </h4>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
          Weekly trend
        </span>
      </div>

      <div className="mb-2">
        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {loading ? "..." : totalCount}
        </span>
      </div>

      <div className="w-full h-44 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              hide
              domain={[0, (dataMax: number) => Math.max(dataMax + 2, 4)]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#38bdf8"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
