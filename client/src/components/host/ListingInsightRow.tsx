import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import * as api from "@/src/services/api";
import { House, MapPin, Camera } from "phosphor-react-native";

export default function ListingInsightRow({
  property,
  onPress,
}: {
  property: api.Property;
  onPress: () => void;
}) {
  const photoCount = property.photos.length;
  const hasIssues = !property.isAvailable || photoCount === 0;
  const statusColor = property.isAvailable ? "#10B981" : "#EF4444";
  const statusLabel = property.isAvailable ? "Active" : "Inactive";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        gap: 12,
        borderWidth: 1,
        borderColor: hasIssues ? "#FEE2E2" : "#F1F5F9",
      }}
    >
      {property.photos?.length > 0 ? (
        <Image
          source={{ uri: property.photos?.[0]?.url }}
          style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "#E2E8F0" }}
        />
      ) : (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <House size={22} color="#94A3B8" weight="duotone" />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: "#0F172A", letterSpacing: -0.2 }}>
          {property.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
          <MapPin size={11} color="#94A3B8" weight="fill" />
          <Text numberOfLines={1} style={{ fontSize: 11, color: "#64748B", flex: 1 }}>
            {property.location}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 5 }}>
          {photoCount === 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                backgroundColor: "#FEF3C7",
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Camera size={10} color="#D97706" weight="fill" />
              <Text style={{ fontSize: 9, fontWeight: "700", color: "#D97706" }}>No photos</Text>
            </View>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              backgroundColor: property.isAvailable ? "#ECFDF5" : "#FEF2F2",
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
            <Text style={{ fontSize: 9, fontWeight: "700", color: statusColor }}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
          ₹{property.rent.toLocaleString("en-IN")}
        </Text>
        <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>/month</Text>
      </View>
    </TouchableOpacity>
  );
}
