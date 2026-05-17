import React from "react";
import { WifiHigh, Snowflake, ForkKnife, TShirt, Car, ShieldCheck, VideoCamera, Barbell } from "phosphor-react-native";

export type PhosphorIcon = React.ComponentType<{
  size?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

export type SortKey = "recent" | "price-low" | "price-high" | "rating";

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
