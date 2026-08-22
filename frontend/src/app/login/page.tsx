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
  Building2,
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

  return "Unable to authenticate at this time. Please try again.";
}

export default function StaffLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

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
      setError("Please enter your registered staff email address.");
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* ========================================================================= */}
      {/* LEFT COLUMN (55-60%) — HERO SECTION / HOSTEL PHOTO & INTRO */}
      {/* ========================================================================= */}
      <div className="lg:w-[58%] relative min-h-[500px] lg:min-h-screen p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-hidden bg-slate-950">
        {/* Background Image with Integrated Gradient & Dark Overlays */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: "url('/images/hostel_hero.jpg')",
          }}
        />
        {/* Deep Slate / Indigo Gradient Overlay for Pristine Legibility */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/85 to-indigo-950/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-radial-at-t from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Top Header: Brand Logo & Navigation */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>HostelDesk</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                University Residential Portal
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition-colors backdrop-blur-md shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Dashboard</span>
          </Link>
        </div>

        {/* Center: Main Hero Copy & 3 Highlights */}
        <div className="relative z-10 my-auto py-10 max-w-xl space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen Campus Facilities Management</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Smarter Hostels. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-indigo-400">
                Happier Students.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-lg">
              One simple platform to report, track, and resolve hostel complaints — faster and more transparently.
            </p>
          </div>

          {/* 3 Feature Highlights */}
          <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
            {/* Feature 1 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>📝 Report in Seconds</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal font-medium">
                  Submit hostel complaints quickly and effortlessly.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>⚡ Resolve Without Delays</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal font-medium">
                  Keep complaints moving with faster communication and resolution.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>📊 Manage Everything in One Place</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal font-medium">
                  Give staff a clear view of complaints, progress, and resolutions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hero Tagline */}
        <div className="relative z-10 pt-6 border-t border-white/10">
          <p className="text-xs sm:text-sm font-semibold text-slate-400 tracking-wide">
            Better communication. Faster solutions. Better hostel life.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN (40-45%) — STAFF LOGIN FORM */}
      {/* ========================================================================= */}
      <div className="lg:w-[42%] bg-white text-slate-900 p-6 sm:p-12 lg:p-16 flex flex-col justify-between min-h-screen">
        <div className="max-w-md w-full mx-auto my-auto space-y-7">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                <Lock className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Staff Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Sign in to access your authorized hostel management dashboard.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Authentication successful! Redirecting to dashboard...</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 text-xs font-semibold text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-950">Authentication Failed</span>
                <span className="text-rose-700 font-normal">{error}</span>
              </div>
            </div>
          )}

          {/* Staff Authorization Security Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-950 block">Authorized Staff Access</span>
              <p className="mt-0.5 text-amber-800 font-medium leading-relaxed">
                Only authorized RT / Warden staff can access and modify complaint records.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Staff Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="e.g. warden@hostel.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[50px] bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-2xs transition-all disabled:opacity-50"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block">
                  Password
                </label>
                <span
                  title="Contact University IT Helpdesk for password reset"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[50px] bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-2xs transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
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
        </div>

        {/* Footer */}
        <div className="max-w-md w-full mx-auto pt-6 border-t border-slate-100 flex items-center justify-center text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>🛡️ Encrypted Session • Authorized Personnel Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
