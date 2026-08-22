"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CategoryBreakdownItem } from "@/lib/types";

interface CategoriesPieChartProps {
  data: CategoryBreakdownItem[];
  loading?: boolean;
}

const DEFAULT_PALETTE = [
  "#38bdf8",
  "#34d399",
  "#bef264",
  "#fbbf24",
  "#fb923c",
  "#94a3b8",
  "#f87171",
  "#cbd5e1",
];

export const CategoriesPieChart: React.FC<CategoriesPieChartProps> = ({
  data,
  loading = false,
}) => {
  // Only categories with complaints or all registered categories
  const activeSlices = data.filter((item) => item.value > 0);
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  // If no complaints yet across categories, render a subtle empty state ring
  const displaySlices =
    totalValue > 0
      ? activeSlices
      : [{ name: "No Complaints", value: 1, color: "#e2e8f0" }];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-full min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
          Categories Breakdown
        </h4>
        <span className="text-xs font-semibold text-slate-400">
          {totalValue} logged
        </span>
      </div>

      <div className="flex flex-col xs:flex-row items-center justify-between gap-3 sm:gap-4 my-auto min-w-0">
        {/* Donut Chart */}
        <div className="w-32 h-32 sm:w-36 sm:h-36 lg:w-32 lg:h-32 xl:w-40 xl:h-40 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val: any, name: any) =>
                  totalValue > 0 ? [`${val} complaints`, name] : ["0 complaints", "None"]
                }
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              />
              <Pie
                data={displaySlices}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={58}
                paddingAngle={totalValue > 0 ? 3 : 0}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {displaySlices.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col space-y-1.5 text-xs font-medium text-slate-700 pr-1 max-h-40 overflow-y-auto touch-scroll min-w-0 w-full">
          {data.map((item, idx) => (
            <div
              key={item.name}
              className={`flex items-center justify-between gap-2 ${
                item.value > 0 ? "font-bold text-slate-900" : "text-slate-500"
              }`}
            >
              <div className="flex items-center gap-1.5 truncate min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-md flex-shrink-0"
                  style={{
                    backgroundColor:
                      item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
                  }}
                />
                <span className="truncate text-[11px] sm:text-xs">{item.name}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-600 pl-1 flex-shrink-0">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
