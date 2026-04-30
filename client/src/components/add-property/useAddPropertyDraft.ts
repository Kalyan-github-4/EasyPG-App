import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FormState } from "./types";

const DRAFT_KEY = "add-property-draft-v1";
const DEBOUNCE_MS = 500;

/** Persist form state to AsyncStorage (debounced). Exclude transient fields. */
export function useDraftPersistence(state: FormState, enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Only persist photos that finished uploading — skip in-flight uploads
      const snapshot = {
        name: state.name,
        location: state.location,
        rent: state.rent,
        facilities: state.facilities,
        description: state.description,
        photos: state.photos
          .filter((p) => p.status === "uploaded" && p.url && p.publicId)
          .map((p) => ({
            localId: p.localId,
            url: p.url,
            publicId: p.publicId,
            status: "uploaded" as const,
          })),
      };
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot)).catch(() => {
        // Silent fail — draft is best-effort
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, enabled]);
}

export async function loadDraft(): Promise<Partial<FormState> | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as Partial<FormState>;
  } catch {
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function hasAnyContent(draft: Partial<FormState> | null): boolean {
  if (!draft) return false;
  return !!(
    draft.name?.trim() ||
    draft.location?.trim() ||
    draft.rent?.trim() ||
    draft.description?.trim() ||
    (draft.facilities && draft.facilities.length > 0) ||
    (draft.photos && draft.photos.length > 0)
  );
}
