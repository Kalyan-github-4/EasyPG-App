import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { House } from "phosphor-react-native";
import type { InquiryThread } from "@/src/services/api";

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(0, Math.floor((now - then) / 1000));
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function initialOf(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}

type Props = {
  thread: InquiryThread;
  currentUserId: string;
  onPress: () => void;
};

export default function ThreadRow({ thread, currentUserId, onPress }: Props) {
  const { inquiry, property, counterpart } = thread;
  const unread =
    inquiry.guestId === currentUserId
      ? inquiry.guestUnread
      : inquiry.hostUnread;
  const hasUnread = unread > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
        backgroundColor: "#fff",
      }}
    >
      {/* Avatar / property cover */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          overflow: "hidden",
          backgroundColor: "#E2E8F0",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {property.coverUrl ? (
          <Image
            source={{ uri: property.coverUrl }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : counterpart.avatarUrl ? (
          <Image
            source={{ uri: counterpart.avatarUrl }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#64748B" }}>
            {initialOf(counterpart.name)}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: hasUnread ? "800" : "700",
              color: "#0F172A",
              letterSpacing: -0.1,
            }}
          >
            {counterpart.name}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: hasUnread ? "#2563EB" : "#94A3B8",
              fontWeight: hasUnread ? "700" : "500",
            }}
          >
            {relTime(inquiry.lastMessageAt)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 2,
            marginBottom: 3,
          }}
        >
          <House size={10} color="#94A3B8" weight="fill" />
          <Text
            numberOfLines={1}
            style={{ flex: 1, fontSize: 11, color: "#94A3B8", fontWeight: "600" }}
          >
            {property.name}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 12,
              color: hasUnread ? "#0F172A" : "#64748B",
              fontWeight: hasUnread ? "600" : "400",
            }}
          >
            {inquiry.lastMessagePreview || "No messages yet"}
          </Text>
          {hasUnread ? (
            <View
              style={{
                minWidth: 20,
                height: 20,
                paddingHorizontal: 6,
                borderRadius: 10,
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}>
                {unread > 99 ? "99+" : unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
