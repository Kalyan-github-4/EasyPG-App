import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  avatarUrl?: string | null;
  displayName: string;
  uploading?: boolean;
  onPress: () => void;
  size?: number;
};

export default function ProfileAvatar({
  avatarUrl,
  displayName,
  uploading = false,
  onPress,
  size = 68,
}: Props) {
  const radius = size / 2;
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={uploading}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: 3,
            borderColor: "#EFF6FF",
          }}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: "#EFF6FF",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 3,
            borderColor: "#DBEAFE",
          }}
        >
          <Text
            style={{
              fontSize: size * 0.41,
              fontWeight: "800",
              color: "#2563EB",
            }}
          >
            {initial}
          </Text>
        </View>
      )}

      {/* Camera badge */}
      <View
        style={{
          position: "absolute",
          right: -2,
          bottom: -2,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: "#2563EB",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "#fff",
          elevation: 4,
          shadowColor: "#0F172A",
          shadowOpacity: 0.18,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Ionicons name="camera" size={12} color="#fff" />
      </View>

      {/* Uploading overlay */}
      {uploading ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="small" color="#fff" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
