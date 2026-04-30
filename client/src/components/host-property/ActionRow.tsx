import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Switch } from "react-native";
import { CaretRight } from "phosphor-react-native";

type Props = {
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
  iconColor?: string;
  iconBg?: string;
  label: string;
  description?: string;
  destructive?: boolean;
  loading?: boolean;
  onPress?: () => void;
  toggle?: { value: boolean; onChange: (v: boolean) => void };
};

export default function ActionRow({
  Icon,
  iconColor = "#2563EB",
  iconBg = "#EFF6FF",
  label,
  description,
  destructive,
  loading,
  onPress,
  toggle,
}: Props) {
  const isToggle = Boolean(toggle);

  return (
    <TouchableOpacity
      onPress={isToggle ? undefined : onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={loading || (!onPress && !isToggle)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: destructive ? "#FEE2E2" : iconBg,
        }}
      >
        <Icon
          size={20}
          color={destructive ? "#DC2626" : iconColor}
          weight="bold"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: destructive ? "#DC2626" : "#0F172A",
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#2563EB" />
      ) : toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onChange}
          trackColor={{ false: "#CBD5E1", true: "#10B981" }}
          thumbColor="#fff"
        />
      ) : (
        <CaretRight size={16} color="#CBD5E1" weight="bold" />
      )}
    </TouchableOpacity>
  );
}
