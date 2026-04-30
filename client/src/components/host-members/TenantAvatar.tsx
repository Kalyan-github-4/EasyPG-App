import React from "react";
import { View, Text } from "react-native";

type Props = {
  initial: string;
  size?: number;
  tone?: "blue" | "purple" | "amber" | "green" | "rose";
};

const TONES: Record<NonNullable<Props["tone"]>, { bg: string; fg: string }> = {
  blue: { bg: "#EFF6FF", fg: "#2563EB" },
  purple: { bg: "#F5F3FF", fg: "#7C3AED" },
  amber: { bg: "#FFFBEB", fg: "#B45309" },
  green: { bg: "#ECFDF5", fg: "#047857" },
  rose: { bg: "#FFF1F2", fg: "#BE123C" },
};

export default function TenantAvatar({
  initial,
  size = 44,
  tone = "blue",
}: Props) {
  const { bg, fg } = TONES[tone];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: Math.round(size * 0.42),
          fontWeight: "800",
          color: fg,
        }}
      >
        {initial}
      </Text>
    </View>
  );
}

export function toneFromInitial(initial: string): NonNullable<Props["tone"]> {
  const tones: Array<NonNullable<Props["tone"]>> = [
    "blue",
    "purple",
    "amber",
    "green",
    "rose",
  ];
  const idx = (initial.toUpperCase().charCodeAt(0) || 0) % tones.length;
  return tones[idx];
}
