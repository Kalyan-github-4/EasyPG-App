import React from "react";
import { View, Text, Image } from "react-native";

type Props = {
  firstName: string;
  avatarUrl?: string | null;
  subtitle?: string;
};

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HostHeader({ firstName, avatarUrl, subtitle }: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
      }}
    >

      {/* Main Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Name + Subtitle */}
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#64748B",
              fontWeight: "800",
            }}
          >
            {greetingFor()} {firstName},
          </Text>

          {subtitle ? (
            <Text
              style={{
                fontSize: 14,
                color: "#64748B",
                marginTop: 6,
                lineHeight: 20,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Avatar */}
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#E2E8F0",
            }}
          />
        ) : (
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#DBEAFE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#2563EB",
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}