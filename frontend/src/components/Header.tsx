"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  RefreshCw,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  LogOut,
  ChevronDown,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";
import { Hostel } from "@/lib/types";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";

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
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .getHostels()
      .then((data) => setHostels(data))
      .catch((err) => console.error("Failed to load hostels for header:", err));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "AD";

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-3.5 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all w-full">
      {/* Left: Mobile Hamburger / Desktop Toggle + Title */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
        {/* Mobile Hamburger Toggle Button (min 44px touch target) */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 active:bg-slate-100 transition-colors flex-shrink-0"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-2xs flex-shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="min-w-0 truncate">
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight truncate leading-tight">
            {title}
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block truncate">
            Hostel Complaints & Resident Tutor Portal
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Hostel Selector Filter */}
        {onHostelChange && (
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-3 py-1.5 text-xs text-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs min-h-[38px] sm:min-h-[40px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 hidden xs:block" />
            <select
              value={selectedHostelId === null ? "" : selectedHostelId}
              onChange={(e) => {
                const val = e.target.value;
                onHostelChange(val === "" ? null : Number(val));
              }}
              aria-label="Filter by Hostel"
              className="bg-transparent text-slate-800 font-semibold outline-none text-xs cursor-pointer max-w-[90px] sm:max-w-[140px] md:max-w-none"
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
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-all disabled:opacity-50 shadow-2xs"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                refreshing ? "animate-spin text-indigo-600" : ""
              }`}
            />
          </button>
        )}

        {/* Authentication State Toggle */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
            {/* Read-Only Badge (Desktop) */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>Read-Only</span>
            </div>

            {/* Staff Sign In Button */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap min-h-[38px] sm:min-h-[40px]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Staff Sign In</span>
              <span className="xs:hidden">Login</span>
            </Link>
          </div>
        ) : (
          /* Logged In Admin Profile Dropdown */
          <div className="relative pl-1 sm:pl-2 border-l border-slate-200" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2.5 p-1 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors group text-left min-h-[40px]"
              aria-label="User Profile Menu"
              aria-expanded={isDropdownOpen}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-xs font-extrabold shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                {initials}
              </div>
              <div className="hidden md:block text-xs">
                <p className="font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                  {user?.name || "Management Admin"}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  {user?.role || "Admin Mode"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 sm:w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                    {user?.role}
                  </span>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors text-left min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out (Switch to Read-Only)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
