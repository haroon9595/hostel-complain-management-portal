"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  RefreshCw,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { api } from "@/lib/api";
import { Hostel } from "@/lib/types";
import { useSidebar } from "@/context/SidebarContext";

interface HeaderProps {
  title?: string;
  selectedHostelId?: number | null;
  onHostelChange?: (hostelId: number | null) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Management Dashboard",
  selectedHostelId = null,
  onHostelChange,
  onRefresh,
  refreshing = false,
}) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const { isCollapsed, toggleSidebar, toggleMobileSidebar } = useSidebar();

  useEffect(() => {
    api
      .getHostels()
      .then((data) => setHostels(data))
      .catch((err) => console.error("Failed to load hostels for header:", err));
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all">
      {/* Left side: Mobile Hamburger / Desktop Toggle + Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Toggle Button */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop Collapse Toggle Button in Header */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-2xs"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Hostel Complaints & RT Dispatch
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hostel Selector Filter */}
        {onHostelChange && (
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={selectedHostelId === null ? "" : selectedHostelId}
              onChange={(e) => {
                const val = e.target.value;
                onHostelChange(val === "" ? null : Number(val));
              }}
              className="bg-transparent text-slate-800 font-medium outline-none text-xs cursor-pointer pr-1 max-w-[100px] sm:max-w-none"
            >
              <option value="">All Hostels</option>
              {hostels.map((h) => (
                <option key={h.hostel_id} value={h.hostel_id}>
                  {h.hostel_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all disabled:opacity-50 shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                refreshing ? "animate-spin text-indigo-600" : ""
              }`}
            />
          </button>
        )}

        {/* Admin Badge */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            AD
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-bold text-slate-800 leading-tight">
              Management Admin
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active System
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
