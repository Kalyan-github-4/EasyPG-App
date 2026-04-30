import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CARD_WIDTH } from "@/src/data/constants";
import { PGListing } from "@/src/data/pgData";
import VerificationBadge from "./VerificationBadge";

type Props = {
  pg: PGListing;
  saved: boolean;
  onSave: () => void;
};

export default function FeaturedCard({ pg, saved, onSave }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={() => router.push({ pathname: "/(app)/pg/[id]", params: { id: pg.id } })}
      style={{
        width: CARD_WIDTH,
        height: 220,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#1e3a8a",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      }}
    >
      <Image source={pg.image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />

      {/* Badge + Save row */}
      <View style={{
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <VerificationBadge level={pg.verification} />

        <TouchableOpacity
          onPress={onSave}
          style={{
            padding: 8,
            backgroundColor: saved ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.35)",
            borderRadius: 20,
          }}
        >
          <Ionicons name={saved ? "heart" : "heart-outline"} size={16} color={saved ? "#EF4444" : "#fff"} />
        </TouchableOpacity>
      </View>

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.82)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 14,
          paddingTop: 48,
          paddingBottom: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800", flexShrink: 1 }} numberOfLines={1}>
            {pg.name}
          </Text>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            backgroundColor: "rgba(0,0,0,0.38)",
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}>
            <Ionicons name="star" size={10} color="#FACC15" />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>{pg.rating}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1, marginRight: 8 }}>
            <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.65)" />
            <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: "500" }} numberOfLines={1}>
              {pg.location}
            </Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>
            ₹{pg.rent.toLocaleString("en-IN")}
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "400" }}>/mo</Text>
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
