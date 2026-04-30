import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CaretRight, DoorOpen } from "phosphor-react-native";
import type { Tenant } from "@/src/data/mock-tenants";
import PaymentStatusPill from "./PaymentStatusPill";
import TenantAvatar, { toneFromInitial } from "./TenantAvatar";

type Props = {
  tenant: Tenant;
  onPress: () => void;
};

export default function MemberCard({ tenant, onPress }: Props) {
  const joined = new Date(tenant.joinedOn).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <TenantAvatar initial={tenant.initial} tone={toneFromInitial(tenant.initial)} size={48} />

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.2,
              flexShrink: 1,
            }}
          >
            {tenant.name}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <DoorOpen size={12} color="#64748B" weight="fill" />
            <Text style={{ fontSize: 12, color: "#475569", fontWeight: "600" }}>
              Room {tenant.roomNumber}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: "#CBD5E1" }}>•</Text>
          <Text style={{ fontSize: 12, color: "#64748B" }}>
            Since {joined}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
          <PaymentStatusPill status={tenant.currentPayment} />
          <Text style={{ fontSize: 11, color: "#94A3B8" }}>
            ₹{tenant.rent.toLocaleString("en-IN")}/mo
          </Text>
        </View>
      </View>

      <CaretRight size={16} color="#CBD5E1" weight="bold" />
    </TouchableOpacity>
  );
}
