import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function BecomeHostCTA({
  title,
  subtitle,
  buttonLabel,
  iconName = "home",
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{ marginHorizontal: 20, marginTop: 16 }}
    >
      <LinearGradient
        colors={["#2563EB", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 18,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={iconName} size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 2,
            }}
          >
            {title}
          </Text>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            {subtitle}
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: "800", color: "#fff" }}>
          {buttonLabel}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
