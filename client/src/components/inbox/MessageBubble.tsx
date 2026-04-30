import React from "react";
import { View, Text } from "react-native";

type Props = {
  body: string;
  createdAt: string;
  isMine: boolean;
  showTail: boolean;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function MessageBubble({
  body,
  createdAt,
  isMine,
  showTail,
}: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: isMine ? "flex-end" : "flex-start",
        paddingHorizontal: 14,
        marginBottom: showTail ? 8 : 2,
      }}
    >
      <View
        style={{
          maxWidth: "78%",
          paddingHorizontal: 13,
          paddingVertical: 9,
          borderRadius: 18,
          borderBottomRightRadius: isMine && showTail ? 4 : 18,
          borderBottomLeftRadius: !isMine && showTail ? 4 : 18,
          backgroundColor: isMine ? "#2563EB" : "#fff",
          borderWidth: isMine ? 0 : 1,
          borderColor: "#F1F5F9",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: isMine ? "#fff" : "#0F172A",
          }}
        >
          {body}
        </Text>
        {showTail ? (
          <Text
            style={{
              fontSize: 10,
              marginTop: 4,
              color: isMine ? "rgba(255,255,255,0.75)" : "#94A3B8",
              textAlign: "right",
            }}
          >
            {formatTime(createdAt)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
