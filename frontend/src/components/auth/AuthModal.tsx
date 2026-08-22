"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  X,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Loader2,
  Shield,
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
    return "Unable to connect to the authentication service. Please check your network connection.";
  }

  return "Unable to authenticate at this time. Please try again.";
}

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalReason, login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors disabled:opacity-50"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Staff Authentication</h3>
              <p className="text-xs text-indigo-100 font-medium">
                Hostel Administration & Resident Tutor Portal
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Minimal Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">Staff Credentials Required</span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                {authModalReason ||
                  "You must sign in with authorized RT or Warden credentials to modify complaint records."}
              </p>
            </div>
          </div>

          {/* Clean Red Alert Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">Authentication Alert</span>
                <span className="text-rose-700 font-normal">{error}</span>
              </div>
            </div>
          )}

          {/* Enterprise Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Official University Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="name@hostel.edu.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Access Password
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Credentials...</span>
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

          {/* Discreet Security Footer Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Encrypted Session • Authorized Personnel Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
