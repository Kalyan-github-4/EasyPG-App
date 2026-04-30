import React from "react";
import { View, Text } from "react-native";

type Props = {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

export default function DetailSection({ title, children, action }: Props) {
  return (
    <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "800",
            color: "#0F172A",
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );
}
