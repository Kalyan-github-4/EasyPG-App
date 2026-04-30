import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Heart, Compass } from "phosphor-react-native";
import { router } from "expo-router";

export default function EmptyState() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
      }}
    >
      {/* Icon circle */}
      <View
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          backgroundColor: "#FEF2F2",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 22,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#FECACA",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Heart size={30} color="#EF4444" weight="regular" />
        </View>
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#0F172A",
          textAlign: "center",
        }}
      >
        No saved PGs yet
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 14,
          color: "#94A3B8",
          marginTop: 8,
          textAlign: "center",
          lineHeight: 21,
          maxWidth: 260,
        }}
      >
        Tap the heart on any PG to save it. Compare your favorites here later.
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        onPress={() => router.navigate("/(app)/(tabs)")}
        activeOpacity={0.85}
        style={{
          marginTop: 26,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#0F172A",
          borderRadius: 14,
          paddingHorizontal: 26,
          paddingVertical: 14,
        }}
      >
        <Compass size={17} color="#fff" weight="regular" />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: "#fff",
            letterSpacing: 0.2,
          }}
        >
          Explore PGs
        </Text>
      </TouchableOpacity>
    </View>
  );
}