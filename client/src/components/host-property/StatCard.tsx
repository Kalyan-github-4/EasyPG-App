import React from "react";
import { View, Text } from "react-native";

type Props = {
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  iconColor?: string;
  label: string;
  value: string;
};

export default function StatCard({
  Icon,
  iconColor = "#2563EB",
  label,
  value,
}: Props) {
  return (
    <View
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
      <Icon size={18} color={iconColor} weight="fill" />
      <View>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "800",
            color: "#0F172A",
            letterSpacing: -0.3,
          }}
        >
          {value}
        </Text>
        <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
          {label}
        </Text>
      </View>
    </View>
  );
}
