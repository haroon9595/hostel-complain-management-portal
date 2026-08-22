"use client";

import React from "react";
import { HostelHeatmapItem } from "@/lib/types";

interface HostelHeatmapGridProps {
  data: HostelHeatmapItem[];
  loading?: boolean;
}

export const HostelHeatmapGrid: React.FC<HostelHeatmapGridProps> = ({
  data,
  loading = false,
}) => {
  const getTileStyle = (level: string) => {
    switch (level) {
      case "high":
        return "bg-[#fca5a5] text-[#991b1b] border-[#f87171]/50 shadow-xs";
      case "medium":
        return "bg-[#fed7aa] text-[#9a3412] border-[#fdba74]/50 shadow-xs";
      case "low":
      default:
        return "bg-[#a7f3d0] text-[#065f46] border-[#6ee7b7]/50 shadow-xs";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-slate-800 tracking-tight">
          Hostel Heatmap
        </h4>
        <span className="text-xs font-semibold text-slate-400">
          Live Density
        </span>
      </div>

      {/* 3x3 Tile Grid */}
      <div className="grid grid-cols-3 gap-2.5 my-auto">
        {data.slice(0, 9).map((tile, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[64px] transition-transform duration-150 hover:scale-[1.02] cursor-default ${getTileStyle(
              tile.level
            )}`}
          >
            <span className="text-[11px] font-bold leading-snug whitespace-pre-line">
              {tile.label}
            </span>
          </div>
        ))}
      </div>

      {/* Heatmap Density Bar */}
      <div className="mt-4 pt-2">
        <div className="h-2.5 w-full rounded-full overflow-hidden flex shadow-inner border border-slate-200/50">
          <div className="w-1/3 bg-[#a7f3d0]" title="Low Density" />
          <div className="w-1/3 bg-[#fed7aa]" title="Medium Density" />
          <div className="w-1/3 bg-[#fca5a5]" title="High Density" />
        </div>
      </div>
    </div>
  );
};
