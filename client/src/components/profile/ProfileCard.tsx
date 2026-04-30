import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileAvatar from "./ProfileAvatar";

type Stat = { value: string; label: string; icon: keyof typeof Ionicons.glyphMap };

const DEFAULT_STATS: Stat[] = [
  { value: "6", label: "Saved", icon: "heart-outline" },
  { value: "3", label: "Visited", icon: "eye-outline" },
  { value: "2", label: "Reviews", icon: "star-outline" },
];

type Props = {
  avatarUrl?: string | null;
  displayName: string;
  email: string;
  isHost: boolean;
  memberSince: string;
  uploadingAvatar?: boolean;
  onAvatarPress: () => void;
  stats?: Stat[];
};

export default function ProfileCard({
  avatarUrl,
  displayName,
  email,
  isHost,
  memberSince,
  uploadingAvatar,
  onAvatarPress,
  stats = DEFAULT_STATS,
}: Props) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 8,
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <ProfileAvatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          uploading={uploadingAvatar}
          onPress={onAvatarPress}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#0F172A",
              letterSpacing: -0.3,
            }}
          >
            {displayName}
          </Text>
          <Text style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>
            {email}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: isHost ? "#F0FDF4" : "#EFF6FF",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Ionicons
                name={isHost ? "home" : "school-outline"}
                size={11}
                color={isHost ? "#10B981" : "#2563EB"}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: isHost ? "#10B981" : "#2563EB",
                }}
              >
                {isHost ? "Host" : "Guest"}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: "#CBD5E1" }}>
              Member since {memberSince}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
          paddingTop: 18,
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
        }}
      >
        {stats.map((stat, idx) => (
          <React.Fragment key={stat.label}>
            <StatItem {...stat} />
            {idx < stats.length - 1 ? (
              <View style={{ width: 1, backgroundColor: "#F1F5F9" }} />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function StatItem({ value, label, icon }: Stat) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Ionicons name={icon} size={14} color="#2563EB" />
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>
          {value}
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "500" }}>
        {label}
      </Text>
    </View>
  );
}
