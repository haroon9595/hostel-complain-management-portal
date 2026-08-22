"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Building2,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

const mobileNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Complaints", href: "/complaints", icon: ClipboardList },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Hostels", href: "/hostels", icon: Building2 },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50 antialiased w-full">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased w-full overflow-x-hidden">
      {/* Fixed Sidebar for Desktop & Mobile Drawer */}
      <Sidebar />

      {/* Main Content Area: uses lg:pl-64 / lg:pl-20 so w-full accurately spans viewport without right edge clipping */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen bg-slate-50 transition-all duration-300 ease-in-out w-full pb-20 lg:pb-0 min-w-0 max-w-full overflow-x-hidden",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {children}
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed for handheld viewports < 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-area-inset-bottom"
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {mobileNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[48px]",
                  isActive
                    ? "text-indigo-600 font-bold bg-indigo-50/70"
                    : "text-slate-500 hover:text-slate-900 font-medium"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-500")} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
