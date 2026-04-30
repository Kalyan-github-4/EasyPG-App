import React from "react";
import { View, Text } from "react-native";
import type { IconProps } from "phosphor-react-native";

type IconCmp = React.ComponentType<IconProps>;

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 18 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#F1F5F9",
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

type InfoRowProps = {
  Icon: IconCmp;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value: string;
  meta?: React.ReactNode;
};

export function InfoRow({
  Icon,
  iconColor = "#2563EB",
  iconBg = "#EFF6FF",
  label,
  value,
  meta,
}: InfoRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 13,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={17} color={iconColor} weight="fill" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "600" }}>
          {label}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#0F172A",
            fontWeight: "700",
            marginTop: 2,
          }}
        >
          {value}
        </Text>
      </View>
      {meta}
    </View>
  );
}

export function RowSeparator() {
  return (
    <View
      style={{ height: 1, marginLeft: 62, backgroundColor: "#F1F5F9" }}
    />
  );
}
