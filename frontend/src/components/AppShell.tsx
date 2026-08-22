"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50 antialiased">{children}</div>;
  }

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
