import React from "react";
import { View, Text } from "react-native";
import { Heart } from "phosphor-react-native";

type Props = {
  count: number;
};

export default function SavedHeader({ count }: Props) {
  return (
    <View
      style={{
        marginHorizontal: -20,
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 22,
        marginBottom: 18,
      }}
    >
      {/* Subtitle */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: "#6B7280",
          letterSpacing: 0.3,
        }}
      >
        Your collection
      </Text>

      {/* Title row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: "#111827",
            letterSpacing: -0.5,
          }}
        >
          Saved PGs
        </Text>

        {/* Count badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#EFF6FF",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 7,
          }}
        >
          <Heart size={14} color="#2563EB" weight="fill" />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: "#2563EB",
            }}
          >
            {count}
          </Text>
        </View>
      </View>
    </View>
  );
}