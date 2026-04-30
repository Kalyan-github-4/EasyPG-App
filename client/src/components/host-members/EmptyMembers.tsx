import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { UsersThree, Plus } from "phosphor-react-native";

type Props = { onAdd?: () => void };

export default function EmptyMembers({ onAdd }: Props) {
  return (
    <View
      style={{
        marginTop: 60,
        alignItems: "center",
        paddingHorizontal: 32,
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
          marginBottom: 18,
        }}
      >
        <UsersThree size={32} color="#2563EB" weight="duotone" />
      </View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "800",
          color: "#0F172A",
          letterSpacing: -0.2,
        }}
      >
        No tenants yet
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: "#64748B",
          textAlign: "center",
          marginTop: 6,
          lineHeight: 19,
        }}
      >
        Add the people currently staying at this property to track rent, room allocation, and contact info in one place.
      </Text>
      {onAdd ? (
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.85}
          style={{
            marginTop: 22,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#2563EB",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Plus size={16} color="#fff" weight="bold" />
          <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
            Add tenant
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
