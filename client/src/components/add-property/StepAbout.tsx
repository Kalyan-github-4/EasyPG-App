import React from "react";
import { ScrollView, View, Text, TextInput } from "react-native";
import type { FormState, Action } from "./types";

type Props = {
  state: FormState;
  dispatch: React.Dispatch<Action>;
};

export default function StepAbout({ state, dispatch }: Props) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text style={styles.h1}>Tell guests about your PG</Text>
      <Text style={styles.sub}>
        Optional, but listings with a clear description get 3× more inquiries.
      </Text>

      <TextInput
        value={state.description}
        onChangeText={(v) =>
          dispatch({ type: "SET_FIELD", field: "description", value: v })
        }
        placeholder="House rules, meal timings, nearby landmarks, who this PG is ideal for…"
        placeholderTextColor="#94A3B8"
        multiline
        style={styles.textarea}
        maxLength={2000}
      />
      <Text style={styles.counter}>{state.description.length}/2000</Text>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>What to include</Text>
        <Bullet>Meal timings and menu style (veg / non-veg)</Bullet>
        <Bullet>House rules (guests, curfew, quiet hours)</Bullet>
        <Bullet>Nearby colleges, metro stations, markets</Bullet>
        <Bullet>Security deposit and notice period</Bullet>
      </View>
    </ScrollView>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
      <Text style={{ color: "#2563EB", fontWeight: "700" }}>•</Text>
      <Text style={{ color: "#475569", fontSize: 12, flex: 1, lineHeight: 18 }}>
        {children}
      </Text>
    </View>
  );
}

const styles = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: "#0F172A", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 20 },
  textarea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 160,
    textAlignVertical: "top" as const,
  },
  counter: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
    textAlign: "right" as const,
  },
  tipBox: {
    marginTop: 24,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 14,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: "#0F172A",
    marginBottom: 2,
  },
};
