import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
};

export default function SignOutButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        marginHorizontal: 20,
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 15,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#FEE2E2",
      }}
    >
      <Ionicons name="log-out-outline" size={18} color="#EF4444" />
      <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: "700" }}>
        Log Out
      </Text>
    </TouchableOpacity>
  );
}
