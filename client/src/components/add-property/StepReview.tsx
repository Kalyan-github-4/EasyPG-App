import React from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { FormState, Action } from "./types";
import { FACILITY_META } from "./types";

const GENDER_LABELS: Record<string, string> = {
  boys: "Boys Only",
  girls: "Girls Only",
  any: "Co-ed (Any)",
};

const OCCUPANCY_LABELS: Record<string, string> = {
  single: "Single Occupancy",
  double: "Double Sharing",
  triple: "Triple Sharing",
  shared: "Shared / Dorm",
};

type Props = {
  state: FormState;
  dispatch: React.Dispatch<Action>;
};

export default function StepReview({ state, dispatch }: Props) {
  const cover = state.photos?.[0];
  const rent = state.rent ? Number(state.rent).toLocaleString("en-IN") : "";

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.h1}>Review your listing</Text>
      <Text style={styles.sub}>One last look before it goes live.</Text>

      {/* Cover + name */}
      <View style={styles.card}>
        {cover?.url ? (
          <Image source={{ uri: cover.url }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: "#E2E8F0" }]} />
        )}
        <View style={{ padding: 14 }}>
          <Text style={styles.propertyName}>{state.name || "—"}</Text>
          <Text style={styles.location} numberOfLines={2}>
            {state.location || "—"}
          </Text>
          <Text style={styles.rent}>
            ₹{rent || "—"}
            <Text style={styles.rentSub}> / month</Text>
          </Text>
        </View>
      </View>

      {/* Sections */}
      <Section label="Basics" onEdit={() => dispatch({ type: "GOTO", step: 0 })}>
        <Row label="Name" value={state.name || "—"} />
        <Row label="City" value={state.city || "—"} />
        <Row label="Pincode" value={state.pincode || "—"} />
        <Row label="Address" value={state.location || "—"} />
        <Row
          label="Coordinates"
          value={
            state.latitude !== null && state.longitude !== null
              ? `${state.latitude.toFixed(5)}, ${state.longitude.toFixed(5)}`
              : "—"
          }
        />
      </Section>

      <Section label="Location" onEdit={() => dispatch({ type: "GOTO", step: 1 })}>
        <Row
          label="Pin"
          value={
            state.latitude !== null && state.longitude !== null
              ? "Selected"
              : "Not set"
          }
        />
      </Section>

      <Section label="Room & Pricing" onEdit={() => dispatch({ type: "GOTO", step: 2 })}>
        <Row label="Rent" value={rent ? `₹${rent} / month` : "—"} />
        <Row label="Preferred For" value={GENDER_LABELS[state.gender] || state.gender} />
        <Row label="Room Type" value={OCCUPANCY_LABELS[state.occupancyType] || state.occupancyType} />
      </Section>

      <Section label="Amenities" onEdit={() => dispatch({ type: "GOTO", step: 3 })}>
        {state.facilities.length === 0 ? (
          <Text style={styles.empty}>None selected</Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {state.facilities.map((f) => {
              const meta = FACILITY_META.find((m) => m.type === f);
              return (
                <View key={f} style={styles.chip}>
                  {meta && <meta.Icon size={13} color="#2563EB" weight="fill" />}
                  <Text style={styles.chipText}>{meta?.label || f}</Text>
                </View>
              );
            })}
          </View>
        )}
      </Section>

      <Section label="Photos" onEdit={() => dispatch({ type: "GOTO", step: 4 })}>
        {state.photos.length === 0 ? (
          <Text style={styles.empty}>No photos added</Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {state.photos.slice(0, 6).map((p) => (
              <Image
                key={p.localId}
                source={{ uri: p.url || p.uri }}
                style={{ width: 56, height: 56, borderRadius: 6, backgroundColor: "#E2E8F0" }}
              />
            ))}
            {state.photos.length > 6 && (
              <View style={styles.morePhotos}>
                <Text style={styles.morePhotosText}>+{state.photos.length - 6}</Text>
              </View>
            )}
          </View>
        )}
      </Section>

      <Section label="Description" onEdit={() => dispatch({ type: "GOTO", step: 5 })}>
        {state.description.trim() ? (
          <Text style={styles.descText}>{state.description}</Text>
        ) : (
          <Text style={styles.empty}>No description</Text>
        )}
      </Section>
    </ScrollView>
  );
}

function Section({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={styles.editBtn}>
          <Ionicons name="pencil" size={12} color="#2563EB" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: "#0F172A", marginBottom: 6 },
  sub: { fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 18,
  },
  cover: { width: "100%" as const, aspectRatio: 16 / 9 },
  propertyName: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#0F172A",
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 10,
    lineHeight: 17,
  },
  rent: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#2563EB",
  },
  rentSub: { fontSize: 12, fontWeight: "600" as const, color: "#94A3B8" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 10,
  },
  sectionLabel: { fontSize: 12, fontWeight: "800" as const, color: "#0F172A", letterSpacing: 0.5 },
  editBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
  },
  editText: { fontSize: 11, fontWeight: "700" as const, color: "#2563EB" },
  rowLabel: { fontSize: 11, color: "#94A3B8", marginBottom: 2 },
  rowValue: { fontSize: 14, color: "#0F172A", fontWeight: "600" as const },
  empty: { fontSize: 13, color: "#94A3B8", fontStyle: "italic" as const },
  chip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: { fontSize: 12, fontWeight: "700" as const, color: "#1E40AF" },
  morePhotos: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: "#0F172A",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  morePhotosText: { color: "#fff", fontSize: 12, fontWeight: "800" as const },
  descText: { fontSize: 13, color: "#475569", lineHeight: 19 },
};
