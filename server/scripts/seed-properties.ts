/**
 * Seed realistic demo data for EasyPG.
 *
 * Creates a handful of fake host users and 18 properties
 * across Jhargram, Kharagpur, and Medinipur, mixing
 * pg/mess/hostel + boys/girls/any with Unsplash cover photos.
 *
 * Run with:   npx tsx scripts/seed-properties.ts
 *
 * Idempotent: clerkIds and property names use a SEED_TAG so the
 * script can be re-run without creating duplicates (existing seed
 * rows are deleted first).
 */

import "dotenv/config";
import { eq, inArray, like } from "drizzle-orm";

import { db } from "../src/db/index";
import {
  users,
  properties,
  propertyPhotos,
  facilities,
} from "../src/db/schema/index";

const SEED_TAG = "seed_";

// ─── Hosts ───────────────────────────────────────────────────────

const HOSTS = [
  { name: "Priya Sen", email: "priya.sen+seed@easypg.dev", phone: "+919832716373" },
  { name: "Dipyedu Mahato", email: "dipyedu.mahato+seed@easypg.dev", phone: "+919832716373" },
  { name: "Rahul Mondal", email: "rahul.mondal+seed@easypg.dev", phone: "+919832716373" },
  { name: "Debasmita Roy", email: "debasmita.roy+seed@easypg.dev", phone: "+919832716373" },
  { name: "Ashok Patra", email: "ashok.patra+seed@easypg.dev", phone: "+919832716373" },
  { name: "Meera Chatterjee", email: "meera.chatterjee+seed@easypg.dev", phone: "+919832716373" },
];

// ─── Image pool (public Unsplash URLs, stable) ───────────────────

const PG_IMAGES = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200",
];

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200",
];

const MESS_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200",
];

const HOSTEL_IMAGES = [
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200",
  "https://images.unsplash.com/photo-1555854877-b4b07c45fb3a?w=1200",
  "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=1200",
];

function picsFor(type: "pg" | "mess" | "hostel") {
  const base = type === "mess" ? MESS_IMAGES : type === "hostel" ? HOSTEL_IMAGES : PG_IMAGES;
  // Two photos per property: cover + an interior shot
  return [base[Math.floor(Math.random() * base.length)], ROOM_IMAGES[Math.floor(Math.random() * ROOM_IMAGES.length)]];
}

// ─── Property data ───────────────────────────────────────────────

type SeedFacility =
  | "wifi"
  | "ac"
  | "food"
  | "laundry"
  | "parking"
  | "gym"
  | "power_backup"
  | "water_supply"
  | "furnished"
  | "cctv";

type SeedProperty = {
  propertyType: "pg" | "mess" | "hostel";
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  rent: number;
  gender: "boys" | "girls" | "any";
  isAvailable: boolean;
  isTrusted: boolean;
  rating: number;
  reviewCount: number;
  facilities: SeedFacility[];
  hostIdx: number; // index into HOSTS
};

// Rough city centers (fake lat/lng jitter applied per-property)
const CITIES = {
  jhargram: { lat: 22.4556, lng: 86.9979 },
  kharagpur: { lat: 22.3302, lng: 87.3237 },
  medinipur: { lat: 22.4257, lng: 87.3200 },
};

function jitter(base: number) {
  return base + (Math.random() - 0.5) * 0.05;
}

const PROPERTIES: SeedProperty[] = [
  // ─── Jhargram ─────────────────────────────────────────────
  {
    propertyType: "pg",
    name: "Chatri Nibhas PG",
    description: "Cozy PG near Jhargram Bharat Petroleum pump. Attached washroom, home-cooked meals twice daily, and 24x7 power backup.",
    location: "Near Bharat Petroleum Pump, Jhargram",
    latitude: jitter(CITIES.jhargram.lat),
    longitude: jitter(CITIES.jhargram.lng),
    rent: 3500,
    gender: "any",
    isAvailable: true,
    isTrusted: true,
    rating: 4.4,
    reviewCount: 128,
    facilities: ["wifi", "food", "laundry", "parking", "power_backup", "water_supply"],
    hostIdx: 0,
  },
  {
    propertyType: "hostel",
    name: "Jhargram Boys Hostel",
    description: "Budget hostel for college students. Twin sharing rooms, common study hall, and a green campus just 1 km from Jhargram Raj College.",
    location: "Lodhasuli Road, Jhargram",
    latitude: jitter(CITIES.jhargram.lat),
    longitude: jitter(CITIES.jhargram.lng),
    rent: 2800,
    gender: "boys",
    isAvailable: true,
    isTrusted: false,
    rating: 3.9,
    reviewCount: 42,
    facilities: ["wifi", "food", "water_supply", "cctv"],
    hostIdx: 2,
  },
  {
    propertyType: "pg",
    name: "Saboni Ladies PG",
    description: "Safe and verified women's PG run by the Sen family. CCTV coverage, female warden on premises, and nutritious veg/non-veg meals.",
    location: "Chandri More, Jhargram",
    latitude: jitter(CITIES.jhargram.lat),
    longitude: jitter(CITIES.jhargram.lng),
    rent: 4200,
    gender: "girls",
    isAvailable: true,
    isTrusted: true,
    rating: 4.6,
    reviewCount: 87,
    facilities: ["wifi", "food", "laundry", "cctv", "power_backup", "furnished"],
    hostIdx: 1,
  },
  {
    propertyType: "mess",
    name: "Maa Tara Mess",
    description: "Daily Bengali thali — rice, dal, sabzi, fish curry (Mon/Wed/Fri), paneer on Sunday. Monthly passes available.",
    location: "Baidyanathpur, Jhargram",
    latitude: jitter(CITIES.jhargram.lat),
    longitude: jitter(CITIES.jhargram.lng),
    rent: 2400,
    gender: "any",
    isAvailable: true,
    isTrusted: true,
    rating: 4.3,
    reviewCount: 156,
    facilities: ["food", "water_supply"],
    hostIdx: 4,
  },
  {
    propertyType: "pg",
    name: "Green Valley PG",
    description: "Premium PG with AC rooms, attached washrooms, and a rooftop common area. Walking distance to Jhargram Station.",
    location: "Station Road, Jhargram",
    latitude: jitter(CITIES.jhargram.lat),
    longitude: jitter(CITIES.jhargram.lng),
    rent: 6500,
    gender: "any",
    isAvailable: true,
    isTrusted: true,
    rating: 4.5,
    reviewCount: 64,
    facilities: ["wifi", "ac", "food", "laundry", "parking", "cctv", "furnished"],
    hostIdx: 0,
  },
  {
    propertyType: "hostel",
    name: "Shantipur Girls Hostel",
    description: "Three-sharing rooms, full boarding, evening tuition hall, and a strict visitor policy. Ideal for Class 11-12 students.",
    location: "Shantipur, Jhargram",
    latitude: jitter(CITIES.jhargram.lat),
    longitude: jitter(CITIES.jhargram.lng),
    rent: 3200,
    gender: "girls",
    isAvailable: false,
    isTrusted: true,
    rating: 4.2,
    reviewCount: 51,
    facilities: ["food", "cctv", "water_supply", "laundry"],
    hostIdx: 3,
  },

  // ─── Kharagpur ────────────────────────────────────────────
  {
    propertyType: "pg",
    name: "IIT Gate Residency",
    description: "Just 5 minutes from IIT Kharagpur Main Gate. Single and double rooms, high-speed wifi, and a modern kitchen.",
    location: "Prem Bazar, Kharagpur",
    latitude: jitter(CITIES.kharagpur.lat),
    longitude: jitter(CITIES.kharagpur.lng),
    rent: 7500,
    gender: "boys",
    isAvailable: true,
    isTrusted: true,
    rating: 4.7,
    reviewCount: 214,
    facilities: ["wifi", "ac", "food", "laundry", "parking", "gym", "power_backup", "cctv"],
    hostIdx: 2,
  },
  {
    propertyType: "pg",
    name: "Scholars Nest Kharagpur",
    description: "A study-first PG for engineering aspirants. Quiet zones, 24x7 library access, and mentor-led doubt clearing sessions.",
    location: "Inda, Kharagpur",
    latitude: jitter(CITIES.kharagpur.lat),
    longitude: jitter(CITIES.kharagpur.lng),
    rent: 5500,
    gender: "any",
    isAvailable: true,
    isTrusted: true,
    rating: 4.4,
    reviewCount: 98,
    facilities: ["wifi", "food", "laundry", "power_backup", "water_supply", "furnished"],
    hostIdx: 5,
  },
  {
    propertyType: "hostel",
    name: "Kharagpur Boys Hub",
    description: "Super-budget hostel for students and working professionals. Common washrooms, three-time mess, and a cycle stand.",
    location: "Khaspur, Kharagpur",
    latitude: jitter(CITIES.kharagpur.lat),
    longitude: jitter(CITIES.kharagpur.lng),
    rent: 2500,
    gender: "boys",
    isAvailable: true,
    isTrusted: false,
    rating: 3.8,
    reviewCount: 29,
    facilities: ["food", "water_supply"],
    hostIdx: 4,
  },
  {
    propertyType: "pg",
    name: "Haldia Ladies PG",
    description: "Women-only PG with 24x7 CCTV, female caretaker, and a quiet garden. 10 minutes from Kharagpur College.",
    location: "Talbagicha, Kharagpur",
    latitude: jitter(CITIES.kharagpur.lat),
    longitude: jitter(CITIES.kharagpur.lng),
    rent: 4800,
    gender: "girls",
    isAvailable: true,
    isTrusted: true,
    rating: 4.5,
    reviewCount: 112,
    facilities: ["wifi", "ac", "food", "laundry", "cctv", "furnished"],
    hostIdx: 3,
  },
  {
    propertyType: "mess",
    name: "Gupta Mess Kharagpur",
    description: "North Indian thali with roti, sabzi, dal, chawal, and curd. Hot rotis made on order. Open 12-3pm and 7-10pm.",
    location: "Malancha Road, Kharagpur",
    latitude: jitter(CITIES.kharagpur.lat),
    longitude: jitter(CITIES.kharagpur.lng),
    rent: 2800,
    gender: "any",
    isAvailable: true,
    isTrusted: true,
    rating: 4.1,
    reviewCount: 78,
    facilities: ["food"],
    hostIdx: 4,
  },
  {
    propertyType: "pg",
    name: "Sunrise PG Homes",
    description: "Brand new PG launched this month. Fully furnished AC rooms with attached washrooms, geyser, and study tables.",
    location: "Hijli, Kharagpur",
    latitude: jitter(CITIES.kharagpur.lat),
    longitude: jitter(CITIES.kharagpur.lng),
    rent: 6800,
    gender: "any",
    isAvailable: true,
    isTrusted: false,
    rating: 4.0,
    reviewCount: 8,
    facilities: ["wifi", "ac", "laundry", "power_backup", "furnished", "cctv"],
    hostIdx: 5,
  },

  // ─── Medinipur ────────────────────────────────────────────
  {
    propertyType: "pg",
    name: "Vidyasagar PG",
    description: "Named after Medinipur's pride. Spacious rooms, library on site, and a vegetable garden supplying the mess.",
    location: "Rangamati, Medinipur",
    latitude: jitter(CITIES.medinipur.lat),
    longitude: jitter(CITIES.medinipur.lng),
    rent: 3800,
    gender: "boys",
    isAvailable: true,
    isTrusted: true,
    rating: 4.3,
    reviewCount: 93,
    facilities: ["wifi", "food", "laundry", "parking", "water_supply", "furnished"],
    hostIdx: 2,
  },
  {
    propertyType: "hostel",
    name: "Mohanpur Girls Hostel",
    description: "Women's hostel near Vidyasagar University. CCTV on every floor, full boarding, and weekly counselling sessions.",
    location: "Mohanpur, Medinipur",
    latitude: jitter(CITIES.medinipur.lat),
    longitude: jitter(CITIES.medinipur.lng),
    rent: 3500,
    gender: "girls",
    isAvailable: true,
    isTrusted: true,
    rating: 4.4,
    reviewCount: 76,
    facilities: ["wifi", "food", "cctv", "laundry", "water_supply"],
    hostIdx: 1,
  },
  {
    propertyType: "pg",
    name: "Kalibari View PG",
    description: "Budget PG with a temple view. Single-sharing rooms, shared kitchen, and optional mess plan.",
    location: "Kalibari More, Medinipur",
    latitude: jitter(CITIES.medinipur.lat),
    longitude: jitter(CITIES.medinipur.lng),
    rent: 2900,
    gender: "any",
    isAvailable: true,
    isTrusted: false,
    rating: 3.7,
    reviewCount: 22,
    facilities: ["wifi", "water_supply", "parking"],
    hostIdx: 4,
  },
  {
    propertyType: "mess",
    name: "Ma Kalir Bhoj",
    description: "Home-style Bengali meals. Unlimited rice, 2 veg, 1 non-veg alternate days. Monthly tiffin delivery option.",
    location: "Keranichati, Medinipur",
    latitude: jitter(CITIES.medinipur.lat),
    longitude: jitter(CITIES.medinipur.lng),
    rent: 2200,
    gender: "any",
    isAvailable: true,
    isTrusted: true,
    rating: 4.5,
    reviewCount: 143,
    facilities: ["food", "water_supply"],
    hostIdx: 3,
  },
  {
    propertyType: "pg",
    name: "Riverside Ladies PG",
    description: "Premium women-only PG by the Kangsabati riverside. AC rooms, jogging track, and a weekly yoga class.",
    location: "Kangsabati Road, Medinipur",
    latitude: jitter(CITIES.medinipur.lat),
    longitude: jitter(CITIES.medinipur.lng),
    rent: 5200,
    gender: "girls",
    isAvailable: true,
    isTrusted: true,
    rating: 4.6,
    reviewCount: 104,
    facilities: ["wifi", "ac", "food", "laundry", "gym", "cctv", "furnished"],
    hostIdx: 1,
  },
  {
    propertyType: "hostel",
    name: "Medinipur Co-living",
    description: "Modern co-living for boys and girls (separate floors). Game room, rooftop cafe, and shared workspace.",
    location: "LIC More, Medinipur",
    latitude: jitter(CITIES.medinipur.lat),
    longitude: jitter(CITIES.medinipur.lng),
    rent: 6200,
    gender: "any",
    isAvailable: true,
    isTrusted: true,
    rating: 4.2,
    reviewCount: 58,
    facilities: ["wifi", "ac", "food", "laundry", "gym", "cctv", "furnished", "power_backup"],
    hostIdx: 5,
  },
];

// ─── Runner ──────────────────────────────────────────────────────

async function clearPreviousSeed() {
  console.log("→ Clearing previous seed data...");

  // Seed hosts by clerkId prefix
  const seedHosts = await db
    .select({ id: users.id })
    .from(users)
    .where(like(users.clerkId, `${SEED_TAG}%`));

  if (seedHosts.length > 0) {
    const ids = seedHosts.map((h) => h.id);
    // Cascade via FK will clean properties + photos + facilities
    await db.delete(users).where(inArray(users.id, ids));
    console.log(`  Removed ${seedHosts.length} previous seed host(s) and their properties.`);
  } else {
    console.log("  No prior seed data found.");
  }
}

async function seed() {
  await clearPreviousSeed();

  console.log("→ Creating host users...");
  const insertedHosts = await Promise.all(
    HOSTS.map(async (h, idx) => {
      const [row] = await db
        .insert(users)
        .values({
          clerkId: `${SEED_TAG}host_${idx}_${Date.now()}`,
          name: h.name,
          email: h.email,
          phone: h.phone,
          role: "host",
        })
        .returning();
      return row;
    })
  );
  console.log(`  Created ${insertedHosts.length} hosts.`);

  console.log("→ Inserting properties...");
  let created = 0;
  for (const p of PROPERTIES) {
    const host = insertedHosts[p.hostIdx];
    const [prop] = await db
      .insert(properties)
      .values({
        hostId: host.id,
        propertyType: p.propertyType,
        name: p.name,
        description: p.description,
        city: p.location.split(", ").pop()!.trim(),
        location: p.location,
        latitude: p.latitude,
        longitude: p.longitude,
        rent: p.rent,
        gender: p.gender,
        isAvailable: p.isAvailable,
        isTrusted: p.isTrusted,
        rating: p.rating,
        reviewCount: p.reviewCount,
      })
      .returning();

    const pics = picsFor(p.propertyType);
    await db.insert(propertyPhotos).values(
      pics.map((url, idx) => ({
        propertyId: prop.id,
        url,
        publicId: null,
        displayOrder: idx,
      }))
    );

    if (p.facilities.length > 0) {
      await db.insert(facilities).values(
        p.facilities.map((type) => ({ propertyId: prop.id, type }))
      );
    }

    created++;
  }
  console.log(`  Created ${created} properties.`);

  console.log("\n✔ Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
