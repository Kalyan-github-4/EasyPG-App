import React from "react";
import { View, Text } from "react-native";
import type { FacilityType, Property } from "@/src/services/api";
import { FACILITY_META } from "@/src/components/add-property/types";
import PropertyDetailSection from "./PropertyDetailSection";

type Props = {
  facilities: Property["facilities"];
};

export default function PropertyFacilitiesSection({ facilities }: Props) {
  if (facilities.length === 0) return null;

  return (
    <PropertyDetailSection title="What's included">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {facilities.map((facility) => {
          const meta = FACILITY_META.find((m) => m.type === facility as FacilityType);
          if (!meta) return null;
          const { Icon, label } = meta;
          return (
            <View
              key={facility}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              <Icon size={15} color="#2563EB" weight="regular" />
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </PropertyDetailSection>
  );
}
