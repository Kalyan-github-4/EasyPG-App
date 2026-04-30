import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "easypg:search:recent";
const MAX = 8;

export interface RecentSearch {
  query: string;
  ts: number;
}

export async function getRecentSearches(): Promise<RecentSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is RecentSearch =>
        x && typeof x.query === "string" && typeof x.ts === "number"
    );
  } catch {
    return [];
  }
}

export async function addRecentSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    const current = await getRecentSearches();
    const deduped = current.filter(
      (r) => r.query.toLowerCase() !== trimmed.toLowerCase()
    );
    const next = [{ query: trimmed, ts: Date.now() }, ...deduped].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Silent — history is peripheral
  }
}

export async function removeRecentSearch(query: string): Promise<void> {
  try {
    const current = await getRecentSearches();
    const next = current.filter(
      (r) => r.query.toLowerCase() !== query.toLowerCase()
    );
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Silent
  }
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Silent
  }
}
