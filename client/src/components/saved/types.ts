import React from "react";
import { Heart, Bookmark, CheckCircle, WifiHigh, Snowflake, ForkKnife, TShirt, Car, ShieldCheck, VideoCamera, Barbell,} from "phosphor-react-native";

export type PhosphorIcon = React.ComponentType<{
  size?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

export type SortKey = "recent" | "price-low" | "price-high" | "rating";

export const SORT_LABELS: Record<SortKey, string> = {
  recent: "Recently saved",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  rating: "Top Rated",
};

export type WishlistFolder = {
  id: string;
  name: string;
  Icon: PhosphorIcon;
  pgIds: string[];
};

export const AMENITY_ICONS: Record<string, PhosphorIcon> = {
  wifi: WifiHigh,
  ac: Snowflake,
  food: ForkKnife,
  laundry: TShirt,
  parking: Car,
  security: ShieldCheck,
  cctv: VideoCamera,
  gym: Barbell,
};

export const MOCK_SAVED_IDS = ["1", "2", "5", "6", "8", "12"];

export const MOCK_FOLDERS: WishlistFolder[] = [
  { id: "all", name: "All Saved", Icon: Heart, pgIds: MOCK_SAVED_IDS },
  { id: "shortlisted", name: "Shortlisted", Icon: Bookmark, pgIds: ["2", "6", "12"] },
  { id: "visited", name: "Visited", Icon: CheckCircle, pgIds: ["1", "5"] },
];
