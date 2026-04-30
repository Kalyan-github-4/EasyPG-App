import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus } from "phosphor-react-native";

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onAdd?: () => void;
};

export default function MembersHeader({ title, subtitle, onBack, onAdd }: Props) {
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 14,
          gap: 12,
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
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {onAdd ? (
          <TouchableOpacity
            onPress={onAdd}
            activeOpacity={0.85}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#2563EB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={18} color="#fff" weight="bold" />
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
