const cache = new Map<string, ResolvedLocation | null>();

export type ResolveKind = "college" | "place";

export interface ResolvedLocation {
  lat: number;
  lng: number;
  kind: ResolveKind;
  displayName?: string;
}

/* ─────────────────────────────────────────────
   Keywords that strongly suggest an institution
   ───────────────────────────────────────────── */
const COLLEGE_KEYWORDS = [
  "college",
  "university",
  "institute",
  "iit",
  "nit",
  "iiit",
  "iim",
  "school",
  "academy",
  "polytechnic",
  "campus",
  "medical college",
  "engineering college",
  "law college",
  "management college",
];

/**
 * Returns true if the query appears to reference an educational institution.
 */
export function isCollegeQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return COLLEGE_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Resolves any text query (city, locality, college name, landmark)
 * to coordinates using OpenStreetMap Nominatim.
 *
 * When the query looks like a college/institution, we:
 *  - Prefer results with OSM category "education" or amenity "university/college"
 *  - Tag the result as kind: "college" so callers can apply a radius filter
 *
 * Returns null if nothing is found.
 */
export async function resolveLocation(
  query: string
): Promise<ResolvedLocation | null> {
  const key = query.toLowerCase().trim();

  // 1. Cache first
  if (cache.has(key)) return cache.get(key) ?? null;

  const looksLikeCollege = isCollegeQuery(key);

  // 2. Build Nominatim URL
  //    For college queries, add featuretype hint to bias results toward
  //    educational amenities. Still falls back to best result if not found.
  const params = new URLSearchParams({
    format: "json",
    q: query,
    limit: "5",          // fetch a few so we can pick the best
    addressdetails: "1",
  });

  // Bias towards education amenities for college queries
  if (looksLikeCollege) {
    params.set("featuretype", "settlement"); // broad net, we'll rank below
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        // Nominatim requires a descriptive User-Agent
        "User-Agent": "EasyPG-App/1.0",
      },
    }
  );

  const data: NominatimResult[] = await res.json();

  if (!data?.length) {
    cache.set(key, null);
    return null;
  }

  // 3. Pick the best result
  let best: NominatimResult = data[0];

  if (looksLikeCollege) {
    // Prefer results explicitly tagged as education/university/college
    const educationResult = data.find(
      (r) =>
        r.class === "amenity" &&
        (r.type === "university" ||
          r.type === "college" ||
          r.type === "school") ||
        r.class === "education"
    );
    if (educationResult) best = educationResult;
  }

  const result: ResolvedLocation = {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    kind: looksLikeCollege ? "college" : "place",
    displayName: best.display_name,
  };

  // 4. Cache and return
  cache.set(key, result);
  return result;
}

// ─── Nominatim response shape (minimal) ───────────────────

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
}
