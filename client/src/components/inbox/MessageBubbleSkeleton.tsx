import React from "react";
import { View } from "react-native";
import Skeleton from "@/src/components/ui/Skeleton";

const ROWS: { mine: boolean; width: number }[] = [
  { mine: false, width: 180 },
  { mine: true, width: 140 },
  { mine: false, width: 220 },
  { mine: true, width: 110 },
  { mine: false, width: 160 },
];

export default function MessageThreadSkeleton() {
  return (
    <View style={{ paddingVertical: 12, gap: 10 }}>
      {ROWS.map((r, i) => (
        <View
          key={i}
          style={{
            paddingHorizontal: 14,
            alignItems: r.mine ? "flex-end" : "flex-start",
          }}
        >
          <Skeleton
            width={r.width}
            height={36}
            borderRadius={16}
            color={r.mine ? "#DBEAFE" : "#E2E8F0"}
          />
        </View>
      ))}
    </View>
  );
}
