"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  hostel_id?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string;
  openAuthModal: (reason?: string, onAuthenticated?: () => void) => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  loginDemo: (role?: "admin" | "rt") => Promise<void>;
  logout: () => void;
  requireAuth: (action: () => void, reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "hosteldesk_staff_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string>(
    "You must sign in with authorized RT / Warden credentials to modify complaint records."
  );
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Restore session from localStorage on initial client load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not restore auth session:", e);
    }
  }, []);

  const openAuthModal = useCallback((reason?: string, onAuthenticated?: () => void) => {
    if (reason) {
      setAuthModalReason(reason);
    } else {
      setAuthModalReason(
        "You must sign in with authorized RT / Warden credentials to modify complaint records."
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
    async (email: string, _password?: string): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();
      let roleName = "Resident Tutor (RT)";
      let displayName = cleanEmail.split("@")[0] || "Staff Admin";

      if (cleanEmail.includes("warden") || cleanEmail.includes("admin") || cleanEmail === "haroon11005@gmail.com") {
        roleName = "Chief Warden / Admin";
        displayName = "Management Admin";
      } else if (cleanEmail.includes("abdurrehman")) {
        displayName = "RT Abdurrehman";
      } else {
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      }

      const newUser: AuthUser = {
        id: "staff_" + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: displayName,
        role: roleName,
        hostel_id: 1,
      };

      setUser(newUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {
        console.warn("Failed to persist session to localStorage:", e);
      }

      setIsAuthModalOpen(false);

      // Execute queued action if one was intercepted
      if (pendingAction) {
        try {
          pendingAction();
        } catch (err) {
          console.error("Failed to execute pending action:", err);
        }
        setPendingAction(null);
      }

      return true;
    },
    [pendingAction]
  );

  const loginDemo = useCallback(
    async (role: "admin" | "rt" = "admin") => {
      if (role === "admin") {
        await login("admin@hostel.edu.pk", "admin123");
      } else {
        await login("rt.abdurrehman@hostel.edu.pk", "rt123");
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear session:", e);
    }
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
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        login,
        loginDemo,
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
