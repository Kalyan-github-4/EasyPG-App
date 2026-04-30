import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { HouseIcon, PhoneIcon } from "phosphor-react-native";
import type { Property } from "@/src/services/api";
import PropertyDetailSection from "./PropertyDetailSection";

type Props = {
  property: Property;
  isHostOfThis: boolean;
  onCall: () => void;
};

export default function PropertyHostCard({
  property,
  isHostOfThis,
  onCall,
}: Props) {
  return (
    <PropertyDetailSection title="Listed by">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#E2E8F0",
          padding: 14,
          borderRadius: 16,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#2563EB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HouseIcon size={22} color="#fff" weight="fill" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
            {property.host?.name || "Property Host"}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
            {property.host?.phone
              ? "Call, message, or request a visit"
              : "Message or request a visit to get in touch"}
          </Text>
        </View>
        {property.host?.phone && !isHostOfThis ? (
          <TouchableOpacity
            onPress={onCall}
            activeOpacity={0.85}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#ECFDF5",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#A7F3D0",
            }}
          >
            <PhoneIcon size={18} color="#059669" weight="fill" />
          </TouchableOpacity>
        ) : null}
      </View>
    </PropertyDetailSection>
  );
}
