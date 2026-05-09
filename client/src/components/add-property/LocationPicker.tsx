import React from "react";
import { Platform, View, Text } from "react-native";
import Constants from "expo-constants";

type Coordinates = { latitude: number; longitude: number };
type Props = {
  city: string;
  location: string;
  value: Coordinates | null;
  onChange: (coords: Coordinates) => void;
};

/** Returns true when running inside Expo Go (not a dev build). */
function isExpoGo(): boolean {
  return Constants.executionEnvironment === "storeClient";
}

/**
 * Platform-aware LocationPicker.
 * Uses lazy require() so the native react-native-maps module
 * is never loaded in Expo Go or on web.
 */
export default function LocationPicker(props: Props) {
  if (Platform.OS === "web") {
    const Comp = require("./LocationPicker.web").default;
    return <Comp {...props} />;
  }

  // On native: only load the map component if NOT in Expo Go
  if (!isExpoGo()) {
    try {
      const Comp = require("./LocationPickerMap").default;
      return <Comp {...props} />;
    } catch {
      // fall through to fallback
    }
  }

  // Fallback for Expo Go where react-native-maps native module is not linked
  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
        Map not available
      </Text>
      <Text style={{ fontSize: 14, color: "#64748B", lineHeight: 20 }}>
        Native maps require a development build. The map picker is not
        available in Expo Go. Run{" "}
        <Text style={{ fontWeight: "700" }}>npx expo run:android</Text> or{" "}
        <Text style={{ fontWeight: "700" }}>npx expo run:ios</Text> to use this
        feature.
      </Text>
    </View>
  );
}