import React from "react";
import { View, Text } from "react-native";
import type { PaymentStatus } from "@/src/data/mock-tenants";
import { PAYMENT_STYLE } from "./statusStyles";

type Props = {
  status: PaymentStatus;
  size?: "sm" | "md";
};

export default function PaymentStatusPill({ status, size = "sm" }: Props) {
  const s = PAYMENT_STYLE[status];
  const md = size === "md";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: md ? 6 : 5,
        backgroundColor: s.bg,
        paddingHorizontal: md ? 10 : 8,
        paddingVertical: md ? 5 : 3,
        borderRadius: 8,
      }}
    >
      <View
        style={{
          width: md ? 7 : 6,
          height: md ? 7 : 6,
          borderRadius: 4,
          backgroundColor: s.dot,
        }}
      />
      <Text
        style={{
          fontSize: md ? 12 : 11,
          fontWeight: "700",
          color: s.fg,
        }}
      >
        {s.label}
      </Text>
    </View>
  );
}
