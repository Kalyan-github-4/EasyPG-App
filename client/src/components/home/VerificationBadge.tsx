import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VerificationLevel } from "@/src/data/pgData";
import { ShieldCheckIcon } from "phosphor-react-native"; 

type Props = {
  level: VerificationLevel;
  size?: "sm" | "md";
};

export default function VerificationBadge({ level, size = "sm" }: Props) {
  if (level !== "trusted") return null;

  const md = size === "md";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: md ? 5 : 4,
        backgroundColor: "#0F172A",
        borderRadius: 20,
        paddingHorizontal: md ? 10 : 8,
        paddingVertical: md ? 5 : 4,
      }}
    >
      <ShieldCheckIcon size={md ? 13 : 11} weight="fill" color="#fff" />
      <Text
        style={{
          fontSize: md ? 11 : 10,
          fontWeight: "700",
          color: "#fff",
          letterSpacing: 0.2,
        }}
      >
        EasyPG Trusted
      </Text>
    </View>
  );
}
