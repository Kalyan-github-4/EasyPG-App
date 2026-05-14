import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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

  // Track the Clerk user ID we last fetched for, so we don't re-fetch
  // unnecessarily on unrelated re-renders.
  const lastFetchedClerkId = useRef<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!isSignedIn) {
      // Clear everything on sign-out — don't leave stale dbUser in state
      setDbUser(null);
      setIsLoading(false);
      lastFetchedClerkId.current = null;
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // getToken() refreshes the JWT automatically if it's near expiry.
      // Passing { skipCache: true } forces a fresh token from Clerk —
      // important after a role change so the server sees the new claims.
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const user = await api.getMe(token);
      setDbUser(user);
      lastFetchedClerkId.current = clerkUser?.id ?? null;
    } catch (err: unknown) {
      console.error("[AuthContext] Failed to fetch user:", err);

      // If the server returns 401 the Clerk session is probably invalid —
      // surface a clean message instead of a raw ApiError.
      if (err instanceof api.ApiError && err.status === 401) {
        setError("Session expired. Please sign in again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load user profile");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken, clerkUser?.id]);

  useEffect(() => {
    // Only re-fetch when the signed-in user actually changes (different clerkId),
    // or when isSignedIn flips (sign-in / sign-out). Avoids double-fetching on
    // every AuthProvider re-render.
    const currentId = clerkUser?.id ?? null;
    if (!isSignedIn || currentId !== lastFetchedClerkId.current) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, clerkUser?.id]);

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