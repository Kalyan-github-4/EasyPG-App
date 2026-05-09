import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as api from "../services/api";

// ─── Types ───────────────────────────────────────────────

interface AuthContextType {
  dbUser: api.User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();

  const [dbUser, setDbUser] = useState<api.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!isSignedIn) {
      setDbUser(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) { setIsLoading(false); return; }
      const user = await api.getMe(token);
      setDbUser(user);
    } catch (err: unknown) {
      console.error("[AuthContext] Failed to fetch user:", err);
      setError(err instanceof Error ? err.message : "Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser, clerkUser?.id]);

  return (
    <AuthContext.Provider value={{ dbUser, isLoading, refreshUser, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────

export function useAppAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAppAuth must be used within an AuthProvider");
  return context;
}