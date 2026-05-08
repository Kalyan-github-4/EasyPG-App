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
      <View className="flex-row flex-wrap gap-2.5">
        {facilities.map((facility) => {
          const meta = FACILITY_META.find((m) => m.type === facility as FacilityType);
          if (!meta) return null;
          const { Icon, label } = meta;
          return (
            <View
              key={facility}
              className="flex-row items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-lg"
            >
              <Icon size={15} color="#2563EB" weight="regular" />
              <Text className="text-[13px] font-semibold text-slate-700">
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </PropertyDetailSection>
  );
}