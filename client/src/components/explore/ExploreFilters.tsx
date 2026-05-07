import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import type { FilterOption } from "./types";
import type { PropertyGender, PropertyType } from "@/src/services/api";

type Props = {
  activeType: PropertyType;
  activeGender: "all" | PropertyGender;
  typeFilters: FilterOption<PropertyType>[];
  genderFilters: FilterOption<"all" | PropertyGender>[];
  onTypeChange: (type: PropertyType) => void;
  onGenderChange: (gender: "all" | PropertyGender) => void;
};

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 items-center rounded-xl border bg-white py-2.5"
      style={{
        borderColor: active ? "#2563EB" : "#E2E8F0",
        backgroundColor: active ? "#EFF6FF" : "#fff",
      }}
    >
      <Text
        className="text-xs font-bold"
        style={{ color: active ? "#2563EB" : "#64748B" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ExploreFilters({
  activeType,
  activeGender,
  typeFilters,
  genderFilters,
  onTypeChange,
  onGenderChange,
}: Props) {
  return (
    <View className="gap-2.5">
      <View className="flex-row gap-2">
        {typeFilters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            active={activeType === filter.id}
            onPress={() => onTypeChange(filter.id)}
          />
        ))}
      </View>

      <View className="flex-row gap-2">
        {genderFilters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            active={activeGender === filter.id}
            onPress={() => onGenderChange(filter.id)}
          />
        ))}
      </View>
    </View>
  );
}
