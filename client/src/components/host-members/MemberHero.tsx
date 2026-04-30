import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "phosphor-react-native";
import type { Tenant } from "@/src/data/mock-tenants";
import TenantAvatar, { toneFromInitial } from "./TenantAvatar";
import { TENANT_STATUS_STYLE } from "./statusStyles";

type Props = {
  tenant: Tenant;
  onBack: () => void;
};

export default function MemberHero({ tenant, onBack }: Props) {
  const status = TENANT_STATUS_STYLE[tenant.status];

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
      <View
        style={{
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={18} color="#0F172A" weight="bold" />
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 14 }}>
          <TenantAvatar
            initial={tenant.initial}
            tone={toneFromInitial(tenant.initial)}
            size={84}
          />
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.3,
              marginTop: 14,
            }}
          >
            {tenant.name}
          </Text>
          <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Room {tenant.roomNumber} · {tenant.bedType} sharing
          </Text>

          <View
            style={{
              marginTop: 12,
              backgroundColor: status.bg,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: status.fg }}>
              {status.label}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
