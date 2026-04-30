import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type ListingFilter = "all" | "available" | "full";

type Props = {
  value: ListingFilter;
  onChange: (v: ListingFilter) => void;
  counts: { all: number; available: number; full: number };
};

const OPTIONS: { key: ListingFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "full", label: "Full" },
];

export default function StatusFilter({ value, onChange, counts }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 12,
      }}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        const count = counts[opt.key];

        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.85}
            style={{ marginRight: 8 }}
          >
            {active ? (
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[pillStyle, { overflow: "hidden" }]}
              >
                <PillContent label={opt.label} count={count} active />
              </LinearGradient>
            ) : (
              <View style={[pillStyle, inactiveStyle]}>
                <PillContent label={opt.label} count={count} active={false} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const PillContent = ({
  label,
  count,
  active,
}: {
  label: string;
  count: number;
  active: boolean;
}) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Text
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: active ? "#fff" : "#334155",
        marginRight: 6,
      }}
    >
      {label}
    </Text>

    <View
      style={{
        minWidth: 18,
        height: 18,
        paddingHorizontal: 6,
        borderRadius: 9,
        backgroundColor: active
          ? "rgba(255,255,255,0.22)"
          : "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "800",
          color: active ? "#fff" : "#64748B",
        }}
      >
        {count}
      </Text>
    </View>
  </View>
);

const pillStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 999,

  // optional: prevents width jump between "All", "Full", "Available"
  minWidth: 70,
  justifyContent: "center" as const,
};

const inactiveStyle = {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#E2E8F0",
};