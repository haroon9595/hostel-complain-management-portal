"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  X,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

/**
 * Maps raw backend/network errors to human-friendly, clean UI messages.
 * Prevents exposing technical stack traces, CORS errors, or raw database keys.
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

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalReason, login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen && !loading) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, loading]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    // Client-side pre-validation
    if (!cleanEmail) {
      setError("Please enter your registered staff email.");
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
      setEmail("");
      setPassword("");
      setShowPassword(false);
    } catch (err: any) {
      console.error("Staff authentication exception:", err);
      setError(getHumanReadableAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setEmail("");
    setPassword("");
    setShowPassword(false);
    closeAuthModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-[420px] shadow-2xl shadow-slate-900/10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Elegant Top Header Section */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-2xs flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="auth-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
              >
                Staff Authentication
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Supabase Verified Staff Access
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-slate-300"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Security Notice / Action Restricted Banner */}
          <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold text-amber-950 block">Action Restricted</span>
              <p className="mt-0.5 text-amber-800 font-medium">
                {authModalReason ||
                  "You must sign in with authorized RT / Warden credentials to modify complaint records."}
              </p>
            </div>
          </div>

          {/* Clean Inline Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs font-semibold text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold text-rose-950 block">Authentication Failed</span>
                <span className="text-rose-700 font-normal">{error}</span>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
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
                  placeholder="name@hostel.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[48px] bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-2xs transition-all disabled:opacity-50"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[48px] bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-2xs transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors focus:outline-none"
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

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleClose}
                className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize & Proceed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Subtle Security Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Session • Authorized Personnel Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
