import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onSettingsPress?: () => void;
};

export default function ProfileHeader({ onSettingsPress }: Props) {
  return (
    <SafeAreaView edges={["top"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: "#0F172A",
            letterSpacing: -0.5,
          }}
        >
          Profile
        </Text>
        <TouchableOpacity
          onPress={onSettingsPress}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F1F5F9",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="settings-outline" size={19} color="#64748B" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
