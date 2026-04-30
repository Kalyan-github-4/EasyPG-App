import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CalendarCheckIcon, ChatCircleIcon, PhoneIcon } from "phosphor-react-native";

type Props = {
  isHostOfThis: boolean;
  hasPhone: boolean;
  isAvailable: boolean;
  onCall: () => void;
  onMessage: () => void;
  onBook: () => void;
};

export default function PropertyStickyActions({
  isHostOfThis,
  hasPhone,
  isAvailable,
  onCall,
  onMessage,
  onBook,
}: Props) {
  if (isHostOfThis) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        flexDirection: "row",
        gap: 10,
      }}
    >
      {hasPhone ? (
        <TouchableOpacity
          onPress={onCall}
          activeOpacity={0.85}
          style={{
            width: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: "#A7F3D0",
            backgroundColor: "#ECFDF5",
          }}
        >
          <PhoneIcon size={20} color="#059669" weight="fill" />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        onPress={onMessage}
        activeOpacity={0.85}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: "#2563EB",
        }}
      >
        <ChatCircleIcon size={18} color="#2563EB" weight="bold" />
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#2563EB" }}>
          Message
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onBook}
        activeOpacity={0.85}
        disabled={!isAvailable}
        style={{
          flex: 1.3,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: isAvailable ? "#2563EB" : "#CBD5E1",
        }}
      >
        <CalendarCheckIcon size={18} color="#fff" weight="bold" />
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>
          {isAvailable ? "Request Visit" : "Unavailable"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
