import React from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PGDetail } from "@/src/data/mock-pgs";
import VerificationBadge from "./VerificationBadge";

type Props = {
  pg: PGDetail;
};

export default function ListingCard({ pg }: Props) {
  const handleCall = () => Linking.openURL(`tel:${pg.host.phone}`);

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={() => router.push({ pathname: "/(app)/pg/[id]", params: { id: pg.id } })}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        shadowColor: "#1e3a8a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* ── Image ── */}
      <View style={{ height: 180 }}>
        <Image
          source={pg.images[0]}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />

        {/* Bottom gradient */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.65)"]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70 }}
        />

        {/* Verification badge */}
        <View style={{ position: "absolute", top: 12, left: 12 }}>
          <VerificationBadge level={pg.verification} />
        </View>

        {/* Price overlay */}
        <View style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          backgroundColor: "rgba(0,0,0,0.55)",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#fff" }}>
            ₹{pg.rent.toLocaleString("en-IN")}
          </Text>
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: -1 }}>per month</Text>
        </View>
      </View>

      {/* ── Content ── */}
      <View style={{ padding: 16 }}>
        {/* Name + location */}
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3, marginBottom: 4 }} numberOfLines={1}>
          {pg.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <Ionicons name="location-outline" size={13} color="#94A3B8" />
          <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "500", flex: 1 }} numberOfLines={1}>
            {pg.location}
          </Text>
        </View>

        {/* Rating + facilities */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          marginBottom: 14,
        }}>
          {/* Stars */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ flexDirection: "row", gap: 2 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={s <= Math.round(pg.rating) ? "star" : "star-outline"}
                  size={13}
                  color="#FACC15"
                />
              ))}
            </View>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A" }}>{pg.rating.toFixed(1)}</Text>
            <Text style={{ fontSize: 11, color: "#94A3B8" }}>({pg.reviewCount})</Text>
          </View>

          {/* Top 3 facility icons */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {pg.facilities.slice(0, 3).map((f) => (
              <View key={f.label} style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: "#EFF6FF",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Ionicons name={f.icon as any} size={13} color="#2563EB" />
              </View>
            ))}
            {pg.facilities.length > 3 && (
              <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>
                +{pg.facilities.length - 3}
              </Text>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/(app)/pg/[id]", params: { id: pg.id } })}
            style={{
              flex: 1,
              backgroundColor: "#2563EB",
              borderRadius: 12,
              paddingVertical: 11,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff", letterSpacing: 0.2 }}>
              View Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCall}
            style={{
              width: 44,
              borderRadius: 12,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="call-outline" size={18} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 44,
              borderRadius: 12,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="bookmark-outline" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
