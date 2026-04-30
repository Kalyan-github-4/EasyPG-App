import { ImageSourcePropType } from "react-native";
import { VerificationLevel } from "./pgData";

const pgImg1 = require("../../assets/images/pg1.jpg") as ImageSourcePropType;
const pgImg2 = require("../../assets/images/pg2.jpg") as ImageSourcePropType;
const pgImg3 = require("../../assets/images/pg3.jpg") as ImageSourcePropType;
const pgImg4 = require("../../assets/images/pg4.jpeg") as ImageSourcePropType;
const pgImg5 = require("../../assets/images/pg5.jpeg") as ImageSourcePropType;
const pgImg6 = require("../../assets/images/pg6.jpeg") as ImageSourcePropType;

export type Facility = { icon: string; label: string };
export type RoomType = { type: string; price: number };

export type Review = {
  id: string;
  userName: string;
  userInitial: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
};

export type PGDetail = {
  id: string;
  name: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  rent: number;
  rating: number;
  reviewCount: number;
  verification: VerificationLevel;
  images: ImageSourcePropType[];
  about: string;
  facilities: Facility[];
  roomTypes: RoomType[];
  host: { name: string; phone: string; initial: string };
  reviews: Review[];
};

// ── Shared review pool ───────────────────────────────────────
const R: Record<string, Review[]> = {
  "1": [
    { id: "r1a", userName: "Amit Das", userInitial: "A", rating: 5, date: "2026-03-20", comment: "Amazing place! The food quality is great and rooms are spacious. Staff is very helpful and responsive.", helpful: 12 },
    { id: "r1b", userName: "Sneha Roy", userInitial: "S", rating: 4, date: "2026-02-14", comment: "Clean rooms and good WiFi. Only downside is parking can get tight during weekends.", helpful: 6 },
    { id: "r1c", userName: "Rahul Sen", userInitial: "R", rating: 4, date: "2026-01-05", comment: "Good value for money. Location is convenient and the security is excellent.", helpful: 3 },
  ],
  "2": [
    { id: "r2a", userName: "Priya Sharma", userInitial: "P", rating: 5, date: "2026-03-28", comment: "Best PG in Koramangala! Premium facilities, gym is well-maintained, and food is restaurant quality.", helpful: 24 },
    { id: "r2b", userName: "Karthik N", userInitial: "K", rating: 5, date: "2026-03-10", comment: "Absolutely love it here. The community events are a great touch. Worth every rupee.", helpful: 18 },
    { id: "r2c", userName: "Aisha Khan", userInitial: "A", rating: 4, date: "2026-02-22", comment: "Great place overall. AC works perfectly. Wish the laundry service was faster though.", helpful: 7 },
  ],
  "3": [
    { id: "r3a", userName: "Meera Iyer", userInitial: "M", rating: 4, date: "2026-03-15", comment: "Very safe for women. The security guards are always alert and the locality is peaceful.", helpful: 15 },
    { id: "r3b", userName: "Divya R", userInitial: "D", rating: 5, date: "2026-02-28", comment: "Perfect for working women near IT parks. Quick commute and great amenities.", helpful: 9 },
  ],
  "t1": [
    { id: "r4a", userName: "Rohit Kumar", userInitial: "R", rating: 4, date: "2026-03-12", comment: "Budget-friendly with decent facilities. Food could be better but overall a solid choice.", helpful: 8 },
    { id: "r4b", userName: "Vikash P", userInitial: "V", rating: 4, date: "2026-02-18", comment: "Good location in HSR. Walking distance to restaurants and metro. Rooms are clean.", helpful: 5 },
  ],
  "t2": [
    { id: "r5a", userName: "Ananya S", userInitial: "A", rating: 5, date: "2026-04-01", comment: "The gym here is amazing! Plus the food quality is consistently good. Highly recommend.", helpful: 20 },
    { id: "r5b", userName: "Riya Patel", userInitial: "R", rating: 4, date: "2026-03-05", comment: "Love the community vibe. Made great friends here. Management is very responsive.", helpful: 11 },
    { id: "r5c", userName: "Neha Gupta", userInitial: "N", rating: 5, date: "2026-02-10", comment: "Safest PG I've stayed in. CCTV everywhere, biometric entry. Parents will love this.", helpful: 16 },
  ],
  "t3": [
    { id: "r6a", userName: "Arjun Reddy", userInitial: "A", rating: 5, date: "2026-03-25", comment: "Top-notch luxury living. The rooftop deck is perfect for unwinding after work. Premium in every sense.", helpful: 28 },
    { id: "r6b", userName: "Deepika M", userInitial: "D", rating: 5, date: "2026-03-08", comment: "Worth the premium price. Indiranagar location is unbeatable. Feels like a boutique hotel.", helpful: 22 },
    { id: "r6c", userName: "Sanjay T", userInitial: "S", rating: 4, date: "2026-02-15", comment: "Excellent facilities and great food. Only complaint is the slightly high rent but you get what you pay for.", helpful: 14 },
  ],
  "t4": [
    { id: "r7a", userName: "Manoj K", userInitial: "M", rating: 4, date: "2026-03-02", comment: "Good value PG in BTM. Clean rooms, decent food. Great for freshers starting out.", helpful: 6 },
    { id: "r7b", userName: "Suresh L", userInitial: "S", rating: 4, date: "2026-01-20", comment: "Hot water and WiFi work great. Laundry service is timely. Happy with my stay.", helpful: 4 },
  ],
  "t5": [
    { id: "r8a", userName: "Nikhil J", userInitial: "N", rating: 4, date: "2026-03-18", comment: "Built for techies — blazing fast internet and power backup never fails. Close to IT parks.", helpful: 13 },
    { id: "r8b", userName: "Pooja R", userInitial: "P", rating: 5, date: "2026-02-25", comment: "The hacker lounge is so cool! Great place for developers. Food is also quite good.", helpful: 10 },
  ],
  "t6": [
    { id: "r9a", userName: "Gaurav S", userInitial: "G", rating: 4, date: "2026-03-10", comment: "Best budget option near Marathahalli. Food is homely and rooms are well-maintained.", helpful: 7 },
    { id: "r9b", userName: "Arun P", userInitial: "A", rating: 4, date: "2026-01-28", comment: "Decent place for the price. Laundry and security are reliable. Good for working professionals.", helpful: 4 },
  ],
};

const MOCK_PGS: PGDetail[] = [
  {
    id: "1",
    name: "Chatri Nibhas",
    location: "Jhargram Bharat Petroleum pump",
    address: "On the straight road to the right of Jhargram Bharat Petroleum pump, in front of Nonibala Boys’ School – 560102",
    lat: 12.9116,
    lng: 77.6389,
    rent: 9200,
    rating: 4.4,
    reviewCount: 128,
    verification: "trusted" as VerificationLevel,
    images: [pgImg1, pgImg2, pgImg3],
    about:
      "Chatri Nibhas is a premium co-living space in the heart of HSR Layout. Enjoy fully furnished rooms, high-speed Wi-Fi, and daily housekeeping in a vibrant community of working professionals.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "snow-outline", label: "AC" },
      { icon: "restaurant-outline", label: "Food" },
      { icon: "shirt-outline", label: "Laundry" },
      { icon: "car-outline", label: "Parking" },
      { icon: "shield-checkmark-outline", label: "Security" },
    ],
    roomTypes: [
      { type: "Single", price: 9200 },
      { type: "Double", price: 7500 },
      { type: "Triple", price: 6000 },
    ],
    host: { name: "Rajesh Kumar", phone: "+919876543210", initial: "R" },
    reviews: R["1"],
  },
  {
    id: "2",
    name: "Zolo Horizon Residency",
    location: "Koramangala 7th Block, Bangalore",
    address: "80 Feet Rd, 7th Block, Koramangala, Bengaluru – 560095",
    lat: 12.9352,
    lng: 77.6245,
    rent: 11500,
    rating: 4.6,
    reviewCount: 214,
    verification: "trusted" as VerificationLevel,
    images: [pgImg2, pgImg1, pgImg4],
    about:
      "Zolo Horizon offers premium managed residences in the most sought-after tech hub of Bangalore. Spacious rooms, rooftop lounge, and 24/7 concierge make it the ideal home for professionals.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "snow-outline", label: "AC" },
      { icon: "restaurant-outline", label: "Food" },
      { icon: "fitness-outline", label: "Gym" },
      { icon: "tv-outline", label: "TV Lounge" },
      { icon: "shield-checkmark-outline", label: "Security" },
      { icon: "water-outline", label: "Hot Water" },
      { icon: "videocam-outline", label: "CCTV" },
    ],
    roomTypes: [
      { type: "Single", price: 11500 },
      { type: "Double", price: 9000 },
    ],
    host: { name: "Priya Nair", phone: "+919845612345", initial: "P" },
    reviews: R["2"],
  },
  {
    id: "3",
    name: "Colive Serenity Suites",
    location: "Whitefield, Bangalore",
    address: "ITPL Main Rd, Whitefield, Bengaluru – 560066",
    lat: 12.9698,
    lng: 77.7499,
    rent: 9800,
    rating: 4.3,
    reviewCount: 97,
    verification: "trusted" as VerificationLevel,
    images: [pgImg3, pgImg5, pgImg6],
    about:
      "Colive Serenity Suites is strategically located near the IT corridor in Whitefield. With serene surroundings and modern amenities, it provides a peaceful retreat after a long workday.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "snow-outline", label: "AC" },
      { icon: "shirt-outline", label: "Laundry" },
      { icon: "car-outline", label: "Parking" },
      { icon: "shield-checkmark-outline", label: "Security" },
      { icon: "water-outline", label: "Hot Water" },
    ],
    roomTypes: [
      { type: "Single", price: 9800 },
      { type: "Double", price: 8200 },
      { type: "Triple", price: 6500 },
    ],
    host: { name: "Suresh Babu", phone: "+919731234567", initial: "S" },
    reviews: R["3"],
  },
  {
    id: "t1",
    name: "Zolo Stays HSR",
    location: "HSR Layout, Bangalore",
    address: "27th Main, Sector 2, HSR Layout, Bengaluru – 560102",
    lat: 12.9082,
    lng: 77.6476,
    rent: 8500,
    rating: 4.2,
    reviewCount: 83,
    verification: "trusted" as VerificationLevel,
    images: [pgImg4, pgImg1, pgImg2],
    about:
      "Zolo Stays HSR is a budget-friendly yet comfortable co-living option in the lively HSR Layout. Perfect for freshers and young professionals looking for an affordable home in Bangalore.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "restaurant-outline", label: "Food" },
      { icon: "shirt-outline", label: "Laundry" },
      { icon: "shield-checkmark-outline", label: "Security" },
    ],
    roomTypes: [
      { type: "Single", price: 8500 },
      { type: "Double", price: 6800 },
      { type: "Triple", price: 5500 },
    ],
    host: { name: "Anand Sharma", phone: "+919900112233", initial: "A" },
    reviews: R["t1"],
  },
  {
    id: "t2",
    name: "Nestaway Residency",
    location: "Koramangala 5th Block, Bangalore",
    address: "5th Block, Koramangala, Bengaluru – 560034",
    lat: 12.9279,
    lng: 77.6271,
    rent: 11000,
    rating: 4.5,
    reviewCount: 176,
    verification: "trusted" as VerificationLevel,
    images: [pgImg5, pgImg3, pgImg1],
    about:
      "Nestaway Residency brings you a fully managed living experience in Koramangala, Bangalore's most vibrant neighbourhood. Steps away from cafes, startups, and metro connectivity.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "snow-outline", label: "AC" },
      { icon: "restaurant-outline", label: "Food" },
      { icon: "fitness-outline", label: "Gym" },
      { icon: "car-outline", label: "Parking" },
      { icon: "videocam-outline", label: "CCTV" },
    ],
    roomTypes: [
      { type: "Single", price: 11000 },
      { type: "Double", price: 8800 },
    ],
    host: { name: "Meena Iyer", phone: "+919600998877", initial: "M" },
    reviews: R["t2"],
  },
  {
    id: "t3",
    name: "Colive 21",
    location: "Indiranagar, Bangalore",
    address: "100 Feet Rd, Indiranagar, Bengaluru – 560038",
    lat: 12.9784,
    lng: 77.6408,
    rent: 13500,
    rating: 4.7,
    reviewCount: 241,
    verification: "trusted" as VerificationLevel,
    images: [pgImg6, pgImg4, pgImg2],
    about:
      "Colive 21 is a luxury co-living space in the heart of Indiranagar. Floor-to-ceiling windows, designer interiors, and a rooftop deck make this the most sought-after address in Bangalore.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "snow-outline", label: "AC" },
      { icon: "restaurant-outline", label: "Food" },
      { icon: "fitness-outline", label: "Gym" },
      { icon: "tv-outline", label: "TV Lounge" },
      { icon: "car-outline", label: "Parking" },
      { icon: "shield-checkmark-outline", label: "Security" },
      { icon: "water-outline", label: "Hot Water" },
    ],
    roomTypes: [
      { type: "Single", price: 13500 },
      { type: "Double", price: 11000 },
    ],
    host: { name: "Vikram Reddy", phone: "+919845500123", initial: "V" },
    reviews: R["t3"],
  },
  {
    id: "t4",
    name: "Stanza Living Valencia",
    location: "BTM Layout 2nd Stage, Bangalore",
    address: "2nd Stage, BTM Layout, Bengaluru – 560076",
    lat: 12.9165,
    lng: 77.6101,
    rent: 9200,
    rating: 4.1,
    reviewCount: 64,
    verification: "none" as VerificationLevel,
    images: [pgImg1, pgImg6, pgImg5],
    about:
      "Stanza Valencia blends affordability with comfort in BTM Layout, a hub for tech professionals and students. Great connectivity to Electronic City and Koramangala.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "snow-outline", label: "AC" },
      { icon: "shirt-outline", label: "Laundry" },
      { icon: "shield-checkmark-outline", label: "Security" },
      { icon: "water-outline", label: "Hot Water" },
    ],
    roomTypes: [
      { type: "Single", price: 9200 },
      { type: "Double", price: 7400 },
      { type: "Triple", price: 6000 },
    ],
    host: { name: "Kavitha Menon", phone: "+919744001122", initial: "K" },
    reviews: R["t4"],
  },
  {
    id: "t5",
    name: "HelloWorld Living",
    location: "Whitefield, Bangalore",
    address: "Kadugodi, Whitefield, Bengaluru – 560067",
    lat: 12.9654,
    lng: 77.7503,
    rent: 10500,
    rating: 4.3,
    reviewCount: 109,
    verification: "trusted" as VerificationLevel,
    images: [pgImg2, pgImg4, pgImg3],
    about:
      "HelloWorld Living is built for the modern developer — blazing fast Wi-Fi, 24/7 power backup, and a hacker lounge for late-night builds. Located minutes from major IT parks in Whitefield.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "snow-outline", label: "AC" },
      { icon: "restaurant-outline", label: "Food" },
      { icon: "car-outline", label: "Parking" },
      { icon: "shield-checkmark-outline", label: "Security" },
      { icon: "videocam-outline", label: "CCTV" },
    ],
    roomTypes: [
      { type: "Single", price: 10500 },
      { type: "Double", price: 8500 },
    ],
    host: { name: "Rohan Joshi", phone: "+919812334455", initial: "R" },
    reviews: R["t5"],
  },
  {
    id: "t6",
    name: "OYO Life BLR Residency",
    location: "Marathahalli, Bangalore",
    address: "ORR, Marathahalli, Bengaluru – 560037",
    lat: 12.9591,
    lng: 77.7011,
    rent: 7800,
    rating: 4.0,
    reviewCount: 52,
    verification: "trusted" as VerificationLevel,
    images: [pgImg3, pgImg2, pgImg6],
    about:
      "OYO Life BLR Residency offers clean, safe, and budget-friendly accommodation near Marathahalli. Ideal for students and early-career professionals who want value without compromise.",
    facilities: [
      { icon: "wifi-outline", label: "Wi-Fi" },
      { icon: "restaurant-outline", label: "Food" },
      { icon: "shirt-outline", label: "Laundry" },
      { icon: "shield-checkmark-outline", label: "Security" },
    ],
    roomTypes: [
      { type: "Single", price: 7800 },
      { type: "Double", price: 6200 },
      { type: "Triple", price: 5000 },
    ],
    host: { name: "Deepa Krishnan", phone: "+919966778899", initial: "D" },
    reviews: R["t6"],
  },
];

export function getPGById(id: string): PGDetail | undefined {
  return MOCK_PGS.find((pg) => pg.id === id);
}

export { MOCK_PGS };
