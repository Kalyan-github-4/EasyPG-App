import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Heart,
  Star,
  MapPin,
  CaretRight,
  GenderFemale,
  GenderMale,
  UsersThree,
} from "phosphor-react-native";
import { router } from "expo-router";
import { PGListing } from "@/src/data/pgData";
import VerificationBadge from "@/src/components/home/VerificationBadge";
import { AMENITY_ICONS } from "./types";

type Props = {
  pg: PGListing;
  onRemove: () => void;
};

export default function SavedPGCard({ pg, onRemove }: Props) {
  const genderTheme =
    pg.gender === "girls"
      ? { bg: "#FDF2F8", fg: "#EC4899", Icon: GenderFemale, label: "Girls" }
      : pg.gender === "boys"
      ? { bg: "#EFF6FF", fg: "#3B82F6", Icon: GenderMale, label: "Boys" }
      : { bg: "#F0FDF4", fg: "#10B981", Icon: UsersThree, label: "Co-ed" };
  const GenderIcon = genderTheme.Icon;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push({ pathname: "/(app)/pg/[id]", params: { id: pg.id } })}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 14,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Image */}
      <View style={{ height: 180 }}>
        <Image source={pg.image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />

        {/* Top overlay row */}
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <VerificationBadge level={pg.verification} />
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={8}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.95)",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Heart size={18} color="#EF4444" weight="fill" />
          </TouchableOpacity>
        </View>

        {/* Bottom gradient */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.75)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 14,
            paddingBottom: 12,
            paddingTop: 50,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(0,0,0,0.4)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Star size={11} color="#FACC15" weight="fill" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>{pg.rating}</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>({pg.reviewCount})</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff" }}>
            ₹{pg.rent.toLocaleString("en-IN")}
            <Text style={{ fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>/mo</Text>
          </Text>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Text
            style={{ fontSize: 16, fontWeight: "800", color: "#0F172A", flex: 1, letterSpacing: -0.3 }}
            numberOfLines={1}
          >
            {pg.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: genderTheme.bg,
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <GenderIcon size={11} color={genderTheme.fg} weight="bold" />
            <Text style={{ fontSize: 10, fontWeight: "700", color: genderTheme.fg }}>
              {genderTheme.label}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
          <MapPin size={12} color="#94A3B8" weight="regular" />
          <Text
            style={{ fontSize: 12, color: "#64748B", fontWeight: "500", flex: 1 }}
            numberOfLines={1}
          >
            {pg.location}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
          }}
        >
          {pg.amenities.slice(0, 5).map((a) => {
            const AmenityIcon = AMENITY_ICONS[a];
            if (!AmenityIcon) return null;
            return (
              <View
                key={a}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  backgroundColor: "#F8FAFC",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AmenityIcon size={14} color="#64748B" weight="regular" />
              </View>
            );
          })}
          {pg.amenities.length > 5 && (
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#94A3B8", marginLeft: 2 }}>
              +{pg.amenities.length - 5}
            </Text>
          )}
          <View style={{ flex: 1 }} />
          <CaretRight size={18} color="#CBD5E1" weight="bold" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
