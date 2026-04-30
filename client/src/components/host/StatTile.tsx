import React from "react";
import { View, Text } from "react-native";
import type { ComponentType } from "react";

type PhosphorIcon = ComponentType<{
  size?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}>;

type Props = {
  Icon: PhosphorIcon;
  value: string | number;
  label: string;
  tint?: string;
};

export default function StatTile({ Icon, value, label, tint = "#2563EB" }: Props) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#F1F5F9",
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: `${tint}15`,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Icon size={18} color={tint} weight="fill" />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: "#0F172A",
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600", marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
