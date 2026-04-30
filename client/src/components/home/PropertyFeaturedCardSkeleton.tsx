import React from "react";
import { View } from "react-native";
import Skeleton from "@/src/components/ui/Skeleton";
import { CARD_WIDTH } from "@/src/data/constants";

export default function PropertyFeaturedCardSkeleton() {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: 220,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#E2E8F0",
      }}
    >
      <Skeleton width="100%" height="100%" borderRadius={20} />
      <View
        style={{
          position: "absolute",
          top: 12,
          left: 12,
        }}
      >
        <Skeleton width={62} height={18} borderRadius={8} color="#CBD5E1" />
      </View>
      <View
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          gap: 6,
        }}
      >
        <Skeleton width="65%" height={14} borderRadius={6} color="#CBD5E1" />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton width="45%" height={10} borderRadius={4} color="#CBD5E1" />
          <Skeleton width={70} height={14} borderRadius={6} color="#CBD5E1" />
        </View>
      </View>
    </View>
  );
}

export function PropertyFeaturedRailSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 24,
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PropertyFeaturedCardSkeleton key={i} />
      ))}
    </View>
  );
}
