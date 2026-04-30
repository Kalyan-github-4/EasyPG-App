import React from "react";
import { View } from "react-native";
import Skeleton from "@/src/components/ui/Skeleton";

export default function ThreadRowSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
        backgroundColor: "#fff",
      }}
    >
      <Skeleton width={52} height={52} borderRadius={26} />
      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton width={140} height={14} />
          <Skeleton width={32} height={11} />
        </View>
        <Skeleton width={100} height={11} />
        <Skeleton width="85%" height={12} />
      </View>
    </View>
  );
}

export function ThreadListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i}>
          <ThreadRowSkeleton />
          <View style={{ height: 1, marginLeft: 84, backgroundColor: "#F1F5F9" }} />
        </View>
      ))}
    </View>
  );
}
