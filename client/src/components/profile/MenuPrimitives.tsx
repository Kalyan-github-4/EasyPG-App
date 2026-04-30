import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginHorizontal: 24,
        marginTop: 24,
        marginBottom: 10,
      }}
    >
      {label}
    </Text>
  );
}

export function MenuCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
      }}
    >
      {children}
    </View>
  );
}

export type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  loading?: boolean;
};

export function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  loading,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      disabled={loading}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: "#F8FAFC",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={18} color="#64748B" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, color: "#0F172A", fontWeight: "600" }}>
          {label}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#94A3B8" />
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      )}
    </TouchableOpacity>
  );
}

export function Divider() {
  return (
    <View style={{ height: 1, backgroundColor: "#F8FAFC", marginLeft: 66 }} />
  );
}
