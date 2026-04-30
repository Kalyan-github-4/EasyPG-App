import React from "react";
import { SortKey } from "./types";
import { View, Text } from "react-native";
import SortPill from "./SortPill";

type Props = {
  count: number;
  priceRange: string;
  sortBy: SortKey;
  setSortBy: (k: SortKey) => void;
  showSort: boolean;
};

export default function SavedHeader({
  count,
  priceRange,
  sortBy,
  setSortBy,
  showSort,
}: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        zIndex: 20,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 }}>
          Saved
        </Text>
        <Text style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>
          {count} PG{count !== 1 ? "s" : ""}
          {priceRange ? ` · ${priceRange}` : ""}
        </Text>
      </View>

      {showSort && <SortPill sortBy={sortBy} onChange={setSortBy} />}
    </View>
  );
}