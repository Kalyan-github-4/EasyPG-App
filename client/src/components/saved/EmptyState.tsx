import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Heart, MagnifyingGlass } from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function EmptyState() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingTop: 48,
        paddingBottom: 24,
      }}
    >
      {/* Animated icon ring */}
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#DBEAFE",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Heart size={28} color="#3B82F6" weight="duotone" />
        </View>
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#0F172A",
          textAlign: "center",
          letterSpacing: -0.3,
        }}
      >
        No saved PGs yet
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 14,
          color: "#94A3B8",
          textAlign: "center",
          marginTop: 8,
          lineHeight: 21,
          maxWidth: 260,
          fontWeight: "500",
        }}
      >
        Tap the heart on any listing to save it here.{"\n"}Compare your favorites
        anytime.
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        onPress={() => router.navigate("/(app)/(tabs)")}
        activeOpacity={0.85}
        style={{ marginTop: 28 }}
      >
        <LinearGradient
          colors={["#2563EB", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderRadius: 14,
            paddingHorizontal: 24,
            paddingVertical: 14,
          }}
        >
          <MagnifyingGlass size={16} color="#fff" weight="bold" />
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
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}