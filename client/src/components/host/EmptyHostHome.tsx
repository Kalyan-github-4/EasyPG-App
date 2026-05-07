import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { House, ArrowRight, Camera, Sparkle } from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  onOpenListings: () => void;
};

const BENEFITS = [
  { Icon: Camera, text: "Upload photos in minutes" },
  { Icon: Sparkle, text: "Start receiving inquiries today" },
];

export default function EmptyHostHome({ onOpenListings }: Props) {
  return (
    <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
      {/* Hero card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#F1F5F9",
        }}
      >
        <LinearGradient
          colors={["#EFF6FF", "#DBEAFE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 32,
            paddingBottom: 28,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: 24,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
              shadowColor: "#2563EB",
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            <House size={36} color="#2563EB" weight="fill" />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#0F172A",
              textAlign: "center",
              letterSpacing: -0.4,
              paddingHorizontal: 24,
              marginBottom: 8,
            }}
          >
            List your first PG in minutes
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#475569",
              textAlign: "center",
              lineHeight: 19,
              paddingHorizontal: 32,
            }}
          >
            Reach thousands of guests looking for their next home.
          </Text>
        </LinearGradient>

        {/* Benefits strip */}
        <View style={{ padding: 20, gap: 12 }}>
          {BENEFITS.map((b, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: "#EFF6FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <b.Icon size={16} color="#2563EB" weight="fill" />
              </View>
              <Text style={{ fontSize: 13, color: "#334155", fontWeight: "600" }}>
                {b.text}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={onOpenListings}
            activeOpacity={0.9}
            style={{
              marginTop: 10,
              backgroundColor: "#0F172A",
              paddingVertical: 14,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Open listings
            </Text>
            <ArrowRight size={18} color="#fff" weight="bold" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
