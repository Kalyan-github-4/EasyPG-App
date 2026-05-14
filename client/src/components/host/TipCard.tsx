import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function TipCard({
  Icon,
  title,
  body,
  gradient,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  title: string;
  body: string;
  gradient: readonly [string, string, ...string[]];
}) {
  return (
    <View style={{ width: 230, borderRadius: 20, overflow: "hidden", height: "100%" }}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18, flex: 1 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.22)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <Icon size={20} color="#fff" weight="fill" />
        </View>
        <Text style={{ fontSize: 15, fontWeight: "800", color: "#fff", marginBottom: 6, letterSpacing: -0.2 }}>{title}</Text>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.88)", lineHeight: 17 }}>{body}</Text>
      </LinearGradient>
    </View>
  );
}
