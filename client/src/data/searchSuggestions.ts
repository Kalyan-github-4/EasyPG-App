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
  | "search-outline"
  | "school-outline"
  | "restaurant-outline"
  | "business-outline"
  | "bed-outline"
  | "shield-checkmark-outline";

// ─── Curated trending + quick suggestions ──────────────────────────

export const TRENDING_QUERIES: Suggestion[] = [
  {
    id: "t-near-me",
    kind: "trending",
    label: "PG near me",
    sublabel: "Uses your location",
    query: "pg near me",
    icon: "navigate-outline",
  },
  {
    id: "t-jhargram",
    kind: "trending",
    label: "PG in Jhargram",
    sublabel: "Popular",
    query: "pg in Jhargram",
    icon: "flame-outline",
  },
  {
    id: "t-kharagpur",
    kind: "trending",
    label: "PG near IIT Kharagpur",
    sublabel: "Guest favorite",
    query: "pg near IIT Kharagpur",
    icon: "school-outline",
  },
  {
    id: "t-medinipur",
    kind: "trending",
    label: "PG in Medinipur",
    sublabel: "Trending",
    query: "pg in Medinipur",
    icon: "trending-up-outline",
  },
];

export const QUICK_FILTERS: Suggestion[] = [
  {
    id: "q-mess-near",
    kind: "quick",
    label: "Mess near me",
    sublabel: "Daily meal plans nearby",
    query: "mess near me",
    icon: "restaurant-outline",
  },
  {
    id: "q-hostel-near",
    kind: "quick",
    label: "Hostel near me",
    sublabel: "Budget dorm stays nearby",
    query: "hostel near me",
    icon: "business-outline",
  },
  {
    id: "q-girls",
    kind: "quick",
    label: "Girls PG",
    sublabel: "Women-only properties",
    query: "girls pg",
    icon: "male-female-outline",
  },
  {
    id: "q-boys",
    kind: "quick",
    label: "Boys PG",
    sublabel: "Men-only properties",
    query: "boys pg",
    icon: "male-female-outline",
  },
  {
    id: "q-budget-5k",
    kind: "quick",
    label: "PG under ₹5,000",
    sublabel: "Budget-friendly",
    query: "pg under 5000",
    icon: "cash-outline",
  },
  {
    id: "q-budget-8k",
    kind: "quick",
    label: "PG under ₹8,000",
    sublabel: "Mid-range",
    query: "pg under 8000",
    icon: "cash-outline",
  },
  {
    id: "q-mess-budget",
    kind: "quick",
    label: "Mess under ₹5,000",
    sublabel: "Affordable meal plans",
    query: "mess under 5000",
    icon: "restaurant-outline",
  },
  {
    id: "q-wifi",
    kind: "quick",
    label: "PG with WiFi",
    sublabel: "Always-on internet",
    query: "pg with wifi",
    icon: "wifi-outline",
  },
  {
    id: "q-food",
    kind: "quick",
    label: "PG with food",
    sublabel: "Home-cooked meals included",
    query: "pg with food",
    icon: "restaurant-outline",
  },
];

// ─── Autocomplete engine ──────────────────────────────────────────

// All locations a user could possibly search for.
const LOCATIONS = [
  ...CITIES.map((c) => ({ name: c.name, kind: "city" as const })),
  ...LOCALITIES.map((l) => ({ name: l.name, kind: "locality" as const })),
];

// Common college / institution patterns
const WELL_KNOWN_COLLEGES = [
  { name: "IIT Kharagpur", query: "pg near IIT Kharagpur" },
  { name: "IIT Bombay", query: "pg near IIT Bombay" },
  { name: "IIT Delhi", query: "pg near IIT Delhi" },
  { name: "Jhargram Raj College", query: "pg near Jhargram Raj College" },
  { name: "Midnapore College", query: "pg near Midnapore College" },
  { name: "Vidyasagar University", query: "pg near Vidyasagar University" },
  { name: "NIT Durgapur", query: "pg near NIT Durgapur" },
];

/**
 * Detects "PG at/in/near <partial>" intent.
 * Returns the preposition used and the remaining text to match against.
 */
function detectIntent(raw: string): {
  template: "at" | "in" | "near" | null;
  prefix: string;
  tail: string;
} {
  const text = raw.trim().toLowerCase();

  // Match property type + preposition patterns
  const patterns: {
    re: RegExp;
    kind: "at" | "in" | "near";
    prefix: string;
  }[] = [
      { re: /^(mess|hostel|pg)\s+near\s*(.*)$/i, kind: "near", prefix: "" },
      { re: /^(mess|hostel|pg)\s+at\s*(.*)$/i, kind: "at", prefix: "" },
      { re: /^(mess|hostel|pg)\s+in\s*(.*)$/i, kind: "in", prefix: "" },
      { re: /^(girls?|boys?)\s+(mess|hostel|pg)\s+(?:near|at|in)\s*(.*)$/i, kind: "near", prefix: "" },
      { re: /^near\s+(.*)$/i, kind: "near", prefix: "" },
      { re: /^at\s+(.*)$/i, kind: "at", prefix: "" },
      { re: /^in\s+(.*)$/i, kind: "in", prefix: "" },
    ];

  for (const p of patterns) {
    const m = text.match(p.re);
    if (m) {
      const tail = (m[m.length - 1] || "").trim();
      return { template: p.kind, prefix: m[1] || "", tail };
    }
  }

  return { template: null, prefix: "", tail: text };
}

// function prepositionLabel(template: "at" | "in" | "near", prefix?: string): string {
//   const typeLabel = prefix ? `${prefix} ` : "PG ";
//   if (template === "near") return `${typeLabel}near`;
//   if (template === "at") return `${typeLabel}at`;
//   return `${typeLabel}in`;
// }

/**
 * Produces typeahead suggestions for a partial query.
 * Strategy:
 *   1. If intent detected ("PG at X"), always prepend "near me" for near + every matching location.
 *   2. Match colleges for "near" queries.
 *   3. Free-text match against city + locality names.
 *   4. Fall back to a search-as-typed suggestion.
 */
export function buildSuggestions(query: string): Suggestion[] {
  const raw = query.trim();
  if (!raw) return [];

  const out: Suggestion[] = [];
  const { template, tail } = detectIntent(raw);
  const lowerRaw = raw.toLowerCase();

  // Detect type prefix for labels
  let typePrefix = "";
  if (/^mess\b/i.test(raw)) typePrefix = "Mess";
  else if (/^hostel\b/i.test(raw)) typePrefix = "Hostel";
  else if (/^pg\b/i.test(raw)) typePrefix = "PG";

  // Helper: add a location completion
  const addLocation = (
    name: string,
    kind: "city" | "locality",
    prefix: "at" | "in" | "near"
  ) => {
    const label = `${typePrefix || "PG"} ${prefix} ${name}`;
    out.push({
      id: `loc-${prefix}-${name}`,
      kind: "location",
      label,
      sublabel: kind === "city" ? "City" : "Locality",
      query: `${typePrefix || "pg"} ${prefix} ${name}`.toLowerCase(),
      icon: prefix === "near" ? "navigate-outline" : "location-outline",
    });
  };

  if (template === "near") {
    // Always offer "near me" first
    out.push({
      id: "near-me",
      kind: "intent",
      label: `${typePrefix || "PG"} near me`,
      sublabel: "Uses your location",
      query: `${typePrefix || "pg"} near me`.toLowerCase(),
      icon: "navigate-outline",
    });

    // Suggest matching colleges
    const matchingColleges = WELL_KNOWN_COLLEGES.filter((c) =>
      tail ? c.name.toLowerCase().includes(tail) : true
    ).slice(0, 3);
    matchingColleges.forEach((c) => {
      out.push({
        id: `college-${c.name}`,
        kind: "location",
        label: `${typePrefix || "PG"} near ${c.name}`,
        sublabel: "College / University",
        query: `${typePrefix || "pg"} near ${c.name}`.toLowerCase(),
        icon: "school-outline",
      });
    });

    // Suggest matching cities
    const filtered = LOCATIONS.filter((l) =>
      tail ? l.name.toLowerCase().includes(tail) : true
    ).slice(0, 4);
    filtered.forEach((l) => addLocation(l.name, l.kind, "near"));
  } else if (template === "at" || template === "in") {
    const filtered = LOCATIONS.filter((l) =>
      tail ? l.name.toLowerCase().includes(tail) : true
    ).slice(0, 6);
    filtered.forEach((l) => addLocation(l.name, l.kind, template));
  } else {
    // Free-text mode

    // Check for budget patterns
    if (/under|below|budget/i.test(raw)) {
      const budgets = [3000, 5000, 8000, 10000];
      budgets.forEach((b) => {
        out.push({
          id: `budget-${b}`,
          kind: "intent",
          label: `${typePrefix || "PG"} under ₹${b.toLocaleString("en-IN")}`,
          sublabel: "Budget filter",
          query: `${typePrefix || "pg"} under ${b}`.toLowerCase(),
          icon: "cash-outline",
        });
      });
    }

    // Check for gender patterns
    if (/girls?|women/i.test(raw)) {
      out.push({
        id: "girls-pg",
        kind: "intent",
        label: "Girls PG",
        sublabel: "Women-only properties",
        query: "girls pg",
        icon: "male-female-outline",
      });
      out.push({
        id: "girls-hostel",
        kind: "intent",
        label: "Girls Hostel",
        sublabel: "Women-only hostels",
        query: "girls hostel",
        icon: "male-female-outline",
      });
    }
    if (/boys?|men/i.test(raw)) {
      out.push({
        id: "boys-pg",
        kind: "intent",
        label: "Boys PG",
        sublabel: "Men-only properties",
        query: "boys pg",
        icon: "male-female-outline",
      });
      out.push({
        id: "boys-hostel",
        kind: "intent",
        label: "Boys Hostel",
        sublabel: "Men-only hostels",
        query: "boys hostel",
        icon: "male-female-outline",
      });
    }

    // Match locations
    const filtered = LOCATIONS.filter((l) =>
      l.name.toLowerCase().includes(lowerRaw)
    ).slice(0, 5);
    filtered.forEach((l) => addLocation(l.name, l.kind, "in"));

    // Match colleges
    const matchingColleges = WELL_KNOWN_COLLEGES.filter((c) =>
      c.name.toLowerCase().includes(lowerRaw)
    ).slice(0, 3);
    matchingColleges.forEach((c) => {
      out.push({
        id: `college-${c.name}`,
        kind: "location",
        label: `PG near ${c.name}`,
        sublabel: "College / University",
        query: c.query.toLowerCase(),
        icon: "school-outline",
      });
    });
  }

  // Always include a "Search for '<raw>'" catch-all
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
