import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const CARD_WIDTH = width * 0.72;
export const TRENDING_CARD_WIDTH = width - 48;

export const LOCALITIES = [
  { id: "hsr", name: "HSR Layout" },
  { id: "koramangala", name: "Koramangala" },
  { id: "indiranagar", name: "Indiranagar" },
  { id: "whitefield", name: "Whitefield" },
  { id: "btm", name: "BTM Layout" },
  { id: "marathahalli", name: "Marathahalli" },
  { id: "electronic-city", name: "Electronic City" },
  { id: "jp-nagar", name: "JP Nagar" },
  { id: "bellandur", name: "Bellandur" },
  { id: "sarjapur", name: "Sarjapur Road" },
  { id: "hebbal", name: "Hebbal" },
  { id: "yeshwanthpur", name: "Yeshwanthpur" },
];

export const AMENITY_OPTIONS = [
  { id: "wifi", label: "WiFi", icon: "wifi-outline" },
  { id: "ac", label: "AC", icon: "snow-outline" },
  { id: "food", label: "Food", icon: "restaurant-outline" },
  { id: "laundry", label: "Laundry", icon: "shirt-outline" },
  { id: "parking", label: "Parking", icon: "car-outline" },
  { id: "security", label: "Security", icon: "shield-checkmark-outline" },
  { id: "cctv", label: "CCTV", icon: "videocam-outline" },
  { id: "gym", label: "Gym", icon: "fitness-outline" },
];

export const BUDGET_RANGES = [
  { id: "3-6", label: "₹3–6k", min: 3000, max: 6000 },
  { id: "6-9", label: "₹6–9k", min: 6000, max: 9000 },
  { id: "9-12", label: "₹9–12k", min: 9000, max: 12000 },
  { id: "12+", label: "₹12k+", min: 12000, max: Infinity },
];

export const CITIES = [
  {
    id: "1",
    name: "Jhargram",
    image: { uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvd32NVW-vR1XKiBlyi6GMWh2DRgNgIVr1iQ&s" },
  },
  {
    id: "2",
    name: "Medinipur",
    image: { uri: "https://cdn.s3waas.gov.in/s319ca14e7ea6328a42e0eb13d585e4c22/uploads/bfi_thumb/2022113037-1-pygwi3cupdx024gkzqfb79kdb5nrrtlcyjedyui0o0.jpg" },
  },
  {
    id: "3",
    name: "Kharagpur",
    image: { uri: "https://images.unsplash.com/photo-1620496009285-ac853df7b9b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2hhcmFncHVyfGVufDB8fDB8fHww" },
  },
  {
    id: "4",
    name: "Hyderabad",
    image: { uri: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=200&q=80" },
  },
  {
    id: "5",
    name: "Chennai",
    image: { uri: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=200&q=80" },
  },
];