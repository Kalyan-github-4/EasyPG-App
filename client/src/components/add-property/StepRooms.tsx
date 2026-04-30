import React from "react";
import { ScrollView, View, Text, TextInput } from "react-native";
import type { FormState, Action } from "./types";

type Props = {
  state: FormState;
  dispatch: React.Dispatch<Action>;
};

export default function StepRooms({ state, dispatch }: Props) {
  const formatted =
    state.rent && /^\d+$/.test(state.rent)
      ? `₹${Number(state.rent).toLocaleString("en-IN")}`
      : "";

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text style={styles.h1}>What&apos;s the monthly rent?</Text>
      <Text style={styles.sub}>Per person, per month. You can change this later.</Text>

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
        <Text style={styles.hint}>Enter a whole number in INR.</Text>
      )}
    </ScrollView>
  );
}

const styles = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: "#0F172A", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748B", marginBottom: 28, lineHeight: 20 },
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
