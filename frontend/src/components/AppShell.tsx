"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Dynamic Main Content Container */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen bg-slate-50 transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {children}
      </div>
    </div>
  );
};
