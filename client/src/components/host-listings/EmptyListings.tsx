import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { House, Plus } from "phosphor-react-native";

type Props = {
  onAdd: () => void;
  filterLabel?: string;
};

export default function EmptyListings({ onAdd, filterLabel }: Props) {
  const filtered = Boolean(filterLabel);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingTop: 48,
        paddingBottom: 48,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#EFF6FF",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <House size={32} color="#2563EB" weight="duotone" />
      </View>

      <Text
        style={{
          fontSize: 17,
          fontWeight: "800",
          color: "#0F172A",
          textAlign: "center",
          letterSpacing: -0.2,
        }}
      >
        {filtered ? `No ${filterLabel} listings` : "No listings yet"}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: "#64748B",
          textAlign: "center",
          marginTop: 6,
          lineHeight: 19,
          maxWidth: 280,
        }}
      >
        {filtered
          ? "Try switching the filter to see other properties."
          : "Add your first property to start receiving inquiries from guests."}
      </Text>

      {!filtered ? (
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.85}
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#2563EB",
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Plus size={16} color="#fff" weight="bold" />
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}>
            Add your first property
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
