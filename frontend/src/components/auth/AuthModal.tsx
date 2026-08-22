"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  X,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";

/**
 * Maps raw backend/network errors to human-friendly, clean UI messages.
 * Never exposes raw API, network stack, or database error text.
 */
function getHumanReadableAuthError(err: any): string {
  if (!err) return "Incorrect email or password.";
  const raw = (typeof err === "string" ? err : err.message || "").toLowerCase();

  if (
    raw.includes("invalid login credentials") ||
    raw.includes("invalid_grant") ||
    raw.includes("invalid credentials") ||
    raw.includes("user not found") ||
    raw.includes("incorrect") ||
    raw.includes("bad credentials") ||
    raw.includes("400")
  ) {
    return "Incorrect email or password.";
  }

  if (raw.includes("email not confirmed") || raw.includes("unconfirmed")) {
    return "Your staff account email has not been verified yet. Please check your inbox.";
  }

  if (raw.includes("too many requests") || raw.includes("rate limit") || raw.includes("429")) {
    return "Too many failed attempts. Please wait a moment and try again.";
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

  return "Incorrect email or password.";
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
    const cleanPass = password;

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
      console.error("Staff authentication error:", err);
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
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-auth-modal-title"
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/20 overflow-hidden flex flex-col w-full max-w-[420px] animate-in zoom-in-95 duration-200 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Icon + Title + Subtitle + Close Button */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="staff-auth-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
              >
                Staff Authentication
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Hostel Administration & Resident Tutor Portal
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
          {/* Notice Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <p className="leading-tight font-medium">
              {authModalReason || "Staff authorization required to modify records"}
            </p>
          </div>

          {/* Inline Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* University Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="staff-modal-email"
                className="text-xs font-semibold text-slate-700 block"
              >
                Official University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="staff-modal-email"
                  type="email"
                  required
                  disabled={loading}
                  placeholder="name@hostel.edu.pk"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
                  autoFocus
                />
              </div>
            </div>

            {/* Access Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="staff-modal-password"
                className="text-xs font-semibold text-slate-700 block"
              >
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="staff-modal-password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors focus:outline-none"
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

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleClose}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
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

        {/* Footer: Trust Badge */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>🔒 Encrypted Session · Authorized Personnel Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
