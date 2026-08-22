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
  Shield,
  User,
  ChevronDown,
  Eye,
  CheckCircle,
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
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
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
      <div className="flex items-center gap-2.5 sm:gap-3.5">
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

        {/* Authentication State Toggle */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {/* Demo / Read-Only Mode Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>Read-Only Mode</span>
            </div>

            {/* Staff Sign In Button */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Staff Sign In</span>
            </Link>
          </div>
        ) : (
          /* Logged In Admin Profile Dropdown */
          <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-xs font-extrabold shadow-xs group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <div className="hidden md:block text-xs">
                <p className="font-bold text-slate-800 leading-tight">
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
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                    {user?.role}
                  </span>
                </div>

                <div className="p-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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
