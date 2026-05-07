import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ExploreFilters from "./ExploreFilters";
import type { EnrichedProperty, FilterOption } from "./types";
import type { PropertyGender, PropertyType } from "@/src/services/api";

type Props = {
  nearbyProperties: EnrichedProperty[];
  selectedProperty: EnrichedProperty | null;
  activeType: PropertyType;
  activeGender: "all" | PropertyGender;
  onTypeChange: (type: PropertyType) => void;
  onGenderChange: (gender: "all" | PropertyGender) => void;
  onSelect: (property: EnrichedProperty) => void;
  onOpenDirections: () => void;
};

const TYPE_FILTERS: FilterOption<PropertyType>[] = [
  { id: "pg", label: "PG" },
  { id: "mess", label: "Mess" },
  { id: "hostel", label: "Hostel" },
];

const GENDER_FILTERS: FilterOption<"all" | PropertyGender>[] = [
  { id: "all", label: "All" },
  { id: "girls", label: "Girls" },
  { id: "boys", label: "Boys" },
];

function getTypeLabel(type: PropertyType) {
  switch (type) {
    case "pg":
      return "PG";
    case "mess":
      return "Mess";
    case "hostel":
      return "Hostel";
    default:
      return "Stay";
  }
}

function getGenderLabel(gender: "all" | PropertyGender) {
  switch (gender) {
    case "boys":
      return "Boys";
    case "girls":
      return "Girls";
    default:
      return "All";
  }
}

function formatDistance(distanceKm?: number) {
  if (typeof distanceKm !== "number") {
    return "0.0km away";
  }

  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)}m away`
    : `${distanceKm.toFixed(1)}km away`;
}

function NearbyPropertyCard({
  property,
  selected,
  onPress,
}: {
  property: EnrichedProperty;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="flex-row items-center justify-between rounded-[14px] border bg-white px-3 py-2.5"
      style={{
        borderColor: selected ? "#2563EB" : "#E2E8F0",
        backgroundColor: selected ? "#F8FBFF" : "#fff",
      }}
    >
      <View className="flex-1 pr-2.5">
        <Text className="text-sm font-extrabold text-slate-900" numberOfLines={1}>
          {property.name}
        </Text>
        <Text className="mt-0.5 text-[11px] text-slate-500" numberOfLines={1}>
          {getTypeLabel(property.propertyType)} • {getGenderLabel(property.gender)}
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-[15px] font-black text-slate-900">
          ₹{property.rent.toLocaleString("en-IN")}
        </Text>
        <Text className="mt-0.5 text-[11px] font-semibold text-blue-600">
          {formatDistance(property.distanceKm)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NearbyPropertySheet({
  nearbyProperties,
  selectedProperty,
  activeType,
  activeGender,
  onTypeChange,
  onGenderChange,
  onSelect,
  onOpenDirections,
}: Props) {
  return (
    <View
      className="absolute left-3 right-3 bottom-3 rounded-[20px] bg-white p-3"
      style={{
        maxHeight: 290,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 12,
      }}
    >
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xl font-extrabold tracking-[-0.3px] text-slate-900">Near you</Text>
          <Text className="mt-1 text-xs text-slate-500">
            {nearbyProperties.length} stays matching your filters
          </Text>
        </View>

        <View className="rounded-full bg-blue-50 px-2.5 py-1.5">
          <Text className="text-[11px] font-extrabold text-blue-600">{activeType.toUpperCase()}</Text>
        </View>
      </View>

      <ExploreFilters
        activeType={activeType}
        activeGender={activeGender}
        typeFilters={TYPE_FILTERS}
        genderFilters={GENDER_FILTERS}
        onTypeChange={onTypeChange}
        onGenderChange={onGenderChange}
      />

      <ScrollView
        className="mt-3"
        contentContainerStyle={{ gap: 8 }}
        style={{ maxHeight: 132 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {nearbyProperties.map((property) => {
          const selected = selectedProperty?.id === property.id;

          return (
            <NearbyPropertyCard
              key={property.id}
              property={property}
              selected={selected}
              onPress={() => onSelect(property)}
            />
          );
        })}
      </ScrollView>

      {selectedProperty ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onOpenDirections}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5"
        >
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text className="flex-1 text-[13px] font-extrabold text-white" numberOfLines={1}>
            Navigate to {selectedProperty.name}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
