import React from "react";
import { View } from "react-native";
import Skeleton from "@/src/components/ui/Skeleton";

export default function ListingCardSkeleton() {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 14,
        backgroundColor: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F1F5F9",
      }}
    >
      <View style={{ width: "100%", aspectRatio: 16 / 9 }}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </View>
      <View style={{ padding: 14 }}>
        <Skeleton width="70%" height={16} />
        <View style={{ height: 6 }} />
        <Skeleton width="50%" height={12} />
        <View
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton width={110} height={18} />
          <Skeleton width={56} height={11} />
        </View>
      </View>
    </View>
  );
}

export function ListingListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </View>
  );
}
