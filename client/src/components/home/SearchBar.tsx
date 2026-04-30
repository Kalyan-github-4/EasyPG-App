import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MagnifyingGlass, SlidersHorizontal } from "phosphor-react-native";

type Props = {
  onPress: () => void;
  onFilterPress: () => void;
  activeFilterCount: number;
  placeholder?: string;
};

export default function SearchBar({
  onPress,
  onFilterPress,
  activeFilterCount,
  placeholder = "Try 'PG at Jhargram' or 'PG near me'",
}: Props) {
  const hasFilters = activeFilterCount > 0;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 18,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 6,
        shadowColor: "#1e3a8a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <MagnifyingGlass size={18} color="#2563EB" weight="bold" />
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={{
          flex: 1,
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#94A3B8",
          }}
        >
          {placeholder}
        </Text>
      </TouchableOpacity>

      {/* Filter button with badge */}
      <TouchableOpacity
        onPress={onFilterPress}
        activeOpacity={0.85}
        style={{
          backgroundColor: "#2563EB",
          padding: 9,
          borderRadius: 13,
          position: "relative",
        }}
      >
        <SlidersHorizontal size={17} color="#fff" weight="bold" />

        {hasFilters && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "#FACC15",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "#fff",
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#0F172A" }}>
              {activeFilterCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
