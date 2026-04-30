import React from "react";
import { View, Image, Text, Dimensions } from "react-native";
import { ImageSquare } from "phosphor-react-native";
import type { PropertyPhoto } from "@/src/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 8;
const HORIZONTAL_PADDING = 20;
const COLS = 3;
const TILE = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP * (COLS - 1)) / COLS
);

type Props = {
  photos: PropertyPhoto[];
};

export default function PhotoGrid({ photos }: Props) {
  if (photos.length === 0) {
    return (
      <View
        style={{
          backgroundColor: "#F8FAFC",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#F1F5F9",
          paddingVertical: 24,
          alignItems: "center",
        }}
      >
        <ImageSquare size={22} color="#94A3B8" />
        <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>
          No photos uploaded
        </Text>
      </View>
    );
  }

  const sorted = [...photos].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: GAP,
      }}
    >
      {sorted.map((p, idx) => (
        <View
          key={p.id}
          style={{
            width: TILE,
            height: TILE,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#E2E8F0",
          }}
        >
          <Image source={{ uri: p.url }} style={{ width: "100%", height: "100%" }} />
          {idx === 0 ? (
            <View
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                backgroundColor: "rgba(0,0,0,0.65)",
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>
                COVER
              </Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
