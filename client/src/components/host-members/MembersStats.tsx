import React from "react";
import { View, Text } from "react-native";
import type { Tenant } from "@/src/data/mock-tenants";

type Props = { tenants: Tenant[] };

export default function MembersStats({ tenants }: Props) {
  const total = tenants.length;
  const dueOrOverdue = tenants.filter(
    (t) => t.currentPayment === "due" || t.currentPayment === "overdue"
  ).length;
  const monthlyRevenue = tenants.reduce((sum, t) => sum + t.rent, 0);

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      <Stat
        value={String(total)}
        label={total === 1 ? "Tenant" : "Tenants"}
        accent="#2563EB"
      />
      <Stat
        value={String(dueOrOverdue)}
        label="Pending dues"
        accent={dueOrOverdue > 0 ? "#EF4444" : "#10B981"}
      />
      <Stat
        value={`₹${(monthlyRevenue / 1000).toFixed(1)}k`}
        label="Monthly"
        accent="#0F172A"
      />
    </View>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        paddingVertical: 12,
        paddingHorizontal: 12,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "900",
          color: accent,
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600", marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
