import React from "react";
import { View, Text } from "react-native";
import { MapPinIcon } from "phosphor-react-native";
import type { Property } from "@/src/services/api";

type Props = {
  property: Property;
};

export default function PropertyDetailSummaryCard({ property }: Props) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: -24,
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        shadowColor: "#1e3a8a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: property.isAvailable ? "#ECFDF5" : "#FEF2F2",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              color: property.isAvailable ? "#10B981" : "#EF4444",
              letterSpacing: 0.3,
            }}
          >
            {property.isAvailable ? "AVAILABLE" : "FULL"}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#94A3B8",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {property.propertyType}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: "#0F172A",
          lineHeight: 28,
          marginBottom: 6,
          letterSpacing: -0.4,
        }}
      >
        {property.name}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 4 }}>
        <MapPinIcon size={14} color="#64748B" weight="fill" style={{ marginTop: 2 }} />
        <Text
          style={{
            fontSize: 13,
            color: "#64748B",
            flex: 1,
            lineHeight: 19,
          }}
        >
          {property.location}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#EFF6FF",
          borderRadius: 14,
          padding: 14,
          marginTop: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 11,
              color: "#64748B",
              fontWeight: "600",
              marginBottom: 2,
            }}
          >
            Monthly rent
          </Text>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "900",
              color: "#2563EB",
              letterSpacing: -0.5,
            }}
          >
            ₹{property.rent.toLocaleString("en-IN")}
            <Text style={{ fontSize: 13, fontWeight: "500", color: "#64748B" }}>
              /mo
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
