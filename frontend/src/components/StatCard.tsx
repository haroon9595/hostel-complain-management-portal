import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "blue" | "amber" | "emerald" | "purple" | "slate";
  subtitle?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = "blue",
  subtitle,
  loading = false,
}) => {
  const variantStyles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    purple: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
    },
    slate: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl border shadow-2xs",
            currentVariant.bg,
            currentVariant.text,
            currentVariant.border
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
