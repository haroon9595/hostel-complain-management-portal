"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { StaffLoadItem, RTStats } from "@/lib/types";
import { Users, Clock } from "lucide-react";

interface StaffLoadChartProps {
  data: StaffLoadItem[];
  stats?: RTStats;
  loading?: boolean;
}

export const StaffLoadChart: React.FC<StaffLoadChartProps> = ({
  data,
  stats,
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-base font-bold text-slate-800 tracking-tight">
          Staff Load Balancer
        </h4>
        <span className="text-xs font-semibold text-slate-400">
          {data.length} Staff Members
        </span>
      </div>

      {/* Stacked Bar Chart */}
      <div className="w-full h-44 my-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <XAxis
              dataKey="staff_name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(dataMax + 1, 3)]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
            <Bar dataKey="active" name="Pending" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
            <Bar dataKey="in_progress" name="In Progress" stackId="a" fill="#86efac" radius={[0, 0, 0, 0]} />
            <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#fde047" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Footer: Current RT Stats */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-600 gap-2">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Current RT Stats
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-bold">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Total resolved: {stats?.total_resolved ?? 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Response time: {stats?.avg_response_time_min ?? 0} min</span>
        </div>
      </div>
    </div>
  );
};
