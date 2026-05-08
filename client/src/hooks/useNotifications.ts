import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import * as api from "../services/api";
import { useAppAuth } from "../context/auth-context";

const POLL_MS = 30_000;

export function useNotifications() {
  const { getToken, isSignedIn } = useAuth();
  const { dbUser } = useAppAuth();
  const [notifications, setNotifications] = useState<api.Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!isSignedIn || !dbUser) return;
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.listNotifications(token);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // silent
    }
  }, [isSignedIn, getToken, dbUser]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const markRead = useCallback(
    async (id: string) => {
      const token = await getToken();
      if (!token) return;
      await api.markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [getToken]
  );

  const markAllRead = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    await api.markAllNotificationsRead(token);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, [getToken]);

  return { notifications, unreadCount, refresh: load, markRead, markAllRead };
}