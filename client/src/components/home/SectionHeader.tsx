import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CaretRight } from "phosphor-react-native";

type Props = {
  title: string;
  subtitle?: string;
  icon?: string;
  onSeeAll?: () => void;
};

export default function SectionHeader({ title, subtitle, icon, onSeeAll }: Props) {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      marginBottom: 14,
    }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon && (
            <View style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Ionicons name={icon as any} size={15} color="#2563EB" />
            </View>
          )}
          <View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3 }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{
                fontSize: 12,
                fontWeight: "500",
                color: "#94A3B8",
                marginTop: 3,
              }}>
                {subtitle}
              </Text>
            )}
          </View>

        </View>

      </View>
      {onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          style={{
            flexDirection: "row", alignItems: "center", width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: "#EFF6FF",
            justifyContent: "center",
          }}
        >
          {/* <Text style={{ fontSize: 13, fontWeight: "600", color: "#2563EB" }}>See all</Text> */}
          <CaretRight size={16} color="#2563EB" />
        </TouchableOpacity>
      )}
    </View>
  );
}
