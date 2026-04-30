import { ImageSourcePropType } from "react-native";

const pgImg1 = require("../../assets/images/pg1.jpg") as ImageSourcePropType;
const pgImg2 = require("../../assets/images/pg2.jpg") as ImageSourcePropType;
const pgImg3 = require("../../assets/images/pg3.jpg") as ImageSourcePropType;
const pgImg4 = require("../../assets/images/pg4.jpeg") as ImageSourcePropType;
const pgImg5 = require("../../assets/images/pg5.jpeg") as ImageSourcePropType;
const pgImg6 = require("../../assets/images/pg6.jpeg") as ImageSourcePropType;

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
  image: ImageSourcePropType;
};

/** @deprecated Use PGListing instead */
export type FeaturedPG = PGListing;
/** @deprecated Use PGListing instead */
export type TrendingPG = PGListing;

// ── All PG listings ──────────────────────────────────────────────
// verification: "trusted" requires rating >= 4.0 AND listedYear <= currentYear - 1
export const ALL_PGS: PGListing[] = [
  {
    id: "1",
    name: "Chatri Nibhas",
    location: "Jhargram Bharat Petroleum pump",
    locality: "Jhargram",
    rent: 3500,
    rating: 4.4,
    reviewCount: 128,
    gender: "any",
    amenities: ["wifi", "ac", "food", "laundry", "parking", "security"],
    listedYear: 2023,
    verification: "trusted",
    image: pgImg1,
  },
  {
    id: "2",
    name: "Zolo Horizon Residency",
    location: "Koramangala 7th Block, Bangalore",
    locality: "Koramangala",
    rent: 11500,
    rating: 4.6,
    reviewCount: 214,
    gender: "any",
    amenities: ["wifi", "ac", "food", "gym", "security", "cctv"],
    listedYear: 2022,
    verification: "trusted",
    image: pgImg2,
  },
  {
    id: "3",
    name: "Colive Serenity Suites",
    location: "Whitefield, Bangalore",
    locality: "Whitefield",
    rent: 9800,
    rating: 4.3,
    reviewCount: 97,
    gender: "girls",
    amenities: ["wifi", "ac", "laundry", "parking", "security"],
    listedYear: 2023,
    verification: "trusted",
    image: pgImg3,
  },
  {
    id: "4",
    name: "Zolo Stays HSR",
    location: "HSR Layout, Bangalore",
    locality: "HSR Layout",
    rent: 8500,
    rating: 4.2,
    reviewCount: 83,
    gender: "boys",
    amenities: ["wifi", "food", "laundry", "security"],
    listedYear: 2024,
    verification: "trusted",
    image: pgImg4,
  },
  {
    id: "5",
    name: "Nestaway Residency",
    location: "Koramangala 5th Block",
    locality: "Koramangala",
    rent: 11000,
    rating: 4.5,
    reviewCount: 176,
    gender: "girls",
    amenities: ["wifi", "ac", "food", "gym", "parking", "cctv"],
    listedYear: 2022,
    verification: "trusted",
    image: pgImg5,
  },
  {
    id: "6",
    name: "Colive 21",
    location: "Indiranagar, Bangalore",
    locality: "Indiranagar",
    rent: 13500,
    rating: 4.7,
    reviewCount: 241,
    gender: "any",
    amenities: ["wifi", "ac", "food", "gym", "security", "cctv"],
    listedYear: 2021,
    verification: "trusted",
    image: pgImg6,
  },
  {
    id: "7",
    name: "Stanza Living Valencia",
    location: "BTM Layout 2nd Stage",
    locality: "BTM Layout",
    rent: 7200,
    rating: 4.1,
    reviewCount: 64,
    gender: "boys",
    amenities: ["wifi", "ac", "laundry", "security"],
    listedYear: 2026,
    verification: "none",
    image: pgImg1,
  },
  {
    id: "8",
    name: "HelloWorld Living",
    location: "Whitefield, Bangalore",
    locality: "Whitefield",
    rent: 10500,
    rating: 4.3,
    reviewCount: 109,
    gender: "any",
    amenities: ["wifi", "ac", "food", "parking", "security", "cctv"],
    listedYear: 2023,
    verification: "trusted",
    image: pgImg2,
  },
  {
    id: "9",
    name: "OYO Life BLR Residency",
    location: "Marathahalli, Bangalore",
    locality: "Marathahalli",
    rent: 7800,
    rating: 4.0,
    reviewCount: 52,
    gender: "boys",
    amenities: ["wifi", "food", "laundry", "security"],
    listedYear: 2024,
    verification: "trusted",
    image: pgImg3,
  },
  {
    id: "10",
    name: "Sakhi Women's PG",
    location: "JP Nagar 6th Phase",
    locality: "JP Nagar",
    rent: 6500,
    rating: 4.4,
    reviewCount: 93,
    gender: "girls",
    amenities: ["wifi", "food", "laundry", "security", "cctv"],
    listedYear: 2023,
    verification: "trusted",
    image: pgImg5,
  },
  {
    id: "11",
    name: "GreenNest Residency",
    location: "Electronic City Phase 1",
    locality: "Electronic City",
    rent: 5800,
    rating: 4.0,
    reviewCount: 47,
    gender: "boys",
    amenities: ["wifi", "food", "parking", "security"],
    listedYear: 2026,
    verification: "none",
    image: pgImg4,
  },
  {
    id: "12",
    name: "Lux Ladies Living",
    location: "Bellandur, Bangalore",
    locality: "Bellandur",
    rent: 9500,
    rating: 4.5,
    reviewCount: 131,
    gender: "girls",
    amenities: ["wifi", "ac", "food", "gym", "laundry", "cctv"],
    listedYear: 2023,
    verification: "trusted",
    image: pgImg6,
  },
  {
    id: "13",
    name: "CoHo Residency",
    location: "Marathahalli Bridge, Bangalore",
    locality: "Marathahalli",
    rent: 6200,
    rating: 3.9,
    reviewCount: 38,
    gender: "any",
    amenities: ["wifi", "food", "laundry", "security"],
    listedYear: 2022,
    verification: "none",
    image: pgImg1,
  },
  {
    id: "14",
    name: "Comfort Home PG",
    location: "Sarjapur Road, Bangalore",
    locality: "Sarjapur Road",
    rent: 7500,
    rating: 4.2,
    reviewCount: 71,
    gender: "any",
    amenities: ["wifi", "food", "laundry", "parking", "security"],
    listedYear: 2024,
    verification: "trusted",
    image: pgImg3,
  },
  {
    id: "15",
    name: "Urban Nest PG",
    location: "Whitefield Main Road",
    locality: "Whitefield",
    rent: 5500,
    rating: 4.1,
    reviewCount: 55,
    gender: "boys",
    amenities: ["wifi", "food", "security"],
    listedYear: 2025,
    verification: "trusted",
    image: pgImg4,
  },
];

// ── Curated section definitions ──────────────────────────────────
const IT_PARK_LOCALITIES = ["whitefield", "marathahalli", "electronic city", "bellandur", "sarjapur road"];

export type HomeSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  filter: (pg: PGListing) => boolean;
};

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
export function getPGsForSection(sectionId: string): PGListing[] {
  const section = HOME_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return [];
  return ALL_PGS.filter(section.filter);
}

// ── Legacy exports (backwards compat) ────────────────────────────
export const FEATURED = ALL_PGS.filter((pg) => pg.rating >= 4.3 && pg.verification !== "none");
export const TRENDING = ALL_PGS.slice(3, 9);
