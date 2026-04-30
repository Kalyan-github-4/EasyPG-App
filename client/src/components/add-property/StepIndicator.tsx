import React from "react";
import { View, Text } from "react-native";
import { STEPS } from "./types";

type Props = {
  current: number;
};

export default function StepIndicator({ current }: Props) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A" }}>
          Step {current + 1} of {STEPS.length}
        </Text>
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748B" }}>
          {STEPS[current]}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 4,
          height: 4,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: i <= current ? "#2563EB" : "#E2E8F0",
              borderRadius: 2,
            }}
          />
        ))}
      </View>
    </View>
  );
}
