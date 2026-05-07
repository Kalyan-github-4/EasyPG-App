import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "phosphor-react-native";

type Props = {
  count: number;
  onAdd: () => void;
};

export default function HostListingsHeader({ count, onAdd }: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#0F172A",
            letterSpacing: -0.5,
          }}
        >
          Listings
        </Text>
        <Text style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>
          {count} {count === 1 ? "property" : "properties"}
        </Text>
      </View>

      <TouchableOpacity onPress={onAdd} activeOpacity={0.85}>
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 12,
          }}
        >
          <Plus size={14} color="#fff" weight="bold" />
          <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
            Add property
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
