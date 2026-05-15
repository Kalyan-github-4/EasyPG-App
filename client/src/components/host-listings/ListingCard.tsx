import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MapPin, DotsThreeVertical, ImageSquare } from "phosphor-react-native";
import type { Property } from "@/src/services/api";

type Props = {
  property: Property;
  onPress: () => void;
  onMore?: () => void;
};

export default function ListingCard({ property, onPress, onMore }: Props) {
  const cover = property.photos?.[0]?.url;
  const rent = property.rent.toLocaleString("en-IN");
  const photoCount = property.photos?.length ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        marginHorizontal: 20,
        marginBottom: 14,
        backgroundColor: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F1F5F9",
      }}
    >
      {/* Cover */}
      <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#E2E8F0" }}>
        {cover ? (
          <Image source={{ uri: cover }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ImageSquare size={28} color="#94A3B8" />
          </View>
        )}

        {/* Status badge */}
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: property.isAvailable ? "#10B981" : "#64748B",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 7,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#fff",
            }}
          />
          <Text
            style={{
              fontSize: 10,
              fontWeight: "800",
              color: "#fff",
              letterSpacing: 0.5,
            }}
          >
            {property.isAvailable ? "AVAILABLE" : "FULL"}
          </Text>
        </View>

        {/* Photo count */}
        {photoCount > 0 ? (
          <View
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(0,0,0,0.55)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <ImageSquare size={11} color="#fff" weight="fill" />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>
              {photoCount}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Body */}
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: "#0F172A",
                marginBottom: 4,
                letterSpacing: -0.2,
              }}
            >
              {property.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MapPin size={12} color="#94A3B8" weight="fill" />
              <Text
                numberOfLines={1}
                style={{ flex: 1, fontSize: 12, color: "#64748B" }}
              >
                {property.location}
              </Text>
            </View>
          </View>

          {onMore ? (
            <TouchableOpacity
              onPress={onMore}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F8FAFC",
              }}
            >
              <DotsThreeVertical size={16} color="#64748B" weight="bold" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Rent */}
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#2563EB" }}>
              ₹{rent}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8" }}>
              / month
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#2563EB" }}>
            Manage
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
