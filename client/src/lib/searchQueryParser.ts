/**
 * Natural-language query parser for EasyPG search.
 *
 * Takes a raw user query string and extracts structured search intent:
 *  - Property type (pg, mess, hostel)
 *  - Gender (boys, girls)
 *  - Max rent / budget
 *  - Location / city
 *  - "near me" intent
 *  - College/institution name (for geo-based search)
 *  - Amenities (wifi, ac, food, etc.)
 *  - Free-text remainder
 */

import { CITIES } from "../data/constants";

// ─── Types ───────────────────────────────────────────────

export type PropertyTypeFilter = "pg" | "mess" | "hostel" | null;
export type GenderFilter = "boys" | "girls" | null;

export interface ParsedSearchQuery {
  /** Detected property type filter */
  propertyType: PropertyTypeFilter;
  /** Detected gender preference */
  gender: GenderFilter;
  /** Max rent extracted from phrases like "under 5000" */
  maxRent: number | null;
  /** Whether the user wants location-based results */
  nearMe: boolean;
  /** Detected city name (from our city list) */
  city: string | null;
  /** College/institution name for geo-lookup */
  collegeQuery: string | null;
  /** Detected amenity keywords */
  amenities: string[];
  /** Remaining text after extracting structured parts */
  freeText: string;
  /** Original raw query */
  raw: string;
  /** Human-readable description of what was parsed */
  description: string;
}

// ─── Constants ───────────────────────────────────────────

const CITY_NAMES = CITIES.map((c) => c.name.toLowerCase());

const COLLEGE_KEYWORDS = [
  "college", "university", "institute", "iit", "nit", "iiit",
  "iim", "school", "academy", "polytechnic", "campus",
  "medical college", "engineering college", "law college",
];

const AMENITY_MAP: Record<string, string> = {
  wifi: "wifi",
  "wi-fi": "wifi",
  internet: "wifi",
  ac: "ac",
  "air conditioning": "ac",
  "air conditioner": "ac",
  food: "food",
  meals: "food",
  "home food": "food",
  tiffin: "food",
  mess: "food", // context: "pg with mess" means food
  laundry: "laundry",
  washing: "laundry",
  parking: "parking",
  bike: "parking",
  security: "security",
  guard: "security",
  gym: "gym",
  "power backup": "power_backup",
  generator: "power_backup",
  inverter: "power_backup",
  water: "water_supply",
  "water supply": "water_supply",
  furnished: "furnished",
  cctv: "cctv",
  camera: "cctv",
};

// ─── Parser ──────────────────────────────────────────────

export function parseSearchQuery(raw: string): ParsedSearchQuery {
  let text = raw.trim().toLowerCase();
  const original = text;

  const result: ParsedSearchQuery = {
    propertyType: null,
    gender: null,
    maxRent: null,
    nearMe: false,
    city: null,
    collegeQuery: null,
    amenities: [],
    freeText: "",
    raw,
    description: "",
  };

  // ── 1. Extract property type ────────────────────────
  if (/\bhostel\b/.test(text)) {
    result.propertyType = "hostel";
    text = text.replace(/\bhostels?\b/g, "").trim();
  } else if (/\bmess\b/.test(text) && !/\bwith\s+mess\b/.test(text)) {
    // "mess" as a property type, but "pg with mess" means amenity
    result.propertyType = "mess";
    text = text.replace(/\bmess\b/g, "").trim();
  } else if (/\bpg\b/.test(text)) {
    result.propertyType = "pg";
    text = text.replace(/\bpgs?\b/g, "").trim();
  }

  // ── 2. Extract gender ──────────────────────────────
  if (/\bgirls?\b/.test(text) || /\bwomen'?s?\b/.test(text) || /\bfemale\b/.test(text) || /\bladies\b/.test(text)) {
    result.gender = "girls";
    text = text.replace(/\b(girls?|women'?s?|female|ladies)\b/g, "").trim();
  } else if (/\bboys?\b/.test(text) || /\bmen'?s?\b/.test(text) || /\bmale\b/.test(text) || /\bgents?\b/.test(text)) {
    result.gender = "boys";
    text = text.replace(/\b(boys?|men'?s?|male|gents?)\b/g, "").trim();
  }

  // ── 3. Extract budget / price ──────────────────────
  // Patterns: "under 5000", "below 8k", "< 10000", "within 6000", "budget 5k"
  const priceMatch = text.match(
    /(?:under|below|less\s+than|<|within|budget|upto|up\s+to|max)\s*(?:₹|rs\.?|inr)?\s*(\d+)\s*k?/i
  );
  if (priceMatch) {
    let amount = parseInt(priceMatch[1], 10);
    // If the number is small (< 100), assume thousands
    if (amount < 100) amount *= 1000;
    result.maxRent = amount;
    text = text.replace(priceMatch[0], "").trim();
  }

  // Also match "5000 rupees" or "₹5000" or "5k" standalone near price context
  if (!result.maxRent) {
    const altPrice = text.match(/(?:₹|rs\.?)\s*(\d+)\s*k?/i);
    if (altPrice) {
      let amount = parseInt(altPrice[1], 10);
      if (amount < 100) amount *= 1000;
      result.maxRent = amount;
      text = text.replace(altPrice[0], "").trim();
    }
  }

  // ── 4. Extract "near me" ───────────────────────────
  if (/\bnear\s+me\b/.test(text)) {
    result.nearMe = true;
    text = text.replace(/\bnear\s+me\b/g, "").trim();
  }

  // ── 5. Extract amenities ───────────────────────────
  // Check for "with <amenity>" or standalone amenity keywords
  for (const [keyword, amenityId] of Object.entries(AMENITY_MAP)) {
    // Skip "mess" as amenity if already used as property type
    if (keyword === "mess" && result.propertyType === "mess") continue;

    const withPattern = new RegExp(`\\bwith\\s+${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const standalonePattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");

    if (withPattern.test(text)) {
      if (!result.amenities.includes(amenityId)) {
        result.amenities.push(amenityId);
      }
      text = text.replace(withPattern, "").trim();
    } else if (standalonePattern.test(text) && keyword.length > 2) {
      // Only match standalone for keywords > 2 chars to avoid false positives
      if (!result.amenities.includes(amenityId)) {
        result.amenities.push(amenityId);
      }
      text = text.replace(standalonePattern, "").trim();
    }
  }

  // ── 6. Extract city name ───────────────────────────
  for (const city of CITIES) {
    const cityLower = city.name.toLowerCase();
    const pattern = new RegExp(`\\b${cityLower}\\b`, "i");
    if (pattern.test(text)) {
      result.city = city.name;
      text = text.replace(pattern, "").trim();
      break;
    }
  }

  // ── 7. Detect college / institution ────────────────
  if (!result.city && !result.nearMe) {
    const hasCollegeKeyword = COLLEGE_KEYWORDS.some((kw) =>
      original.toLowerCase().includes(kw)
    );
    if (hasCollegeKeyword) {
      // The remaining text + college keywords form the college query
      // Use the original minus type/gender/price for the geocoding query
      let collegeText = original;
      // Remove property type words
      collegeText = collegeText.replace(/\b(pg|pgs|hostel|hostels)\b/gi, "");
      // Remove prepositions
      collegeText = collegeText.replace(/\b(near|at|in|around|close\s+to|nearby)\b/gi, "");
      // Remove gender words
      collegeText = collegeText.replace(/\b(boys?|girls?|men'?s?|women'?s?|male|female)\b/gi, "");
      collegeText = collegeText.replace(/\s+/g, " ").trim();

      if (collegeText.length > 2) {
        result.collegeQuery = collegeText;
      }
    }
  }

  // ── 8. Clean up remaining text ─────────────────────
  // Remove common filler words
  text = text
    .replace(/\b(near|at|in|for|the|a|an|and|or|with|around|close\s+to|nearby)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  result.freeText = text;

  // ── 9. Build description ───────────────────────────
  result.description = buildDescription(result);

  return result;
}

// ─── Description builder ─────────────────────────────────

function buildDescription(q: ParsedSearchQuery): string {
  const parts: string[] = [];

  // Type
  const typeLabel = q.propertyType
    ? q.propertyType === "pg" ? "PGs" : q.propertyType === "mess" ? "Messes" : "Hostels"
    : "Properties";
  parts.push(typeLabel);

  // Gender
  if (q.gender) {
    parts.push(`for ${q.gender}`);
  }

  // Location
  if (q.nearMe) {
    parts.push("near you");
  } else if (q.city) {
    parts.push(`in ${q.city}`);
  } else if (q.collegeQuery) {
    parts.push(`near ${q.collegeQuery}`);
  }

  // Budget
  if (q.maxRent) {
    parts.push(`under ₹${q.maxRent.toLocaleString("en-IN")}`);
  }

  // Amenities
  if (q.amenities.length > 0) {
    parts.push(`with ${q.amenities.join(", ")}`);
  }

  return parts.join(" ");
}
