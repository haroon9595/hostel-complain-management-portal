import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  type: "status" | "priority" | "category";
  value?: string | null;
  className?: string;
}

export const ComplaintBadge: React.FC<BadgeProps> = ({
  type,
  value,
  className,
}) => {
  if (!value) return <span className="text-xs text-slate-400 font-medium">-</span>;

  const normalized = value.toLowerCase().trim();

  if (type === "status") {
    let style = "bg-slate-100 text-slate-700 border-slate-200";
    let dot = "bg-slate-500";

    if (normalized.includes("pending")) {
      style = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
      dot = "bg-amber-500";
    } else if (normalized.includes("progress")) {
      style = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
      dot = "bg-blue-500 animate-pulse";
    } else if (normalized.includes("resolved")) {
      style = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
      dot = "bg-emerald-500";
    } else if (normalized.includes("closed")) {
      style = "bg-slate-100 text-slate-600 border-slate-200";
      dot = "bg-slate-400";
    }

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border shadow-2xs",
          style,
          className
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
        {value}
      </span>
    );
  }

  if (type === "priority") {
    let style = "bg-slate-100 text-slate-700 border-slate-200";

    if (normalized === "high") {
      style = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
    } else if (normalized === "medium") {
      style = "bg-amber-50 text-amber-700 border-amber-200 font-medium";
    } else if (normalized === "low") {
      style = "bg-sky-50 text-sky-700 border-sky-200 font-medium";
    }

    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-md text-xs border shadow-2xs",
          style,
          className
        )}
      >
        {value}
      </span>
    );
  }

  // Category
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200",
        className
      )}
    >
      {value}
    </span>
  );
};
