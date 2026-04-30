import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  return (
    <LinearGradient colors={["#0F0F1A", "#1A1A2E", "#16213E"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#FFFFFF",
              marginBottom: 8,
            }}
          >
            Search
          </Text>
          <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.5)" }}>
            Find your perfect PG accommodation
          </Text>
        </View>

        {/* Placeholder */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
        >
          <Ionicons name="search" size={48} color="rgba(255,255,255,0.12)" />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "rgba(255,255,255,0.25)",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Search & Filter
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.15)",
              marginTop: 6,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Search by location, price, amenities and more.{"\n"}Coming in Phase 4!
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
