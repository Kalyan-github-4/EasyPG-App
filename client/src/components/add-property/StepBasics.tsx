import React from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { House, CookingPot, Buildings } from "phosphor-react-native";
import type { PropertyType } from "@/src/services/api";
import type { FormState, Action } from "./types";

type Props = {
  state: FormState;
  dispatch: React.Dispatch<Action>;
};

const PROPERTY_TYPES: {
  value: PropertyType;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  desc: string;
}[] = [
  { value: "pg", label: "PG", Icon: House, desc: "Paying Guest" },
  { value: "mess", label: "Mess", Icon: CookingPot, desc: "Food + Stay" },
  { value: "hostel", label: "Hostel", Icon: Buildings, desc: "Shared Rooms" },
];

export default function StepBasics({ state, dispatch }: Props) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
    >
      <Text style={styles.h1}>What should we call your PG?</Text>
      <Text style={styles.sub}>Give it a name, city, and pincode guests will recognize.</Text>

      {/* Property Type */}
      <Label>Property Type</Label>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        {PROPERTY_TYPES.map((pt) => {
          const active = state.propertyType === pt.value;
          return (
            <TouchableOpacity
              key={pt.value}
              activeOpacity={0.8}
              onPress={() =>
                dispatch({ type: "SET_PROPERTY_TYPE", value: pt.value })
              }
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
              <pt.Icon
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
                {pt.label}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: active ? "#3B82F6" : "#94A3B8",
                  marginTop: 2,
                }}
              >
                {pt.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Label>Property Name</Label>
      <TextInput
        value={state.name}
        onChangeText={(v) =>
          dispatch({ type: "SET_FIELD", field: "name", value: v })
        }
        placeholder="e.g. Sunrise PG for Boys"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        maxLength={120}
        autoCapitalize="words"
      />
      <Hint>{state.name.length}/120</Hint>

      <View style={{ height: 18 }} />

      <Label>City</Label>
      <TextInput
        value={state.city}
        onChangeText={(v) =>
          dispatch({ type: "SET_FIELD", field: "city", value: v })
        }
        placeholder="Enter your city"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        maxLength={80}
        autoCapitalize="words"
      />
      <Hint>Type the city name exactly how you want guests to see it.</Hint>

      <View style={{ height: 18 }} />

      <Label>Pincode</Label>
      <TextInput
        value={state.pincode}
        onChangeText={(v) =>
          dispatch({ type: "SET_FIELD", field: "pincode", value: v.replace(/\D/g, "") })
        }
        placeholder="6-digit pincode"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="postalCode"
      />
      <Hint>Used to tighten the location search in the next step.</Hint>

      <View style={{ height: 18 }} />

      <Label>Full Address</Label>
      <TextInput
        value={state.location}
        onChangeText={(v) =>
          dispatch({ type: "SET_FIELD", field: "location", value: v })
        }
        placeholder="Street, locality, landmark, pincode"
        placeholderTextColor="#94A3B8"
        multiline
        style={[styles.input, { height: 90, textAlignVertical: "top" }]}
        maxLength={500}
      />
      <Hint>Guests can see this before booking — be specific.</Hint>
    </ScrollView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}
function Hint({ children }: { children: React.ReactNode }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = {
  h1: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#0F172A",
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
  },
  hint: { fontSize: 11, color: "#94A3B8", marginTop: 6 },
};
