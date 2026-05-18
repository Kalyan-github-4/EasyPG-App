import React from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { GenderMale, GenderFemale, Users, User, UsersFour, UsersThree, Bed } from "phosphor-react-native";
import type { PropertyGender, OccupancyType } from "@/src/services/api";
import type { FormState, Action } from "./types";

type Props = {
  state: FormState;
  dispatch: React.Dispatch<Action>;
};

const GENDER_OPTIONS: {
  value: PropertyGender;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  desc: string;
}[] = [
  { value: "boys", label: "Boys", Icon: GenderMale, desc: "Male only" },
  { value: "girls", label: "Girls", Icon: GenderFemale, desc: "Female only" },
  { value: "any", label: "Co-ed", Icon: Users, desc: "Any gender" },
];

const OCCUPANCY_OPTIONS: {
  value: OccupancyType;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  desc: string;
}[] = [
  { value: "single", label: "Single", Icon: User, desc: "1 person / room" },
  { value: "double", label: "Double", Icon: UsersThree, desc: "2 per room" },
  { value: "triple", label: "Triple", Icon: UsersFour, desc: "3 per room" },
  { value: "shared", label: "Shared", Icon: Bed, desc: "4+ / dorm" },
];

export default function StepRooms({ state, dispatch }: Props) {
  const formatted =
    state.rent && /^\d+$/.test(state.rent)
      ? `₹${Number(state.rent).toLocaleString("en-IN")}`
      : "";

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
    >
      <Text style={styles.h1}>Room &amp; pricing details</Text>
      <Text style={styles.sub}>Set your rent, who it's for, and the room setup.</Text>

      {/* Monthly Rent */}
      <Label>Monthly Rent</Label>
      <View style={styles.inputRow}>
        <Text style={styles.currency}>₹</Text>
        <TextInput
          value={state.rent}
          onChangeText={(v) =>
            dispatch({ type: "SET_FIELD", field: "rent", value: v.replace(/[^\d]/g, "") })
          }
          placeholder="8000"
          placeholderTextColor="#CBD5E1"
          keyboardType="number-pad"
          style={styles.rentInput}
          maxLength={7}
        />
      </View>
      {formatted ? (
        <Text style={styles.preview}>{formatted} / month</Text>
      ) : (
        <Text style={styles.hint}>Per person, per month. You can change this later.</Text>
      )}

      <View style={{ height: 28 }} />

      {/* Gender Selection */}
      <Label>Preferred For</Label>
      <Text style={styles.sectionHint}>Who is this property for?</Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 6 }}>
        {GENDER_OPTIONS.map((opt) => {
          const active = state.gender === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.8}
              onPress={() => dispatch({ type: "SET_GENDER", value: opt.value })}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 8,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: active ? "#2563EB" : "#E2E8F0",
                backgroundColor: active ? "#EFF6FF" : "#fff",
              }}
            >
              <opt.Icon
                size={24}
                color={active ? "#2563EB" : "#94A3B8"}
                weight={active ? "fill" : "regular"}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: active ? "#2563EB" : "#0F172A",
                  marginTop: 6,
                }}
              >
                {opt.label}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: active ? "#3B82F6" : "#94A3B8",
                  marginTop: 2,
                }}
              >
                {opt.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 28 }} />

      {/* Occupancy Type */}
      <Label>Room Type</Label>
      <Text style={styles.sectionHint}>How many people share a room?</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
        {OCCUPANCY_OPTIONS.map((opt) => {
          const active = state.occupancyType === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.8}
              onPress={() => dispatch({ type: "SET_OCCUPANCY_TYPE", value: opt.value })}
              style={{
                width: "47%" as any,
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 8,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: active ? "#2563EB" : "#E2E8F0",
                backgroundColor: active ? "#EFF6FF" : "#fff",
              }}
            >
              <opt.Icon
                size={22}
                color={active ? "#2563EB" : "#94A3B8"}
                weight={active ? "fill" : "regular"}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: active ? "#2563EB" : "#0F172A",
                  marginTop: 6,
                }}
              >
                {opt.label}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: active ? "#3B82F6" : "#94A3B8",
                  marginTop: 2,
                }}
              >
                {opt.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: "#0F172A", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748B", marginBottom: 24, lineHeight: 20 },
  label: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#334155",
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 12,
    marginTop: -4,
  },
  inputRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  currency: { fontSize: 28, fontWeight: "700" as const, color: "#94A3B8", marginRight: 8 },
  rentInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#0F172A",
    padding: 0,
  },
  preview: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#2563EB",
    marginTop: 12,
  },
  hint: { fontSize: 12, color: "#94A3B8", marginTop: 10 },
};
