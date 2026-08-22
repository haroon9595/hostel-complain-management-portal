"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  hostel_id?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string, onAuthenticated?: () => void) => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requireAuth: (action: () => void, reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUserToAuthUser(sbUser: SupabaseUser): AuthUser {
  const email = sbUser.email || "staff@hostel.edu.pk";
  let roleName = "Resident Tutor (RT)";
  let displayName = sbUser.user_metadata?.full_name || email.split("@")[0];

  if (
    email.includes("warden") ||
    email.includes("admin") ||
    email.toLowerCase() === "haroon11004@gmail.com" ||
    email.toLowerCase() === "haroon11005@gmail.com"
  ) {
    roleName = "Chief Warden / Admin";
    displayName = "Management Admin";
  } else if (email.includes("abdurrehman")) {
    displayName = "RT Abdurrehman";
  } else {
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  }

  return {
    id: sbUser.id,
    email: email,
    name: displayName,
    role: roleName,
    hostel_id: 1,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string>(
    "Staff authorization required to modify records"
  );
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Sync Supabase active session on client load and listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(mapSupabaseUserToAuthUser(session.user));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(mapSupabaseUserToAuthUser(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback((reason?: string, onAuthenticated?: () => void) => {
    if (reason) {
      setAuthModalReason(reason);
    } else {
      setAuthModalReason(
        "Staff authorization required to modify records"
      );
    }
    if (onAuthenticated) {
      setPendingAction(() => onAuthenticated);
    } else {
      setPendingAction(null);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  }, []);

  const login = useCallback(
    async (email: string, password?: string): Promise<boolean> => {
      const cleanEmail = email.trim();
      const cleanPassword = (password || "").trim();

      if (!cleanEmail || !cleanPassword) {
        throw new Error("Both Email address and Password are required to authenticate.");
      }

      // Execute strict Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        throw new Error(error.message || "Invalid login credentials. Authentication failed.");
      }

      if (!data.user) {
        throw new Error("Authentication succeeded but no user data was returned by Supabase.");
      }

      const authenticatedUser = mapSupabaseUserToAuthUser(data.user);
      setUser(authenticatedUser);
      setSession(data.session);
      setIsAuthModalOpen(false);

      // Automatically execute intercepted action if one was queued
      if (pendingAction) {
        try {
          pendingAction();
        } catch (err) {
          console.error("Failed to execute pending action post-login:", err);
        }
        setPendingAction(null);
      }

      return true;
    },
    [pendingAction]
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out error:", e);
    }
    setUser(null);
    setSession(null);
  }, []);

  const requireAuth = useCallback(
    (action: () => void, reason?: string) => {
      if (user) {
        action();
      } else {
        openAuthModal(reason, action);
      }
    },
    [user, openAuthModal]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
