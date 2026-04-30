import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import * as api from "../services/api";
import { useAppAuth } from "../context/auth-context";

const POLL_MS = 30_000;

export function useInquiryUnread() {
  const { getToken, isSignedIn } = useAuth();
  const { dbUser } = useAppAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!isSignedIn || !dbUser) return;
    try {
      const token = await getToken();
      if (!token) return;
      const threads = await api.listInquiries(token);
      const sum = threads.reduce((acc, t) => {
        const u =
          t.inquiry.guestId === dbUser.id
            ? t.inquiry.guestUnread
            : t.inquiry.hostUnread;
        return acc + u;
      }, 0);
      setTotalUnread(sum);
    } catch {
      // Silent — this is a peripheral indicator
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

  return { totalUnread, refresh: load };
}
