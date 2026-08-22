import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/AppShell";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "Hostel Complaint Management System",
  description: "FastAPI + Supabase + Next.js Hostel Complaint Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased overflow-x-hidden">
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
