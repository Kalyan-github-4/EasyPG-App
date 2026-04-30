import React from "react";
import { View, Text } from "react-native";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function PropertyDetailSection({ title, children }: Props) {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 22 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "800",
          color: "#0F172A",
          marginBottom: 12,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
