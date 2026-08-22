"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Building2,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Complaints", href: "/complaints", icon: ClipboardList },
  { name: "Staff & RTs", href: "/staff", icon: Users },
  { name: "Hostels & Rooms", href: "/hostels", icon: Building2 },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } =
    useSidebar();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-50 shadow-sm transition-all duration-300 ease-in-out",
          // Mobile state
          isMobileOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0",
          // Desktop width state
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "h-16 px-4 border-b border-slate-200 flex items-center justify-between transition-all",
            isCollapsed ? "lg:px-3 lg:justify-center" : "px-5"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  HostelDesk
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">
                  Complaint Portal
                </p>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button (Only when expanded) */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Toggle Button in Collapsed Rail */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center pt-3 pb-1">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider animate-in fade-in duration-150">
              Management
            </div>
          )}

          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobileOpen && closeMobileSidebar()}
                className={cn(
                  "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                  isCollapsed && !isMobileOpen
                    ? "px-0 py-3 justify-center"
                    : "px-3 py-2.5",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/80 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="whitespace-nowrap overflow-hidden animate-in fade-in duration-200">
                    {item.name}
                  </span>
                )}

                {/* Collapsed Tooltip badge */}
                {isCollapsed && !isMobileOpen && (
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};
