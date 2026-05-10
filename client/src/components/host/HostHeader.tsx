import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, GearSix } from "phosphor-react-native";
import { router } from "expo-router";
import { useNotifications } from "@/src/hooks/useNotifications";

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
  const { unreadCount } = useNotifications();

  return (
    <LinearGradient
      colors={["#1D4ED8", "#60A5FA"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
      }}
    >
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 24,
          }}
        >
          {/* Top row: avatar + actions */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {/* Avatar + name */}
            <TouchableOpacity
              onPress={onProfilePress}
              activeOpacity={0.85}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.3)",
                    backgroundColor: "#E2E8F0",
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  Host Dashboard
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: "#fff",
                    marginTop: 1,
                    letterSpacing: -0.3,
                  }}
                >
                  {greetingFor()}, {firstName}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Action icons */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {/* Bell */}
              <TouchableOpacity
                onPress={() => router.push("/(app)/inbox" as any)}
                activeOpacity={0.8}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={19} color="#fff" weight="regular" />
                {unreadCount > 0 ? (
                  <View
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      minWidth: 16,
                      height: 16,
                      paddingHorizontal: 4,
                      borderRadius: 8,
                      backgroundColor: "#EF4444",
                      borderWidth: 1.5,
                      borderColor: "#1E3A8A",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 9, fontWeight: "800", color: "#fff" }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>
          </View>

          {/* Subtitle */}
          {subtitle ? (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: "600",
                  lineHeight: 19,
                }}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}