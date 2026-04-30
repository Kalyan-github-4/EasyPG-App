import { CITIES, LOCALITIES } from "./constants";

export type SuggestionKind =
  | "recent"
  | "intent"
  | "location"
  | "quick"
  | "trending";

export interface Suggestion {
  id: string;
  kind: SuggestionKind;
  label: string;           // Primary display text
  sublabel?: string;       // Secondary hint (e.g., "City", "Near you")
  query: string;           // What actually gets searched
  icon: IconName;
}

export type IconName =
  | "time-outline"
  | "location-outline"
  | "location"
  | "navigate-outline"
  | "trending-up-outline"
  | "flame-outline"
  | "sparkles-outline"
  | "cash-outline"
  | "wifi-outline"
  | "male-female-outline"
  | "search-outline";

// ─── Curated trending + quick suggestions ──────────────────────────

export const TRENDING_QUERIES: Suggestion[] = [
  {
    id: "t-jhargram",
    kind: "trending",
    label: "PG in Jhargram",
    sublabel: "Popular",
    query: "Jhargram",
    icon: "flame-outline",
  },
  {
    id: "t-kharagpur",
    kind: "trending",
    label: "PG near IIT Kharagpur",
    sublabel: "Guest favorite",
    query: "Kharagpur",
    icon: "flame-outline",
  },
  {
    id: "t-medinipur",
    kind: "trending",
    label: "PG in Medinipur",
    sublabel: "Trending",
    query: "Medinipur",
    icon: "trending-up-outline",
  },
];

export const QUICK_FILTERS: Suggestion[] = [
  {
    id: "q-near",
    kind: "quick",
    label: "PG near me",
    sublabel: "Uses your location",
    query: "near me",
    icon: "navigate-outline",
  },
  {
    id: "q-budget",
    kind: "quick",
    label: "PG under ₹8,000",
    sublabel: "Budget-friendly",
    query: "under 8000",
    icon: "cash-outline",
  },
  {
    id: "q-girls",
    kind: "quick",
    label: "PG for girls",
    sublabel: "Women-only",
    query: "girls",
    icon: "male-female-outline",
  },
  {
    id: "q-wifi",
    kind: "quick",
    label: "PG with WiFi",
    sublabel: "Always-on internet",
    query: "wifi",
    icon: "wifi-outline",
  },
];

// ─── Autocomplete engine ──────────────────────────────────────────

// All locations a user could possibly search for.
const LOCATIONS = [
  ...CITIES.map((c) => ({ name: c.name, kind: "city" as const })),
  ...LOCALITIES.map((l) => ({ name: l.name, kind: "locality" as const })),
];

/**
 * Detects "PG at/in/near <partial>" intent.
 * Returns the preposition used and the remaining text to match against.
 */
function detectIntent(raw: string): {
  template: "at" | "in" | "near" | null;
  tail: string;
} {
  const text = raw.trim().toLowerCase();

  // Match at the start only — keeps the intent explicit.
  const patterns: Array<{ re: RegExp; kind: "at" | "in" | "near" }> = [
    { re: /^pg\s+near\s*(.*)$/i, kind: "near" },
    { re: /^pg\s+at\s*(.*)$/i, kind: "at" },
    { re: /^pg\s+in\s*(.*)$/i, kind: "in" },
    { re: /^near\s+(.*)$/i, kind: "near" },
    { re: /^at\s+(.*)$/i, kind: "at" },
    { re: /^in\s+(.*)$/i, kind: "in" },
  ];

  for (const p of patterns) {
    const m = text.match(p.re);
    if (m) return { template: p.kind, tail: (m[1] || "").trim() };
  }

  return { template: null, tail: text };
}

function prepositionLabel(template: "at" | "in" | "near"): string {
  if (template === "near") return "PG near";
  if (template === "at") return "PG at";
  return "PG in";
}

/**
 * Produces typeahead suggestions for a partial query.
 * Strategy:
 *   1. If intent detected ("PG at X"), always prepend "near me" for near + every matching location.
 *   2. Otherwise, free-text match against city + locality names.
 *   3. Fall back to a search-as-typed suggestion.
 */
export function buildSuggestions(query: string): Suggestion[] {
  const raw = query.trim();
  if (!raw) return [];

  const out: Suggestion[] = [];
  const { template, tail } = detectIntent(raw);

  // Helper: add a location completion ("PG at Jhargram")
  const addLocation = (
    name: string,
    kind: "city" | "locality",
    prefix: "at" | "in" | "near"
  ) => {
    const label = `${prepositionLabel(prefix)} ${name}`;
    out.push({
      id: `loc-${prefix}-${name}`,
      kind: "location",
      label,
      sublabel: kind === "city" ? "City" : "Locality",
      query: name,
      icon: prefix === "near" ? "navigate-outline" : "location-outline",
    });
  };

  if (template === "near") {
    // Always offer "near me" first
    out.push({
      id: "near-me",
      kind: "intent",
      label: "PG near me",
      sublabel: "Uses your location",
      query: "near me",
      icon: "navigate-outline",
    });
    const filtered = LOCATIONS.filter((l) =>
      tail ? l.name.toLowerCase().includes(tail) : true
    ).slice(0, 5);
    filtered.forEach((l) => addLocation(l.name, l.kind, "near"));
  } else if (template === "at" || template === "in") {
    const filtered = LOCATIONS.filter((l) =>
      tail ? l.name.toLowerCase().includes(tail) : true
    ).slice(0, 6);
    filtered.forEach((l) => addLocation(l.name, l.kind, template));
  } else {
    // Free-text mode — match on name
    const filtered = LOCATIONS.filter((l) =>
      l.name.toLowerCase().includes(raw.toLowerCase())
    ).slice(0, 6);
    filtered.forEach((l) => addLocation(l.name, l.kind, "in"));
  }

  // Always include a "Search for '<raw>'" catch-all so users can submit
  // anything — keeps the flow open-ended.
  if (!out.some((s) => s.query.toLowerCase() === raw.toLowerCase())) {
    out.push({
      id: `raw-${raw}`,
      kind: "intent",
      label: `Search for "${raw}"`,
      query: raw,
      icon: "search-outline",
    });
  }

  return out;
}
