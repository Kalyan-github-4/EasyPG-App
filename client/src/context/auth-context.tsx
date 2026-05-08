import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as api from "../services/api";

// ─── Types ───────────────────────────────────────────────

interface AuthContextType {
  dbUser: api.User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Notification Setup ──────────────────────────────────

async function registerForPushNotificationsAsync(token: string) {
  try {
    // Request notification permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission not granted");
      return;
    }

    // Get FCM token
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    if (!projectId) {
      console.warn("[Notifications] EXPO_PUBLIC_PROJECT_ID not set");
      return;
    }

    const fcmToken = await Notifications.getExpoPushTokenAsync({ projectId });
    const platform = Platform.OS === "ios" ? "ios" : "android";

    // Register device with backend
    await api.registerDevice(token, {
      fcmToken: fcmToken.data,
      platform,
    });

    console.log("[Notifications] Device registered with FCM token:", fcmToken.data);
  } catch (error) {
    console.error("[Notifications] Failed to register device:", error);
  }
}

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

      // Register device for push notifications
      await registerForPushNotificationsAsync(token);
    } catch (err: unknown) {
      console.error("[AuthContext] Failed to fetch user:", err);
      setError(err instanceof Error ? err.message : "Failed to load user profile");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    refreshUser();
  }, [isSignedIn, clerkUser?.id]);

  // Set up push notification listeners
  useEffect(() => {
    if (!isSignedIn) return;

    // Handle notification received while app is open
    const notificationSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[Notifications] Notification received:", notification);
      }
    );

    // Handle notification tap
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("[Notifications] Notification tapped:", response);
        // TODO: Navigate to relevant screen based on notification data
      }
    );

    return () => {
      // Use the subscription's remove() method instead
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [isSignedIn]);

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