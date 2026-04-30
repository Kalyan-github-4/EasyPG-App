import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { FACILITY_META } from "./types";
import type { FormState, Action } from "./types";

type Props = {
  state: FormState;
  dispatch: React.Dispatch<Action>;
};

export default function StepAmenities({ state, dispatch }: Props) {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.h1}>What's included?</Text>
      <Text style={styles.sub}>
        Select all amenities available at your PG. You can add more later.
      </Text>

      <View style={styles.grid}>
        {FACILITY_META.map(({ type, label, Icon }) => {
          const active = state.facilities.includes(type);
          return (
            <TouchableOpacity
              key={type}
              onPress={() => dispatch({ type: "TOGGLE_FACILITY", value: type })}
              activeOpacity={0.8}
              style={[
                styles.tile,
                {
                  backgroundColor: active ? "#EFF6FF" : "#fff",
                  borderColor: active ? "#2563EB" : "#E2E8F0",
                },
              ]}
            >
              <Icon
                size={22}
                color={active ? "#2563EB" : "#64748B"}
                weight={active ? "fill" : "regular"}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: active ? "#1E40AF" : "#334155",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.count}>
        {state.facilities.length} selected
      </Text>
    </ScrollView>
  );
}

const styles = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: "#0F172A", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 20 },
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  tile: {
    width: "31%" as const,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 6,
  },
  count: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#64748B",
    marginTop: 18,
    textAlign: "right" as const,
  },
};
