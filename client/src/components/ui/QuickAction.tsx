import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

export default function QuickAction({
  icon,
  label,
  bg,
  badge,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        alignItems: "center",
        width: 80,
        gap: 8,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {icon}
        {badge ? (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 5,
              borderRadius: 9,
              backgroundColor: "#EF4444",
              borderWidth: 2,
              borderColor: "#F8FAFC",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#fff" }}>
              {badge > 9 ? "9+" : badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: "#334155",
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
