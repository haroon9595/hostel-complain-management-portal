"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Contact2,
  FileText,
  Zap,
  BarChart3,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

/**
 * Maps raw backend/network errors to human-friendly UI messages.
 */
function getHumanReadableAuthError(err: any): string {
  if (!err) return "Unable to authenticate at this time. Please try again.";
  const raw = (typeof err === "string" ? err : err.message || "").toLowerCase();

  if (
    raw.includes("invalid login credentials") ||
    raw.includes("invalid_grant") ||
    raw.includes("invalid credentials") ||
    raw.includes("user not found") ||
    raw.includes("incorrect") ||
    raw.includes("400")
  ) {
    return "Authentication failed. Incorrect email or password.";
  }

  if (raw.includes("email not confirmed") || raw.includes("unconfirmed")) {
    return "Your staff account email has not been verified yet. Please check your inbox.";
  }

  if (
    raw.includes("network") ||
    raw.includes("fetch") ||
    raw.includes("failed to fetch") ||
    raw.includes("timeout") ||
    raw.includes("connection")
  ) {
    return "Unable to connect to authentication service. Please check your internet connection.";
  }

  return "Authentication failed. Please verify your credentials and try again.";
}

export default function StaffLoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [authMethod, setAuthMethod] = useState<"passkey" | "staff_id">("passkey");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setError(
        authMethod === "staff_id"
          ? "Please enter your official staff email or ID."
          : "Please enter your registered staff email address."
      );
      return;
    }

    if (!cleanPass) {
      setError("Please enter your password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(cleanEmail, cleanPass);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch (err: any) {
      console.error("Staff authentication exception:", err);
      setError(getHumanReadableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-x-hidden font-sans bg-slate-950">
      {/* Blurred Campus Background Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat filter brightness-[0.38] scale-105 transition-transform duration-1000 ease-out pointer-events-none"
        style={{
          backgroundImage: "url('/images/hostel_hero.jpg')",
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-tr from-slate-950/90 via-slate-900/65 to-indigo-950/40 backdrop-blur-xs pointer-events-none" />
      <div className="fixed inset-0 bg-radial-at-t from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 py-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN — BRANDING & VALUE HIGHLIGHTS */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-8 text-white">
          {/* Top Header: Brand Logo & Navigation */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">
                  HostelDesk
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  University Residential Portal
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-200 transition-colors backdrop-blur-md shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Dashboard</span>
            </Link>
          </div>

          {/* Hero Copy */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Facilities & Incident Management</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Smarter Hostels. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-indigo-400">
                Happier Students.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-lg">
              Centralized platform for hostel administration, resident tutor workflows, and fast incident resolution across campus wings.
            </p>
          </div>

          {/* 3 Value Highlights */}
          <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
            {/* Highlight 1: Direct Ticket Assignment */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Direct Ticket Assignment
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal font-medium">
                  Instantly allocate complaints to maintenance technicians and hostel staff.
                </p>
              </div>
            </div>

            {/* Highlight 2: Quick Status Resolution */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Quick Status Resolution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal font-medium">
                  Review, update, and resolve resident issues with audit logs.
                </p>
              </div>
            </div>

            {/* Highlight 3: Live Wing Overview */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Live Wing Overview
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal font-medium">
                  Real-time room occupancy and wing-level maintenance tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs font-semibold text-slate-400">
            Authorized Personnel Portal · University Housing Division
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN — FLOATING GLASSMORPHISM CARD */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[440px] flex justify-center">
          <div className="w-full bg-white/[0.94] backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/80 p-6 sm:p-8 text-slate-900 space-y-5 transition-all">
            {/* Toggle Tabs: Passkey Access vs Staff ID card */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("passkey");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  authMethod === "passkey"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Passkey Access</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("staff_id");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  authMethod === "staff_id"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Contact2 className="w-3.5 h-3.5" />
                <span>Staff ID card</span>
              </button>
            </div>

            {/* Card Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                  {authMethod === "passkey" ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Contact2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Authorized Staff Sign-In
                  </h2>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Secure login for RT and Warden management
              </p>
            </div>

            {/* Success Banner */}
            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Authentication successful! Redirecting to dashboard...</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-rose-950">Authentication Failed</span>
                  <span className="text-rose-700 font-normal">{error}</span>
                </div>
              </div>
            )}

            {/* Staff Notice Banner */}
            <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <p className="leading-tight font-medium">
                Staff credentials required to access administrative tools and complaint records.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email / ID Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {authMethod === "staff_id"
                    ? "Official University Email or Staff ID"
                    : "Official University Email"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    placeholder={
                      authMethod === "staff_id"
                        ? "rt-204@hostel.edu.pk"
                        : "name@hostel.edu.pk"
                    }
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-2xs transition-all disabled:opacity-50"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-2xs transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Trust Badge */}
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-center text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>🔒 Encrypted Session · Authorized Personnel Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
