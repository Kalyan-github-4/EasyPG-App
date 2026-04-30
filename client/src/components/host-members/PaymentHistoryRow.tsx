import React from "react";
import { View, Text } from "react-native";
import type { PaymentRecord } from "@/src/data/mock-tenants";
import PaymentStatusPill from "./PaymentStatusPill";

type Props = {
  record: PaymentRecord;
};

export default function PaymentHistoryRow({ record }: Props) {
  const paidOn = record.paidOn
    ? new Date(record.paidOn).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 13,
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}
        >
          {record.month}
        </Text>
        <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
          ₹{record.amount.toLocaleString("en-IN")}
          {paidOn ? ` · paid on ${paidOn}` : ""}
        </Text>
      </View>
      <PaymentStatusPill status={record.status} />
    </View>
  );
}
