"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  X,
  ShieldCheck,
  Zap,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalReason, login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const performLogin = async (targetEmail: string, targetPass: string) => {
    const cleanEmail = targetEmail.trim();
    const cleanPass = targetPass.trim();

    if (!cleanEmail || !cleanPass) {
      setError("Please provide both your staff email address and password.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(cleanEmail, cleanPass);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      console.error("Supabase authentication error:", err);
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickWardenLogin = async () => {
    const demoEmail = "haroon11004@gmail.com";
    const demoPass = "80cb01e5";
    setEmail(demoEmail);
    setPassword(demoPass);
    await performLogin(demoEmail, demoPass);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 p-6 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Staff Authentication</h3>
              <p className="text-xs text-indigo-100 font-medium">Supabase Verified Staff Access</p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Interception Alert Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">Action Restricted</span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">{authModalReason}</p>
            </div>
          </div>

          {/* Inline Error Message Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">Authentication Failed</span>
                <span className="text-rose-700 font-normal">{error}</span>
              </div>
            </div>
          )}

          {/* Quick Showcase Demo Access */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Quick Showcase Access</span>
              <span className="text-indigo-600 flex items-center gap-1 font-semibold normal-case">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Supabase Credentials
              </span>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleQuickWardenLogin}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 text-left transition-all group disabled:opacity-50 flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 block">
                    Chief Warden (Haroon Rashid)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono block">
                    haroon11004@gmail.com
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>{loading ? "Authenticating..." : "1-Click Sign In"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider relative">
              Or Sign In With Email & Password
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Staff Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="e.g. haroon11004@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Password *
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={closeAuthModal}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Supabase...</span>
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
      </div>
    </div>
  );
};
