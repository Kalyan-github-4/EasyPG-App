import { ImageSourcePropType } from "react-native";

export type PGGender = "boys" | "girls" | "any";

/**
 * Verification levels:
 * - none:    Not yet eligible (new listing or rating below 4.0)
 * - trusted: 1+ year listed AND 4.0+ rating — earns "EasyPG Trusted" badge
 */
export type VerificationLevel = "none" | "trusted";

export type PGListing = {
  id: string;
  name: string;
  location: string;
  locality: string;
  rent: number;
  rating: number;
  reviewCount: number;
  gender: PGGender;
  amenities: string[];
  verification: VerificationLevel;
  listedYear: number;
  image?: ImageSourcePropType;
};

/** @deprecated Use PGListing instead */
export type FeaturedPG = PGListing;
/** @deprecated Use PGListing instead */
export type TrendingPG = PGListing;

// ── Section definitions (used by home screen) ────────────────────
export type HomeSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  filter: (pg: PGListing) => boolean;
};

const IT_PARK_LOCALITIES = ["whitefield", "marathahalli", "electronic city", "bellandur", "sarjapur road"];

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: "featured",
    title: "Featured PGs",
    subtitle: "Top rated, hand-picked for you",
    icon: "star",
    filter: (pg) => pg.rating >= 4.3 && pg.verification !== "none",
  },
  {
    id: "budget",
    title: "Budget Picks",
    subtitle: "Great stays under \u20B98,000",
    icon: "wallet-outline",
    filter: (pg) => pg.rent < 8000,
  },
  {
    id: "girls",
    title: "Girls Only",
    subtitle: "Safe & verified women's PGs",
    icon: "woman-outline",
    filter: (pg) => pg.gender === "girls",
  },
  {
    id: "meals",
    title: "With Meals",
    subtitle: "Home-cooked food included",
    icon: "restaurant-outline",
    filter: (pg) => pg.amenities.includes("food"),
  },
  {
    id: "it-parks",
    title: "Near IT Parks",
    subtitle: "Whitefield, Marathahalli & more",
    icon: "business-outline",
    filter: (pg) => IT_PARK_LOCALITIES.includes(pg.locality.toLowerCase()),
  },
];

/** Get PGs for a section */
export function getPGsForSection(pgs: PGListing[], sectionId: string): PGListing[] {
  const section = HOME_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return [];
  return pgs.filter(section.filter);
}
