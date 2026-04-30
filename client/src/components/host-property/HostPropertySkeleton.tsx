import React from "react";
import { View } from "react-native";
import Skeleton from "@/src/components/ui/Skeleton";

export default function HostPropertySkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Hero */}
      <View style={{ width: "100%", height: 280 }}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </View>

      {/* Title */}
      <View style={{ paddingHorizontal: 20, paddingTop: 18, gap: 8 }}>
        <Skeleton width="70%" height={22} />
        <Skeleton width="50%" height={13} />
      </View>

      {/* Stat row */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 20,
          marginTop: 18,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#F1F5F9",
              padding: 14,
              gap: 8,
            }}
          >
            <Skeleton width={28} height={28} borderRadius={8} />
            <Skeleton width="60%" height={16} />
            <Skeleton width="80%" height={11} />
          </View>
        ))}
      </View>

      {/* Manage section */}
      <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 10 }}>
        <Skeleton width={90} height={13} />
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#F1F5F9",
            padding: 16,
            gap: 16,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Skeleton width={40} height={40} borderRadius={10} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="55%" height={13} />
                <Skeleton width="75%" height={11} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
