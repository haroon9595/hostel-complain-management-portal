import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "HostelDesk - University Complaint & Facilities Portal",
  description: "Enterprise Hostel Complaint Management System with Next.js, Supabase & FastAPI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <SidebarProvider>
            <AppShell>{children}</AppShell>
            <AuthModal />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
