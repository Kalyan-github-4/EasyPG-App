import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  firstName: string;
  avatarUrl?: string | null;
  subtitle?: string;
  onProfilePress?: () => void;
};

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HostHeader({ firstName, avatarUrl, subtitle, onProfilePress }: Props) {
  return (
    <LinearGradient
      colors={["#1D4ED8", "#60A5FA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
    >
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 18,
          paddingBottom: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              fontWeight: "700",
              letterSpacing: 0.2,
              textTransform: "uppercase",
            }}
          >
            Host dashboard
          </Text>
          <Text
            style={{
              fontSize: 24,
              color: "#fff",
              fontWeight: "800",
              marginTop: 4,
              letterSpacing: -0.5,
            }}
          >
            {greetingFor()} {firstName}
          </Text>

          {subtitle ? (
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.85)",
                marginTop: 6,
                lineHeight: 19,
              }}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.85}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.4)",
                backgroundColor: "#E2E8F0",
              }}
            />
          ) : (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: "rgba(255,255,255,0.18)",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#fff",
                }}
              >
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}