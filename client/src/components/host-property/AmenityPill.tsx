import React from "react";
import { View, Text } from "react-native";
import type { FacilityType } from "@/src/services/api";
import { FACILITY_META } from "@/src/components/add-property/types";

type Props = {
  facility: FacilityType;
};

export default function AmenityPill({ facility }: Props) {
  const meta = FACILITY_META.find((m) => m.type === facility);
  if (!meta) return null;

  const { Icon, label } = meta;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: "#F1F5F9",
      }}
    >
      <Icon size={14} color="#0F172A" weight="regular" />
      <Text style={{ fontSize: 12, fontWeight: "600", color: "#0F172A" }}>
        {label}
      </Text>
    </View>
  );
}
